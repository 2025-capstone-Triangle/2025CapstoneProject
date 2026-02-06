package com.a.persona.app.model.persona.repo;

import com.a.persona.app.model.persona.domain.Persona;
import com.a.persona.app.model.persona.domain.QPersona;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class PersonaRepositoryCustomImpl implements PersonaRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QPersona persona=QPersona.persona;

    @Override
    public Optional<Persona> findPersonaByCodeAndIsActive(String code, boolean b) {
        return Optional.ofNullable(
                queryFactory.selectFrom(persona)
                        .leftJoin(persona.keywords).fetchJoin()
                        .leftJoin(persona.colors).fetchJoin()
                        .where(
                                persona.code.eq(code),
                                persona.isActive.eq(b)
                        )
                        .fetchOne()
        );
    }
}
