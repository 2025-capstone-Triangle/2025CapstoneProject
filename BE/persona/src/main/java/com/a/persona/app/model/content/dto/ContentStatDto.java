package com.a.persona.app.model.content.dto;

import com.a.persona.app.model.content.code.ContentType;
import com.a.persona.app.model.reference.dto.ReferenceDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContentStatDto {

    private Long id;

    private ReferenceDto reference;

    private String img;

    private ContentType type;

    private LocalDateTime createdAt;

    private Boolean isLiked;

}
