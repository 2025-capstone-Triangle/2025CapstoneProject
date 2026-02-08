package com.a.persona.app.controller.reference.payload;

import com.a.persona.app.model.reference.dto.ReferenceStatDto;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class ReferenceStatResponse {

    Long id;

    String name;

    String img;

    Boolean isLiked;

    LocalDateTime createdAt;

    Long usedCount;

    public static ReferenceStatResponse from(ReferenceStatDto dto) {
        return ReferenceStatResponse.builder()
                .id(dto.getId())
                .name(dto.getName())
                .img(dto.getImg())
                .isLiked(dto.getIsLiked()) // Boolean 매핑
                .usedCount(dto.getUsedCount())
                .createdAt(dto.getCreatedAt())
                .build();
    }

}
