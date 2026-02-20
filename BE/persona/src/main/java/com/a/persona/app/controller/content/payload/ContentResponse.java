package com.a.persona.app.controller.content.payload;

import com.a.persona.app.model.content.code.ContentType;
import com.a.persona.app.model.persona.dto.PersonaDto;
import com.a.persona.app.model.reference.dto.ReferenceDto;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ContentResponse {

    Long id;

    PersonaDto persona;

    ReferenceDto reference;

    String img;

    ContentType type;
}
