package com.a.persona.app.model.content.repo;

import com.a.persona.app.model.content.dto.ContentStatDto;
import com.a.persona.app.model.persona.domain.Persona;

import java.util.List;

public interface ContentRepositoryCustom {
    List<ContentStatDto> findByPersonaAndIsActive(Persona persona, boolean b);
}
