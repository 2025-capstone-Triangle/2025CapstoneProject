package com.a.persona.app.controller.content.payload;

import com.a.persona.app.controller.persona.payload.PersonaResponse;
import com.a.persona.app.model.content.code.ContentType;
import com.a.persona.app.model.content.dto.ContentStatDto;
import com.a.persona.app.model.reference.dto.ReferenceDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ContentStatResponse {

    Long id;

    ReferenceDto reference;

    String img;

    ContentType type;

    LocalDateTime createdAt;

    Boolean isLiked;

    public static ContentStatResponse from(ContentStatDto dto) {
        return ContentStatResponse.builder()
                .id(dto.getId())
                .reference(dto.getReference())
                .img(dto.getImg())
                .type(dto.getType())
                .createdAt(dto.getCreatedAt())
                .isLiked(dto.getIsLiked())
                .build();
    }

}
