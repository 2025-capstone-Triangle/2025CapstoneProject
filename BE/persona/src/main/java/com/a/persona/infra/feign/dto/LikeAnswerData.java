package com.a.persona.infra.feign.dto;

import com.a.persona.app.controller.persona.payload.LikeAnswerRequest;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LikeAnswerData {

    Long q1_environment;
    Long q2_style;
    Long q3_minimal_maximal;
    Long q4_mood;
    Long q5_contrast_type;
    Long q6_motion;
    Long q7_framing;

    public static LikeAnswerData fromRequest(LikeAnswerRequest request){
        return LikeAnswerData.builder()
                .q1_environment(request.getQ1_environment())
                .q2_style(request.getQ2_style())
                .q3_minimal_maximal(request.getQ3_minimal_maximal())
                .q4_mood(request.getQ4_mood())
                .q5_contrast_type(request.getQ5_contrast_type())
                .q6_motion(request.getQ6_motion())
                .q7_framing(request.getQ7_framing())
                .build();
    }

}
