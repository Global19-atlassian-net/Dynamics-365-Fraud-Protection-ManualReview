package com.griddynamics.msd365fp.manualreview.queues.model.persistence;

import com.microsoft.azure.spring.data.cosmosdb.core.mapping.Document;
import com.microsoft.azure.spring.data.cosmosdb.core.mapping.PartitionKey;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;

import java.util.Map;

import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.SETTINGS_CONTAINER_NAME;
import static com.griddynamics.msd365fp.manualreview.queues.config.Constants.TASK_CONTAINER_NAME;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@EqualsAndHashCode(exclude = "_etag")
@Document(collection = SETTINGS_CONTAINER_NAME)
public class Settings {
    @Id
    @PartitionKey
    private String id;
    private String type;
    private boolean active;
    private Map<String, Object> values;

    @Version
    @SuppressWarnings("java:S116")
    String _etag;
}
