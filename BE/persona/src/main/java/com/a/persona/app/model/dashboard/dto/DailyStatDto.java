package com.a.persona.app.model.dashboard.dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class DailyStatDto {

    String targetDate;

    Long count;

}
