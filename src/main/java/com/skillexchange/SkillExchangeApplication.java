package com.skillexchange;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot Application Entry Point
 * Student Skill Exchange Platform - 2nd Year IT Mini Project
 */
@SpringBootApplication
public class SkillExchangeApplication {

    public static void main(String[] args) {
        SpringApplication.run(SkillExchangeApplication.class, args);
        System.out.println("==========================================================");
        System.out.println("  Student Skill Exchange Platform Started Successfully!   ");
        System.out.println("  Access Web Application at: http://localhost:8080        ");
        System.out.println("  API Documentation / Endpoints available on port 8080     ");
        System.out.println("==========================================================");
    }
}
