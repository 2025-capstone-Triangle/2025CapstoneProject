package com.a.persona.app.model.dashboard.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class AdminDashboardStatDto {

    // 방문자 수
    List<DailyStatDto> visitorStats = new ArrayList<>();

    // 신규 회원 수
    List<DailyStatDto> registrationStats  = new ArrayList<>();

    // 탈퇴 회원 수
    List<DailyStatDto> withdrawalStats  = new ArrayList<>();

    // 진단 수
    List<DailyStatDto> analyzedStats = new ArrayList<>();

    // 지속 컨텐츠 수
    List<DailyStatDto> contentCreationStats  = new ArrayList<>();

}
