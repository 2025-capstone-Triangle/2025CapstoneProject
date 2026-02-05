package com.a.persona.app.controller.auth.payload;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;

@Data
public class VerifyEmailRequest {

    @NotEmpty
    @Value("test@test.com")
    String email;

    String code;
}
