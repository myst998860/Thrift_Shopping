package com.event;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync  // ✅ Enables @Async methods in the app
public class BackendEventApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendEventApplication.class, args);
    }

}
