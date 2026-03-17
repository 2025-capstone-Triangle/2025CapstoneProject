package com.a.persona.app.model.persona.repo;

import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.persona.domain.Persona;
import com.a.persona.app.model.persona.domain.Preference;

import java.util.Optional;

public interface PersonaRepositoryCustom {
    Optional<Persona> findPersonaByCodeAndIsActive(String code, boolean b);

    Optional<Persona> findPersonaByMemberAndCodeAndIsActive(Member member, String code, Boolean isActive);
}
