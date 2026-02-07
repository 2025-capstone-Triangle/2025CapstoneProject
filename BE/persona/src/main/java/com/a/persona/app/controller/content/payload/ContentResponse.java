package com.a.persona.app.controller.content.payload;

import com.a.persona.app.model.content.code.ContentType;
import com.a.persona.app.model.reference.domain.Reference;
import com.a.persona.app.model.persona.domain.Persona;

public class ContentResponse {

    Long id;

    Persona persona;

    Reference reference;

    String img;

    ContentType type;

    String description;
}
