package com.a.persona.app.model.member.repo;

import com.a.persona.app.model.loginLog.domain.QLoginLog;
import com.a.persona.app.model.member.domain.QMember;
import com.a.persona.app.model.member.dto.MemberStatDto;
import com.a.persona.app.model.persona.dto.PersonaDto;
import com.a.persona.app.model.reference.dto.ReferenceDto;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
@RequiredArgsConstructor
public class MemberRepositoryCustomImpl implements MemberRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QMember member = QMember.member;
    private final QLoginLog loginLog = QLoginLog.loginLog;

    @Override
    public List<MemberStatDto> findStatAllByIsActive(boolean b) {
        return queryFactory
                .select(Projections.constructor(MemberStatDto.class,
                        member.id,
                        member.username,
                        member.email,
                        member.role,
                        member.birth,
                        member.sex,
                        member.is_creator,
                        member.createdAt,
                        member.updatedAt,
                        member.isActive,
                        member.status,
                        loginLog.time.max()
                ))
                .from(member)
                .leftJoin(loginLog).on(loginLog.member.eq(member))
                .where(member.isActive.eq(b))
                .groupBy(member.id)
                .fetch();
    }

    @Override
    public Optional<MemberStatDto> findStatByIdAndIsActive(Long id, boolean b) {
        return Optional.ofNullable(
                queryFactory
                .select(Projections.constructor(MemberStatDto.class,
                        member.id,
                        member.username,
                        member.email,
                        member.role,
                        member.birth,
                        member.sex,
                        member.is_creator,
                        member.createdAt,
                        member.updatedAt,
                        member.isActive,
                        member.status,
                        loginLog.time.max()
                ))
                .from(member)
                .leftJoin(loginLog).on(loginLog.member.eq(member))
                .where(member.isActive.eq(b)
                        .and(member.id.eq(id)))
                .groupBy(member.id)
                .fetchFirst());

    }
}
