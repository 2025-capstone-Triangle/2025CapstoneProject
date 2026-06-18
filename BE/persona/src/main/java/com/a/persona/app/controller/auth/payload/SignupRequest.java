package com.a.persona.app.controller.auth.payload;

import com.a.persona.app.model.member.code.Sex;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SignupRequest {

    @NotBlank
    @Schema(description = "사용자 아이디", example = "test")
    private String username;
    @NotBlank
    @Schema(description = "사용자 비밀번호", example = "test")
    private String password;
    @NotBlank
    @Schema(description = "사용자 이메일", example = "test@test.com")
    private String email;
    @NotBlank
    @Schema(description = "사용자 생년월일", example = "2026-01-16")
    private LocalDate birth;
    @NotBlank
    @Schema(description = "사용자 성별", example = "FEMALE")
    private Sex sex;
    @NotBlank
    @Schema(description = "크리에이터 여부", example = "true")
    private Boolean is_creator;

}
