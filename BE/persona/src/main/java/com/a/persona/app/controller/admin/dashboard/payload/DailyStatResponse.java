package com.a.persona.app.controller.admin.dashboard.payload;

import com.a.persona.app.model.dashboard.dto.DailyStatDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class DailyStatResponse {

    String targetDate;

    Long count;

    public static DailyStatResponse from(DailyStatDto dto) {
        return DailyStatResponse.builder()
                .targetDate(dto.getTargetDate())
                .count(dto.getCount())
                .build();
    }

}
