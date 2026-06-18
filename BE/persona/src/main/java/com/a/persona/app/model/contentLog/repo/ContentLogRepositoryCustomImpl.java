package com.a.persona.app.model.contentLog.repo;

import com.a.persona.app.model.contentLog.domain.QContentLog;
import com.a.persona.app.model.dashboard.domain.code.PeriodType;
import com.a.persona.app.model.dashboard.dto.DailyStatDto;
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
public class ContentLogRepositoryCustomImpl implements ContentLogRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QContentLog contentLog = QContentLog.contentLog;

    @Override
    public List<DailyStatDto> countContentCreationByDate(LocalDate startDate, LocalDate endDate, PeriodType periodType) {

        // Case 표현식으로 동적 포맷팅
        StringExpression formattedDate = switch (periodType) {
            case DAILY -> Expressions.stringTemplate(
                    "TO_CHAR({0}, 'YYYY-MM-DD')", contentLog.time
            );
            case WEEKLY -> Expressions.stringTemplate(
                    "TO_CHAR({0}, 'IYYY-IW')", contentLog.time
            );
            case MONTHLY -> Expressions.stringTemplate(
                    "TO_CHAR({0}, 'YYYY-MM')", contentLog.time
            );
        };

        return queryFactory
                .select(Projections.constructor(DailyStatDto.class,
                        formattedDate,
                        contentLog.count()
                ))
                .from(contentLog)
                .where(
                        contentLog.time.between(
                                startDate.atStartOfDay(),
                                endDate.atTime(LocalTime.MAX)
                        )
                )
                .groupBy(formattedDate)
                .orderBy(formattedDate.asc())
                .fetch();
    }
}
