package com.a.persona.app.model.personaLog.repo;

import com.a.persona.app.model.auth.code.Role;
import com.a.persona.app.model.dashboard.domain.code.PeriodType;
import com.a.persona.app.model.dashboard.dto.DailyStatDto;
import com.a.persona.app.model.personaLog.domain.QPersonaLog;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RequiredArgsConstructor
@Repository
public class PersonaLogRepositoryCustomImpl implements PersonaLogRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QPersonaLog personaLog = QPersonaLog.personaLog;

    @Override
    public List<DailyStatDto> countPersonaLogByDate(LocalDate startDate, LocalDate endDate, PeriodType periodType) {


        // Case 표현식으로 동적 포맷팅
        StringExpression formattedDate = switch (periodType) {
            case DAILY -> Expressions.stringTemplate(
                    "TO_CHAR({0}, 'YYYY-MM-DD')", personaLog.time
            );
            case WEEKLY -> Expressions.stringTemplate(
                    "TO_CHAR({0}, 'IYYY-IW')", personaLog.time
            );
            case MONTHLY -> Expressions.stringTemplate(
                    "TO_CHAR({0}, 'YYYY-MM')", personaLog.time
            );
        };

        return queryFactory
                .select(Projections.constructor(DailyStatDto.class,
                        formattedDate,
                        personaLog.count()
                ))
                .from(personaLog)
                .where(
                        personaLog.time.between(
                                startDate.atStartOfDay(),
                                endDate.atTime(LocalTime.MAX)
                        ),
                        personaLog.member.role.eq(Role.ROLE_USER)
                )
                .groupBy(formattedDate)
                .orderBy(formattedDate.asc())
                .fetch();
    }
}
