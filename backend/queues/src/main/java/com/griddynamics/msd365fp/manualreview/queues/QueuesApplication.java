package com.griddynamics.msd365fp.manualreview.queues;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class QueuesApplication {

    public static void main(String[] args) {
        SpringApplication.run(QueuesApplication.class, args);
    }

}
