package com.a.persona.infra.feign.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AiTrendContentRequest {

    String trend_prompt;
    ReportData report;
    LikeAnswerData answers;
    List<Long> q8_tone;
    String user_image_url;
    Integer crop_type;
}
