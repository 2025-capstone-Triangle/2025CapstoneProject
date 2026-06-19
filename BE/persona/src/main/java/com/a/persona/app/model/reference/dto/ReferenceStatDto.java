package com.a.persona.app.model.reference.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReferenceStatDto {

    Long id;

    String name;

    String img;

    Boolean isLiked;

    String description;

    LocalDateTime createdAt;

    Long usedCount;
}
