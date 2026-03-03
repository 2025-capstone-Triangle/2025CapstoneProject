package com.a.persona.app.model.member.dto;

import com.a.persona.app.model.auth.code.Role;
import com.a.persona.app.model.member.code.Sex;
import com.a.persona.app.model.member.code.Status;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberStatDto {

    private Long id;

    private String username;

    private String email;

    private Role role;

    private LocalDate birth;

    private Sex sex;

    private Boolean is_creator;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Boolean isActive;

    private Status status;

    private LocalDateTime lastLoginAt;
}
