package com.a.persona.app.model.reference.repo;

import com.a.persona.app.model.contentLog.domain.QContentLog;
import com.a.persona.app.model.reference.domain.QReference;
import com.a.persona.app.model.reference.domain.QReferenceLike;
import com.a.persona.app.model.reference.dto.ReferenceStatDto;
import com.querydsl.core.types.ExpressionUtils;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class ReferenceRepositoryImpl implements ReferenceRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QReference reference = QReference.reference;
    private final QReferenceLike referenceLike = QReferenceLike.referenceLike;
    private final QContentLog contentLog = QContentLog.contentLog;

    @Override
    public List<ReferenceStatDto> findByIsActive(boolean b) {

        return queryFactory
                .select(Projections.constructor(ReferenceStatDto.class,
                        reference.id,
                        reference.name,
                        reference.img,
                        Expressions.asBoolean(false),
                        reference.createdAt,
                        // 사용 횟수 계산 (서브쿼리)
                        ExpressionUtils.as(
                                JPAExpressions.select(contentLog.count())
                                        .from(contentLog)
                                        .where(contentLog.reference.eq(reference)),
                                "usedCount")
                ))
                .from(reference)
                .where(reference.isActive.eq(true))
                .fetch();

    }

    @Override
    public List<ReferenceStatDto> findByIsActiveAndLike(boolean b, String username) {
        return queryFactory
                .select(Projections.constructor(ReferenceStatDto.class,
                        reference.id,
                        reference.name,
                        reference.img,
                        // 좋아요 여부 계산 (서브쿼리나 조인 결과)
                        JPAExpressions.selectOne()
                                .from(referenceLike)
                                .where(referenceLike.reference.eq(reference)
                                        .and(referenceLike.member.username.eq(username)))
                                .exists(),
                        reference.createdAt,
                        // 사용 횟수 계산 (서브쿼리)
                        ExpressionUtils.as(
                                JPAExpressions.select(contentLog.count())
                                        .from(contentLog)
                                        .where(contentLog.reference.eq(reference)),
                                "usedCount")
                ))
                .from(reference)
                .where(reference.isActive.eq(true))
                .fetch();
    }
}
