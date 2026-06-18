package com.a.persona.app.controller.admin.member.payload;

import com.a.persona.app.model.auth.code.Role;
import com.a.persona.app.model.member.code.Sex;
import com.a.persona.app.model.member.code.Status;
import com.a.persona.app.model.member.dto.MemberBlockDto;
import com.a.persona.app.model.member.dto.MemberStatDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminBlockedResponse {

    private String reason;

    private LocalDateTime blockedAt;


    public static AdminBlockedResponse from(MemberBlockDto member) {

        return AdminBlockedResponse.builder()
                .reason(member.getReason())
                .blockedAt(member.getBlockedAt())
                .build();
    }
}
