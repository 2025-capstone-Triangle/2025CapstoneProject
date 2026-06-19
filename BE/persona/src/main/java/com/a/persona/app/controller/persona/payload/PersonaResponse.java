package com.a.persona.app.controller.persona.payload;

import com.a.persona.app.model.persona.dto.PersonaDto;
import com.a.persona.app.model.persona.dto.PreferenceDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class PersonaResponse {

    Long id;

    String name;

    Set<String> keywords = new HashSet<>();

    Set<String> colors = new HashSet<>();

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    Boolean isActive;

    String code;

    String thumbnail;

    String summary;

    String traits;

    public static PersonaResponse from(PersonaDto dto) {
        return PersonaResponse.builder()
                .id(dto.getId())
                .name(dto.getName())
                .keywords(dto.getKeywords() != null ? new HashSet<>(dto.getKeywords()) : new HashSet<>())
                .colors(dto.getColors() != null ? new HashSet<>(dto.getColors()) : new HashSet<>())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .isActive(dto.getIsActive())
                .code(dto.getCode())
                .thumbnail(dto.getThumbnail())
                .summary(dto.getSummary())
                .traits(dto.getTraits())
                .build();
    }
}
