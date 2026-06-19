package com.a.persona.app.controller.member.payload;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;

@Getter
public class EmailRequest {
    @NotEmpty
    String email;
}
