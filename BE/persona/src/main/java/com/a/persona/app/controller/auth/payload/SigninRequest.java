package com.a.persona.app.controller.auth.payload;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class SigninRequest {

    @Schema(description = "사용자 아이디", example = "user01")
    private String username;
    @Schema(description = "사용자 비밀번호", example = "1234")
    private String password;
}