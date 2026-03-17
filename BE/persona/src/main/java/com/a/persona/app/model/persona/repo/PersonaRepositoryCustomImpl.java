package com.a.persona.app.model.persona.repo;

import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.member.domain.QMember;
import com.a.persona.app.model.persona.domain.Persona;
import com.a.persona.app.model.persona.domain.Preference;
import com.a.persona.app.model.persona.domain.QPersona;
import com.a.persona.app.model.persona.domain.QPreference;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class PersonaRepositoryCustomImpl implements PersonaRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QPersona persona=QPersona.persona;
    private final QPreference preference=QPreference.preference;

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

    @Override
    public Optional<Persona> findPersonaByMemberAndCodeAndIsActive(Member member, String code, Boolean isActive) {
        return Optional.ofNullable(
                queryFactory.selectFrom(persona)
                        .distinct()
                        .leftJoin(persona.keywords)
                        .leftJoin(persona.colors)
                        .leftJoin(persona.preference).fetchJoin()
                        .leftJoin(persona.preference.q8Tone)
                        .where(
                                persona.member.eq(member)
                                        .and(persona.code.eq(code))
                                        .and(persona.isActive.eq(isActive))
                        )
                        .fetchOne()
        );
    }
}
