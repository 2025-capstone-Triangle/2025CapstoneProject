package com.a.persona.app.model.loginLog.repo;

import com.a.persona.app.model.auth.code.Role;
import com.a.persona.app.model.dashboard.domain.code.PeriodType;
import com.a.persona.app.model.dashboard.dto.DailyStatDto;
import com.a.persona.app.model.loginLog.domain.QLoginLog;
import com.a.persona.app.model.member.domain.QMember;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class LoginLogRepositoryCustomImpl implements LoginLogRepositoryCustom{

    private final JPAQueryFactory queryFactory;
    private final QLoginLog loginLog = QLoginLog.loginLog;
    private final QMember member = QMember.member;

    @Override
    public List<DailyStatDto> countVisitorsByDate(LocalDate startDate, LocalDate endDate, PeriodType periodType) {

        // Case 표현식으로 동적 포맷팅
        StringExpression formattedDate = switch (periodType) {
            case DAILY -> Expressions.stringTemplate(
                    "TO_CHAR({0}, 'YYYY-MM-DD')", loginLog.time
            );
            case WEEKLY -> Expressions.stringTemplate(
                    "TO_CHAR({0}, 'IYYY-IW')", loginLog.time
            );
            case MONTHLY -> Expressions.stringTemplate(
                    "TO_CHAR({0}, 'YYYY-MM')", loginLog.time
            );
        };

        return queryFactory
                .select(Projections.constructor(DailyStatDto.class,
                        formattedDate,
                        loginLog.count()
                ))
                .from(loginLog)
                .join(member).on(loginLog.member.id.eq(member.id))
                .where(
                        loginLog.time.between(
                                startDate.atStartOfDay(),
                                endDate.atTime(LocalTime.MAX)
                        ),
                        loginLog.member.role.eq(Role.ROLE_USER)
                )
                .groupBy(formattedDate)
                .orderBy(formattedDate.asc())
                .fetch();
    }
}
