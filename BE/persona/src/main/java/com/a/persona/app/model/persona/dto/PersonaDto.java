package com.a.persona.app.model.persona.dto;

import com.a.persona.app.model.common.BaseEntity;
import com.a.persona.app.model.member.domain.Member;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonaDto extends BaseEntity {

    private Long id;

    private String name;

    private String profile;

    private Member member;

    private List<String> keywords = new ArrayList<>();

    private List<String> colors = new ArrayList<>();

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Boolean isActive;

    private String code;
}
