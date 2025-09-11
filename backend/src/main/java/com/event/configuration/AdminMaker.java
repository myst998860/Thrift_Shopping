package com.event.configuration;


import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.event.model.Admin;
import com.event.model.User;
import com.event.repository.UserRepo;


@Configuration
public class AdminMaker {
    @Autowired
    private UserRepo uRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PlatformTransactionManager txManager;

    @Bean
    public CommandLineRunner createDefaultAdmin() {
        return args -> {
            new TransactionTemplate(txManager).execute(status -> {
                String adminEmail = "admin@gmail.com";
                String adminPassword = "admin123";

                Optional<User> admin = uRepo.findByEmail(adminEmail);
                if (admin.isEmpty()) {
                    Admin newAdmin = new Admin();
                    newAdmin.setEmail(adminEmail);
                    newAdmin.setPassword(passwordEncoder.encode(adminPassword));
                    newAdmin.setFullname("admin");
                    newAdmin.setRole("admin");
                    uRepo.save(newAdmin);
                    System.out.println("Default admin user created.");
                } else {
                    System.out.println("Admin user already exists.");
                }
                return null;
            });
        };
    }
}
