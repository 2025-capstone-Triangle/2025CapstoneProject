package com.a.persona.app.controller.persona.payload;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class PersonaSaveRequest {
    @NotEmpty
    String code;
    String name;
    Long thumbnail;
}
