package com.a.persona.app.model.reference.repo;

import com.a.persona.app.model.reference.dto.ReferenceStatDto;

import java.util.List;

public interface ReferenceRepositoryCustom {
    List<ReferenceStatDto> findByIsActive(boolean b);

    List<ReferenceStatDto> findByIsActiveAndLike(boolean b, String username);
}
