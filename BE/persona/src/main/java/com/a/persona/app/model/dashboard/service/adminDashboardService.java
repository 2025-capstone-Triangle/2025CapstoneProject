package com.a.persona.app.model.dashboard.service;

import com.a.persona.app.model.contentLog.repo.ContentLogRepository;
import com.a.persona.app.model.dashboard.domain.code.PeriodType;
import com.a.persona.app.model.dashboard.dto.AdminDashboardStatDto;
import com.a.persona.app.model.dashboard.dto.DailyStatDto;
import com.a.persona.app.model.loginLog.repo.LoginLogRepository;
import com.a.persona.app.model.member.repo.MemberRepository;
import com.a.persona.app.model.personaLog.repo.PersonaLogRepository;
import com.a.persona.infra.error.exceptions.CommonException;
import com.a.persona.infra.response.ResponseCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class adminDashboardService {

    private final LoginLogRepository loginLogRepository;
    private final MemberRepository memberRepository;
    private final PersonaLogRepository personaLogRepository;
    private final ContentLogRepository contentLogRepository;

    /**
     * 관리자의 대시보드에 필요한 정보를 각각의 메소드로 조회해온 것을 조립하는 메소드입니다.
     * @param date 조회 기준 날짜
     * @param periodType 조회 기준
     * @return AdminDashboardStatDto
     */
    public AdminDashboardStatDto getStatus(LocalDate date, PeriodType periodType) {
        
        // 입력된 날짜가 없다면 오늘 날짜를 기준으로
        if(date == null){
            date = LocalDate.now();
        }

        return AdminDashboardStatDto.builder()
                .visitorStats(getVisitorStats(date, periodType))
                .registrationStats(getRegistrationStats(date, periodType))
                .withdrawalStats(getWithdrawalStats(date, periodType))
                .analyzedStats(getAnalyzedStats(date, periodType))
                .contentCreationStats(getContentCreationStats(date, periodType))
                .build();
    }

    /**
     * 생성된 컨텐츠 수를 조회하는 메소드입니다.
     * @param endDate 기준 날짜
     * @param periodType 조회 기준
     * @return List<DailyStatDto>
     */
    private List<DailyStatDto> getContentCreationStats(LocalDate endDate, PeriodType periodType) {
        LocalDate startDate = calculateLastDate(endDate, periodType);

        return contentLogRepository.countContentCreationByDate(startDate, endDate, periodType);
    }

    /**
     * 진단 수를 조회하는 메소드입니다.
     * @param endDate 기준 날짜
     * @param periodType 조회 기준
     * @return List<DailyStatDto>
     */
    private List<DailyStatDto> getAnalyzedStats(LocalDate endDate, PeriodType periodType) {

        LocalDate startDate = calculateLastDate(endDate, periodType);

        return personaLogRepository.countPersonaLogByDate(startDate, endDate, periodType);
    }

    /**
     * 탈퇴 회원 수를 조회하는 메소드 입니다.
     * @param endDate 기준 날짜
     * @param periodType 조회 기준
     * @return List<DailyStatDto>
     */
    private List<DailyStatDto> getWithdrawalStats(LocalDate endDate, PeriodType periodType) {
        LocalDate startDate = calculateLastDate(endDate, periodType);
        return memberRepository.countWithdrawMembersByDate(startDate, endDate, periodType);
    }

    /**
     * 신규 회원 수를 조회하는 메소드 입니다.
     * @param endDate 기준 날짜
     * @param periodType 조회 기준
     * @return List<DailyStatDto>
     */
    private List<DailyStatDto> getRegistrationStats(LocalDate endDate, PeriodType periodType) {

        LocalDate startDate = calculateLastDate(endDate, periodType);

        return memberRepository.countNewMembersByDate(startDate, endDate, periodType);
    }

    /**
     * 방문자 수를 조회하는 메소드 입니다.
     * @param endDate 기준 날짜
     * @param periodType 조회 기준
     * @return List<DailyStatDto>
     */
    private List<DailyStatDto> getVisitorStats(LocalDate endDate, PeriodType periodType) {

        LocalDate startDate = calculateLastDate(endDate, periodType);

        return loginLogRepository.countVisitorsByDate(startDate, endDate, periodType);
    }

    /**
     * 받은 기준 날짜를 조회 끝 날짜로 두며, 조회를 시작하는 날짜를 구하는 메소드입니다. 7일, 6주, 6달의 기간을 만들도록 합니다.
     * @param date 기준 날짜
     * @param periodType 조회 기준
     * @return LocalDate
     */
    private LocalDate calculateLastDate(LocalDate date, PeriodType periodType) {
        if(periodType.equals(PeriodType.DAILY)){
            return date.minusDays(6);
        }else if(periodType.equals(PeriodType.WEEKLY)){
            return date.minusWeeks(5).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        }else if(periodType.equals(PeriodType.MONTHLY)){
            return date.minusMonths(5).with(TemporalAdjusters.firstDayOfMonth());
        }else{
            throw new CommonException(ResponseCode.BAD_REQUEST);
        }
    }
}
