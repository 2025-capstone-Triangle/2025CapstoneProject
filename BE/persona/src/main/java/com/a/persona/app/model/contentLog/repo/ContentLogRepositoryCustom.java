package com.a.persona.app.model.contentLog.repo;

import com.a.persona.app.model.dashboard.domain.code.PeriodType;
import com.a.persona.app.model.dashboard.dto.DailyStatDto;

import java.time.LocalDate;
import java.util.List;

public interface ContentLogRepositoryCustom {
    List<DailyStatDto> countContentCreationByDate(LocalDate startDate, LocalDate endDate, PeriodType periodType);
}
