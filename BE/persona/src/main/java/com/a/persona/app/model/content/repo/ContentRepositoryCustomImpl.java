package com.a.persona.app.model.content.repo;

import com.a.persona.app.model.content.domain.QContent;
import com.a.persona.app.model.content.domain.QContentLike;
import com.a.persona.app.model.content.dto.ContentStatDto;
import com.a.persona.app.model.persona.domain.Persona;
import com.a.persona.app.model.persona.dto.PersonaDto;
import com.a.persona.app.model.reference.domain.QReference;
import com.a.persona.app.model.reference.dto.ReferenceDto;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class ContentRepositoryCustomImpl implements ContentRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QContent content = QContent.content;
    private final QReference reference = QReference.reference;
    private final QContentLike contentLike = QContentLike.contentLike;

    @Override
    public List<ContentStatDto> findByPersonaAndIsActive(Persona persona, boolean b) {

        return queryFactory
                .select(Projections.constructor(ContentStatDto.class,
                        content.id,
                        Projections.constructor(ReferenceDto.class,
                                reference.id, reference.name, reference.img, reference.prompt, reference.prompt, reference.createdAt, reference.updatedAt, reference.isActive),
                        content.img,
                        content.type,
                        content.createdAt,
                        JPAExpressions.selectOne()
                                .from(contentLike)
                                .where(contentLike.content.eq(content))
                                .exists()
                ))
                .from(content)
                .leftJoin(content.reference, reference)
                .where(content.persona.eq(persona)
                        .and(content.isActive.eq(true)))
                .fetch();
    }
}
