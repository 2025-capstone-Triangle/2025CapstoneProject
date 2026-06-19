package com.a.persona.app.model.member.dto;

import com.a.persona.app.model.auth.code.Role;
import com.a.persona.app.model.member.code.Sex;
import com.a.persona.app.model.member.code.Status;
import com.a.persona.app.model.member.domain.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberDto {

    private Long id;

    private String username;

    private String password;

    private String email;

    private Role role;

    private LocalDate birth;

    private Sex sex;

    private Boolean is_creator;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Boolean isActive;

    private Status status;

    public static MemberDto fromEntity(Member member) {
        return MemberDto.builder()
                .id(member.getId())
                .username(member.getUsername())
                // 주의: 보안을 위해 password는 보통 DTO 변환 시 null로 비워두거나 제외합니다.
                .password(null)
                .email(member.getEmail())
                .role(member.getRole())
                .birth(member.getBirth())
                .sex(member.getSex())
                .is_creator(member.getIs_creator())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .isActive(member.getIsActive())
                .status(member.getStatus())
                .build();
    }
}
