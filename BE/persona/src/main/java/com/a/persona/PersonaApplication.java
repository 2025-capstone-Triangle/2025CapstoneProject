package com.a.persona;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class PersonaApplication {

    public static void main(String[] args) {
        SpringApplication.run(PersonaApplication.class, args);
    }

}
