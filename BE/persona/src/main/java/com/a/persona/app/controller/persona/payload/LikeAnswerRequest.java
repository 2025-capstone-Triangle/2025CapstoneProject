package com.a.persona.app.controller.persona.payload;

import lombok.Data;

@Data
public class LikeAnswerRequest {
    Long q1_environment;
    Long q2_style;
    Long q3_minimal_maximal;
    Long q4_mood;
    Long q5_contrast_type;
    Long q6_motion;
    Long q7_framing;
}
