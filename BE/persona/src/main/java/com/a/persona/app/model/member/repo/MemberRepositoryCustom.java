package com.a.persona.app.model.member.repo;

import com.a.persona.app.model.dashboard.domain.code.PeriodType;
import com.a.persona.app.model.dashboard.dto.DailyStatDto;
import com.a.persona.app.model.member.dto.MemberStatDto;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MemberRepositoryCustom {

    List<MemberStatDto> findStatAllByIsActive(boolean b, Boolean isBlocked);

    Optional<MemberStatDto> findStatByIdAndIsActive(Long id, boolean b, Boolean isBlocked);

    List<DailyStatDto> countNewMembersByDate(LocalDate startDate, LocalDate endDate, PeriodType periodType);

    List<DailyStatDto> countWithdrawMembersByDate(LocalDate startDate, LocalDate endDate, PeriodType periodType);
}
