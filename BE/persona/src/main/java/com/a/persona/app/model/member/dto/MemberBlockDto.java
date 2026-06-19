package com.a.persona.app.model.member.dto;

import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberBlockDto {

    private Long id;

    private MemberDto member;

    private String reason;

    private LocalDateTime blockedAt;

}
