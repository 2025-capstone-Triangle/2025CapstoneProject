package com.a.persona.app.model.reference.dto;

import com.a.persona.app.model.common.BaseEntity;
import com.a.persona.app.model.reference.domain.Reference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferenceDto {

    private Long id;

    private String name;

    private String img;

    private String prompt;

    private String description;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Boolean isActive;

    public static ReferenceDto fromEntity(Reference reference) {
        return ReferenceDto.builder()
                .id(reference.getId())
                .name(reference.getName())
                .img(reference.getImg())
                .prompt(reference.getPrompt())
                .description(reference.getDescription())
                .createdAt(reference.getCreatedAt())
                .updatedAt(reference.getUpdatedAt())
                .isActive(reference.getIsActive())
                .build();
    }
}
