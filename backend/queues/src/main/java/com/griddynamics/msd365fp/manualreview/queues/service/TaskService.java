package com.griddynamics.msd365fp.manualreview.queues.service;

import com.azure.data.cosmos.PreconditionFailedException;
import com.griddynamics.msd365fp.manualreview.model.TaskStatus;
import com.griddynamics.msd365fp.manualreview.model.exception.BusyException;
import com.griddynamics.msd365fp.manualreview.model.exception.IncorrectConfigurationException;
import com.griddynamics.msd365fp.manualreview.queues.config.properties.ApplicationProperties;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.Task;
import com.griddynamics.msd365fp.manualreview.queues.repository.TaskRepository;
import com.microsoft.azure.spring.data.cosmosdb.exception.CosmosDBAccessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static com.griddynamics.msd365fp.manualreview.model.TaskStatus.READY;
import static com.griddynamics.msd365fp.manualreview.model.TaskStatus.RUNNING;
import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.*;

/**
 * Service for working with {@link Task}s.
 * It creates default {@link Task} documents in the database.
 * It initializes scheduled tasks on application startup.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ApplicationProperties applicationProperties;
    private final ThreadPoolTaskExecutor taskExecutor;
    private final QueueService queueService;
    private final ItemService itemService;
    private final DictionaryService dictionaryService;
    private final StreamService streamService;

    @Value("${mr.tasks.item-assignment-reconciliation-task.comprehensive-check.period}")
    private Duration comprehensiveCheckPeriod;
    @Value("${mr.tasks.item-assignment-reconciliation-task.partial-check.observed-period}")
    private Duration partialCheckObservedPeriod;

    private Map<String, TaskExecution<Object, Exception>> taskExecutions;

    @PostConstruct
    private void initializeTasks() {
        this.taskExecutions = Map.of(
                QUEUE_ASSIGNMENT_TASK_NAME, task ->
                        queueService.reconcileQueueAssignments(),
                ENRICHMENT_TASK_NAME, task ->
                        itemService.enrichAllPoorItems(false),
                OVERALL_SIZE_TASK_NAME, task ->
                        streamService.sendOverallSizeEvent(itemService.countActiveItems()),
                QUEUE_SIZE_TASK_NAME, task ->
                        queueService.fetchSizesForQueues(),
                RESIDUAL_QUEUE_TASK_NAME, task ->
                        queueService.reviseResidualQueue(),
                ITEM_UNLOCK_TASK_NAME, task ->
                        itemService.unlockItemsByTimeout(),
                DICTIONARY_TASK_NAME, task ->
                        dictionaryService.updateDictionariesByStorageData(),
                ITEM_ASSIGNMENT_TASK_NAME, this::itemStateFetch
        );

        Optional<Map.Entry<String, ApplicationProperties.TaskProperties>> incorrectTimingTask = applicationProperties.getTasks().entrySet().stream()
                .filter(entry -> entry.getValue().getDelay() == null ||
                        (entry.getValue().getTimeout() != null &&
                                entry.getValue().getTimeout().compareTo(entry.getValue().getDelay()) < 0))
                .findFirst();
        if (incorrectTimingTask.isPresent()) {
            log.error("Task [{}] has incorrect timing configuration: {}",
                    incorrectTimingTask.get().getKey(),
                    incorrectTimingTask.get().getValue());
            System.exit(1);
        }
        if (applicationProperties.getTaskWarningTimeoutMultiplier() < 1 ||
                applicationProperties.getTaskWarningTimeoutMultiplier() > applicationProperties.getTaskResetTimeoutMultiplier()) {
            log.error("Incorrect timeout multiplier configuration: [{},{}]",
                    applicationProperties.getTaskWarningTimeoutMultiplier(),
                    applicationProperties.getTaskResetTimeoutMultiplier());
            System.exit(1);
        }
    }

    public List<Task> getAllTasks() {
        List<Task> result = new ArrayList<>();
        taskRepository.findAll().forEach(result::add);
        return result;
    }

    public void setAllTasksReady() {
        List<Task> allTasks = getAllTasks();
        allTasks.forEach(task -> {
            if (!READY.equals(task.getStatus())) {
                task.setStatus(READY);
                task.setFailedStatusMessage("Restored manually");
                taskRepository.save(task);
            }
        });
    }

    public boolean forceTaskRunByName(String taskName) throws IncorrectConfigurationException {
        ApplicationProperties.TaskProperties taskProperties = applicationProperties.getTasks().get(taskName);
        if (taskProperties == null) {
            throw new IncorrectConfigurationException("Task isn't configured");
        }
        Task task = taskRepository.findById(taskName).orElseThrow(IncorrectConfigurationException::new);

        return executeTask(task, taskProperties, taskExecutions.get(taskName));
    }

    /**
     * Task runner.
     * The common scheduled method that is ran very frequently
     * and checks for {@link Task}s that are available for execution.
     * If there are such then they are executed.
     * If there are no distributed lock in the DB for particular task
     * then it will be created but task will be executed only in the next iteration.
     * If task is stuck then it'll be reported and later restored after particular
     * amount of iterations.
     */
    @Scheduled(fixedRate = TASK_RUNNER_RATE_MS)
    protected void runReadyTasks() {
        Map<String, Task> storedTasks = StreamSupport.stream(taskRepository.findAll().spliterator(), false)
                .collect(Collectors.toMap(Task::getId, task -> task));

        applicationProperties.getTasks().entrySet().stream()
                .filter(entry -> entry.getValue().isEnabled())
                .parallel()
                .forEach(taskPropertiesEntry -> {
                    String taskName = taskPropertiesEntry.getKey();
                    ApplicationProperties.TaskProperties taskProperties = taskPropertiesEntry.getValue();
                    Task task = storedTasks.get(taskName);
                    boolean taskLaunched = false;

                    // Execute task
                    if (task != null && isTaskReadyForExecutionNow(task, taskProperties)) {
                        taskLaunched = executeTask(task, taskProperties, taskExecutions.get(taskName));
                    }

                    // Create task if absent
                    if (task == null) {
                        createStoredTask(taskName);
                    }

                    // Restore task if it's stuck
                    if (task != null && !taskLaunched) {
                        restoreTaskIfStuck(task, taskProperties);
                    }
                });
    }

    private boolean isTaskReadyForExecutionNow(Task task, ApplicationProperties.TaskProperties taskProperties) {
        return task.getPreviousRun() == null ||
                task.getPreviousRun().plus(taskProperties.getDelay()).isBefore(OffsetDateTime.now());
    }

    @SuppressWarnings("java:S1854")
    private void restoreTaskIfStuck(Task task, ApplicationProperties.TaskProperties taskProperties) {
        Duration timeAfterPreviousRun;
        if (task.getPreviousRun() != null) {
            timeAfterPreviousRun = Duration.between(
                    task.getPreviousRun(), OffsetDateTime.now());
        } else {
            timeAfterPreviousRun = Duration.ZERO;
        }
        Duration timeout = Objects.requireNonNullElse(taskProperties.getTimeout(), taskProperties.getDelay());
        Duration acceptableDelayBeforeWarning = Duration.ofSeconds(
                (long) (timeout.toSeconds() * applicationProperties.getTaskWarningTimeoutMultiplier()));
        Duration acceptableDelayBeforeReset = Duration.ofSeconds(
                (long) (timeout.toSeconds() * applicationProperties.getTaskResetTimeoutMultiplier()));
        if (timeAfterPreviousRun.compareTo(acceptableDelayBeforeWarning) > 0) {
            log.warn("Task [{}] is idle for too long. Last execution was [{}] minutes ago with status message: [{}]",
                    task.getId(), timeAfterPreviousRun.toMinutes(), task.getFailedStatusMessage());
        }
        if (!READY.equals(task.getStatus()) && timeAfterPreviousRun.compareTo(acceptableDelayBeforeReset) > 0) {
            try {
                log.info("Start [{}] task restore", task.getId());
                task.setStatus(READY);
                task.setFailedStatusMessage("Restored after long downtime");
                taskRepository.save(task);
                log.info("Task [{}] has been restored", task.getId());
            } catch (CosmosDBAccessException e) {
                log.warn("Task [{}] recovering ended with a conflict: {}", task.getId(), e.getMessage());
            }
        }
    }

    private void createStoredTask(final String taskName) {
        try {
            log.info("Trying to create task [{}]", taskName);
            taskRepository.save(Task.builder()
                    .id(taskName)
                    ._etag(taskName)
                    .status(READY)
                    .build());
            log.info("Task [{}] has been initialized successfully.", taskName);
        } catch (CosmosDBAccessException e) {
            log.warn("Task [{}] creation ended with a conflict: {}", taskName, e.getMessage());
        }
    }

    /**
     * Scale-safe task executor.
     * <p>
     * Wraps task execution with some common logic of acquiring task lock,
     * releasing it and handling exceptional path.
     * </p>
     * Scheduled task uses provided {@link Task} that should be retrieved
     * from the database. The executor sets {@link Task#getStatus()} into
     * {@link TaskStatus#RUNNING} state, otherwise execution ends.
     * </p>
     * Afterwards {@link Function} task execution starts in non-blocking way.
     * </p>
     * If service's method worked as expected {@link Task#getStatus()} is set
     * to {@link TaskStatus#READY} status after execution. Finally {@link Task}
     * have to be saved to the database with updated {@link Task#getStatus()}.
     * </p>
     * In case task execution failed with an exception,
     * {@link Task#getFailedStatusMessage()} is set to
     * {@link Exception#getMessage()} and new state saved into the database.
     *
     * @param task           which should represet a lock object
     *                       from shared database
     * @param taskProperties represents local static task configuration from
     *                       application properties
     * @param taskExecution  the logic which executes during
     *                       the {@link TaskStatus#RUNNING} stage
     *                       of the {@link Task}
     * @return true if task has been sent to execution on the current instance
     */
    @SuppressWarnings("java:S2326")
    private <T, E extends Exception> boolean executeTask(
            Task task,
            ApplicationProperties.TaskProperties taskProperties,
            TaskExecution<T, E> taskExecution) {

        // check possibility to execute
        if (!READY.equals(task.getStatus())) {
            return false;
        }

        // acquire a lock
        task.setStatus(RUNNING);
        task.setPreviousRun(OffsetDateTime.now());
        Task runningTask;
        try {
            runningTask = taskRepository.save(task);
        } catch (CosmosDBAccessException e) {
            if (e.getCause() instanceof PreconditionFailedException) {
                log.debug("Could not acquire lock because task [{}] was modified by another source.", task.getId());
            } else {
                log.warn("Could not acquire lock for the task [{}].", task.getId(), e);
            }
            return false;
        }

        // get task object for usage in async execution
        log.info("Task [{}] started its execution.", runningTask.getId());

        // launch execution
        CompletableFuture
                .supplyAsync(() -> {
                    try {
                        return Optional.ofNullable(taskExecution.apply(runningTask));
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                }, taskExecutor)
                .orTimeout(
                        Objects.requireNonNullElse(taskProperties.getTimeout(), taskProperties.getDelay()).toMillis(),
                        TimeUnit.MILLISECONDS)
                .whenComplete((result, exception) -> {
                    runningTask.setStatus(READY);
                    if (exception != null) {
                        log.warn("Task [{}] finished its execution with an exception.",
                                runningTask.getId(), exception);
                        runningTask.setFailedStatusMessage(exception.getMessage());
                        taskRepository.save(runningTask);
                    } else if (result.isEmpty()) {
                        log.info("Task [{}] finished its execution with empty result.", runningTask.getId());
                    } else {
                        log.info("Task [{}] finished its execution successfully. Result: [{}]",
                                runningTask.getId(), result.get());
                    }
                    taskRepository.save(runningTask);
                });
        return true;
    }

    private boolean itemStateFetch(Task task) throws BusyException {
        // prepare required parameters
        OffsetDateTime currentRunTime = OffsetDateTime.now();
        Map<String, String> variables = Optional.ofNullable(task.getVariables()).orElse(new HashMap<>());
        String comprehensiveCheckTimeString = variables.get("comprehensiveCheckTime");
        OffsetDateTime comprehensiveCheckTime = comprehensiveCheckTimeString == null
                ? OffsetDateTime.MIN
                : OffsetDateTime.parse(comprehensiveCheckTimeString);

        // check item states (with desired checking depth)
        if (comprehensiveCheckTime.plus(comprehensiveCheckPeriod).isBefore(currentRunTime)) {
            itemService.reconcileAllItemAssignments();
            variables.put("comprehensiveCheckTime", currentRunTime.toString());
        } else {
            itemService.reconcileItemAssignmentsForChangedQueues(
                    task.getPreviousRun().minus(partialCheckObservedPeriod));
            itemService.reconcileAssignmentsForNewItems(
                    task.getPreviousRun().minus(partialCheckObservedPeriod));
        }

        task.setVariables(variables);
        return true;
    }

    @FunctionalInterface
    public interface TaskExecution<T, E extends Exception> {
        T apply(Task task) throws E;
    }
}