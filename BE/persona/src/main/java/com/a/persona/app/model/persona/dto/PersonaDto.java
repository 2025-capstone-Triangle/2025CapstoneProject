package com.a.persona.app.model.persona.dto;

import com.a.persona.app.model.common.BaseEntity;
import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.member.dto.MemberDto;
import com.a.persona.app.model.persona.domain.Persona;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonaDto{

    private Long id;

    private String name;

    private String profile;

    private MemberDto member;

    private Set<String> keywords = new HashSet<>();

    private Set<String> colors = new HashSet<>();;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Boolean isActive;

    private String code;

    public static PersonaDto fromEntity(Persona persona) {
        return PersonaDto.builder()
                .id(persona.getId())
                .name(persona.getName())
                .profile(persona.getProfile())
                // Member 엔티티를 직접 넣지 않고, MemberDto의 변환 메서드를 호출합니다.
                .member(persona.getMember() != null ? MemberDto.fromEntity(persona.getMember()) : null)
                // 컬렉션 방어적 복사 (Shared Reference 에러 방지)
                .keywords(new HashSet<>(persona.getKeywords()))
                .colors(new HashSet<>(persona.getColors()))
                .createdAt(persona.getCreatedAt())
                .updatedAt(persona.getUpdatedAt())
                .isActive(persona.getIsActive())
                .code(persona.getCode())
                .build();
    }
}
