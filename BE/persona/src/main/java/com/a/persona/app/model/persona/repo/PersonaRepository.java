package com.a.persona.app.model.persona.repo;

import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.persona.domain.Persona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonaRepository extends JpaRepository<Persona, Long>, PersonaRepositoryCustom{
    List<Persona> findPersonasByMemberAndIsActive(Member member, Boolean isActive);

    boolean existsByCode(String code);
}
