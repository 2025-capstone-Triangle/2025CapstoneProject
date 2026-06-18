package com.a.persona.app.model.personaLog.repo;

import com.a.persona.app.model.dashboard.domain.code.PeriodType;
import com.a.persona.app.model.dashboard.dto.DailyStatDto;

import java.time.LocalDate;
import java.util.List;

public interface PersonaLogRepositoryCustom {
    List<DailyStatDto> countPersonaLogByDate(LocalDate startDate, LocalDate endDate, PeriodType periodType);
}
