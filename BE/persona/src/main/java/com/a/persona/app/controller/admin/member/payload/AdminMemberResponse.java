package com.a.persona.app.controller.admin.member.payload;

import com.a.persona.app.model.auth.code.Role;
import com.a.persona.app.model.member.code.Sex;
import com.a.persona.app.model.member.code.Status;
import com.a.persona.app.model.member.dto.MemberDto;
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
public class AdminMemberResponse {

    private Long id;

    private String username;

    private String email;

    private Role role;

    private LocalDate birth;

    private Sex sex;

    private Boolean is_creator;

    private LocalDateTime createdAt;

    private Status status;

    public static AdminMemberResponse from(MemberDto member) {
        return AdminMemberResponse.builder()
                .id(member.getId())
                .username(member.getUsername())
                .email(member.getEmail())
                .role(member.getRole())
                .birth(member.getBirth())
                .sex(member.getSex())
                .is_creator(member.getIs_creator())
                .createdAt(member.getCreatedAt())
                .status(member.getStatus())
                .build();
    }

}
