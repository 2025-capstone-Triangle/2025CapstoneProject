package com.a.persona.app.controller.auth.payload;

import lombok.Data;

@Data
public class DuplicationCheckRequest {
    String email;
    String username;
}
