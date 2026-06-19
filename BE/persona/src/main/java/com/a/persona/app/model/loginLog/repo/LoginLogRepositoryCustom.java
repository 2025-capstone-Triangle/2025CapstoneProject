package com.a.persona.app.model.loginLog.repo;

import com.a.persona.app.model.dashboard.domain.code.PeriodType;
import com.a.persona.app.model.dashboard.dto.DailyStatDto;

import java.time.LocalDate;
import java.util.List;

public interface LoginLogRepositoryCustom {

    /**
     * 두 날짜 사이의 방문자 수를 카운트 합니다.
     * @param startDate 카운트 시작 날짜
     * @param endDate 카운트 종료 날짜
     * @return List<DailyStatDto>
     */
    List<DailyStatDto> countVisitorsByDate(LocalDate startDate, LocalDate endDate, PeriodType periodType);

}
