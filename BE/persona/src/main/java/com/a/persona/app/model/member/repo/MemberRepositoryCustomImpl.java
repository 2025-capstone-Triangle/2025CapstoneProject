package com.a.persona.app.model.member.repo;

import com.a.persona.app.model.loginLog.domain.QLoginLog;
import com.a.persona.app.model.member.code.Status;
import com.a.persona.app.model.member.domain.QMember;
import com.a.persona.app.model.member.domain.QMemberBlock;
import com.a.persona.app.model.member.dto.MemberBlockDto;
import com.a.persona.app.model.member.dto.MemberDto;
import com.a.persona.app.model.member.dto.MemberStatDto;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
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
    private final QMemberBlock  memberBlock = QMemberBlock.memberBlock;

    @Override
    public List<MemberStatDto> findStatAllByIsActive(boolean b, Boolean isBlocked) {

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
                        Projections.constructor(MemberBlockDto.class,
                                memberBlock.id,
                                Expressions.nullExpression(MemberDto.class),
                                memberBlock.reason,
                                memberBlock.blockedAt
                                ),
                        loginLog.time.max()
                ))
                .from(member)
                .leftJoin(loginLog).on(loginLog.member.eq(member))
                .leftJoin(memberBlock).on(memberBlock.member.eq(member))
                .where(member.isActive.eq(b).and(statusEq(isBlocked)))
                .groupBy(member.id,
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
                        memberBlock.id,
                        memberBlock.reason,
                        memberBlock.blockedAt)
                .fetch();
    }

    private BooleanExpression statusEq(Boolean isBlocked) {
        if (isBlocked == null) {
            return null;
        }
        return member.status.eq(isBlocked ? Status.BANNED : Status.ACTIVE);
    }

    @Override
    public Optional<MemberStatDto> findStatByIdAndIsActive(Long id, boolean b, Boolean isBlocked) {
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
                        Projections.constructor(MemberBlockDto.class,
                                member.id,
                                Expressions.nullExpression(MemberDto.class),
                                memberBlock.reason,
                                memberBlock.blockedAt
                        ),
                        loginLog.time.max()
                ))
                .from(member)
                .leftJoin(loginLog).on(loginLog.member.eq(member))
                .leftJoin(memberBlock).on(memberBlock.member.eq(member))
                .where(member.isActive.eq(b)
                        .and(member.id.eq(id))
                        .and(statusEq(isBlocked)))
                .groupBy(member.id,
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
                        memberBlock.id,
                        memberBlock.reason,
                        memberBlock.blockedAt)
                .fetchFirst());

    }
}
