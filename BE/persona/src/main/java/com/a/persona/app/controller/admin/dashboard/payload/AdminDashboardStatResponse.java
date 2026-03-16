package com.a.persona.app.controller.admin.dashboard.payload;

import com.a.persona.app.model.dashboard.dto.AdminDashboardStatDto;
import com.a.persona.app.model.dashboard.dto.DailyStatDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class AdminDashboardStatResponse {

    // 방문자 수
    List<DailyStatResponse> visitorStats = new ArrayList<>();

    // 신규 회원 수
    List<DailyStatResponse> registrationStats  = new ArrayList<>();

    // 탈퇴 회원 수
    List<DailyStatResponse> withdrawalStats  = new ArrayList<>();

    // 진단 수
    List<DailyStatResponse> analyzedStats = new ArrayList<>();

    // 지속 컨텐츠 수
    List<DailyStatResponse> contentCreationStats  = new ArrayList<>();

    public static AdminDashboardStatResponse from(AdminDashboardStatDto dto) {

        return AdminDashboardStatResponse.builder()
                .visitorStats(convertDailyStatList(dto.getVisitorStats()))
                .registrationStats(convertDailyStatList(dto.getRegistrationStats()))
                .withdrawalStats(convertDailyStatList(dto.getWithdrawalStats()))
                .analyzedStats(convertDailyStatList(dto.getAnalyzedStats()))
                .contentCreationStats(convertDailyStatList(dto.getContentCreationStats()))
                .build();
    }

    /**
     * DailyStatDTO List를 DailyStatResponse List로 변환
     */
    private static List<DailyStatResponse> convertDailyStatList(List<DailyStatDto> dtoList) {
        return dtoList.stream()
                .map(DailyStatResponse::from)
                .collect(Collectors.toList());
    }
}
