package com.example.customer_feedback.config;

import com.example.customer_feedback.entity.Role;
import com.example.customer_feedback.entity.User;
import com.example.customer_feedback.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner createAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            if (!userRepository.existsByUsername("admin")) {

                User admin = new User();

                admin.setUsername("admin");
                admin.setEmail("admin@gmail.com");

                admin.setPassword(
                        passwordEncoder.encode("admin123")
                );

                admin.setRole(Role.ADMIN);

                userRepository.save(admin);

                System.out.println(
                        "Admin created: admin / admin123"
                );
            }
        };
    }
}