package com.a.persona.app.controller.admin.dashboard;

import com.a.persona.app.controller.admin.dashboard.payload.AdminDashboardStatResponse;
import com.a.persona.app.controller.admin.notice.payload.AdminNoticeResponse;
import com.a.persona.app.model.dashboard.domain.code.PeriodType;
import com.a.persona.app.model.dashboard.dto.AdminDashboardStatDto;
import com.a.persona.app.model.dashboard.service.adminDashboardService;
import com.a.persona.infra.response.CommonApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@Tag(name="(관리자) 대시보드 조회", description = "관리자 메인 페이지에서 사용할 대시보드 조회 관련 API 입니다.")
@RestController
@RequestMapping(value = "/api/v1/admin/dashboard", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Slf4j
@Controller
public class adminDashboardController {

    private final adminDashboardService adminDashboardService;

    // 방문자 수, 진단 수, 지속 컨텐츠 수, 신규 회원 수, 탈퇴 회원 수
    @GetMapping("/status")
    @Operation(summary = "대시보드 조회", description = "현재 서비스의 정보를 조회합니다.<br>" +
            "PeriodType 에 DAILY, WEEKLY, MONTHLY 를 넣으시면 됩니다. <br>" +
            "date를 입력할 시, <br>" +
            "입력날짜를 기준으로 6일 전부터 해당 날짜까지 총 7일간의 기록을 (DAILY), <br>" +
            "입력날짜를 기준으로 5주 전부터 해당 날짜까지 총 6주간의 기록을 (WEEKLY), <br>" +
            "입력날짜를 기준으로 5개월 전부터 해당 날짜까지 총 6개월 간의 기록을 (MONTHLY) 응답합니다." +
            "날짜를 입력하지 않을 시 오늘을 기준으로 조회합니다. <br>")
    public ResponseEntity<CommonApiResponse<AdminDashboardStatResponse>> getNotice(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date,
            @RequestParam(defaultValue = "DAILY") PeriodType periodType
            ) {

        AdminDashboardStatDto adminDashboardStatDto = adminDashboardService.getStatus(date, periodType);

        AdminDashboardStatResponse response = AdminDashboardStatResponse.from(adminDashboardStatDto);

        return ResponseEntity.ok(CommonApiResponse.success(response));

    }

}
