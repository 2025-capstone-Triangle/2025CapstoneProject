package com.a.persona.infra.feign.dto;

import com.a.persona.app.controller.persona.payload.LikeAnswerRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class PersonaRequest {

    LikeAnswerRequest answers;
    List<Long> q8_tone;
    String images;
    String voice;
    String session_id;
}
