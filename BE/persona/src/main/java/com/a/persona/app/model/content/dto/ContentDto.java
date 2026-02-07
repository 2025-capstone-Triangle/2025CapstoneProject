package com.a.persona.app.model.content.dto;

import com.a.persona.app.model.content.code.ContentType;
import com.a.persona.app.model.reference.domain.Reference;
import com.a.persona.app.model.persona.domain.Persona;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ContentDto {

    private Long id;

    private Persona persona;

    private Reference reference;

    private String img;

    private ContentType type;

    private String description;
}
