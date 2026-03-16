package com.a.persona.app.model.member.repo;

import com.a.persona.app.model.auth.code.Role;
import com.a.persona.app.model.dashboard.domain.code.PeriodType;
import com.a.persona.app.model.dashboard.dto.DailyStatDto;
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
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
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

    @Override
    public List<DailyStatDto> countNewMembersByDate(LocalDate startDate, LocalDate endDate, PeriodType periodType) {


        // Case 표현식으로 동적 포맷팅
        StringExpression formattedDate = switch (periodType) {
            case DAILY -> Expressions.stringTemplate(
                    "TO_CHAR({0}, 'YYYY-MM-DD')", member.createdAt
            );
            case WEEKLY -> Expressions.stringTemplate(
                    "TO_CHAR({0}, 'IYYY-IW')", member.createdAt
            );
            case MONTHLY -> Expressions.stringTemplate(
                    "TO_CHAR({0}, 'YYYY-MM')", member.createdAt
            );
        };

        return queryFactory
                .select(Projections.constructor(DailyStatDto.class,
                        formattedDate,
                        member.count()
                ))
                .from(member)
                .where(
                        member.createdAt.between(
                                startDate.atStartOfDay(),
                                endDate.atTime(LocalTime.MAX)
                        ),
                        member.role.eq(Role.ROLE_USER)
                )
                .groupBy(formattedDate)
                .orderBy(formattedDate.asc())
                .fetch();
    }

    @Override
    public List<DailyStatDto> countWithdrawMembersByDate(LocalDate startDate, LocalDate endDate, PeriodType periodType) {


        // Case 표현식으로 동적 포맷팅
        StringExpression formattedDate = switch (periodType) {
            case DAILY -> Expressions.stringTemplate(
                    "TO_CHAR({0}, 'YYYY-MM-DD')", member.updatedAt
            );
            case WEEKLY -> Expressions.stringTemplate(
                    "TO_CHAR({0}, 'IYYY-IW')", member.updatedAt
            );
            case MONTHLY -> Expressions.stringTemplate(
                    "TO_CHAR({0}, 'YYYY-MM')", member.updatedAt
            );
        };

        return queryFactory
                .select(Projections.constructor(DailyStatDto.class,
                        formattedDate,
                        member.count()
                ))
                .from(member)
                .where(
                        member.updatedAt.between(
                                startDate.atStartOfDay(),
                                endDate.atTime(LocalTime.MAX)
                        ),
                        member.role.eq(Role.ROLE_USER),
                        member.isActive.eq(false)
                )
                .groupBy(formattedDate)
                .orderBy(formattedDate.asc())
                .fetch();
    }
}
