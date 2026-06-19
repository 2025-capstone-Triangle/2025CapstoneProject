package com.a.persona.app.controller.persona.payload;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class PersonaRequest {

    MultipartFile profile;
    MultipartFile image;
    MultipartFile voice;
    String answer;
    List<Long> q8_tone = List.of(0L,0L,0L,0L);
    String sessionId;

    @Schema(hidden = true)
    public LikeAnswerRequest getLikeAnswerRequest()
    {
        if (this.answer == null || this.answer.isBlank()) {
            return null;
        }

        try {
            ObjectMapper objectMapper = new ObjectMapper();

            return objectMapper.readValue(this.answer, LikeAnswerRequest.class);
        } catch (Exception e) {
            throw new RuntimeException("preferenceType JSON 파싱 실패: " + e.getMessage());
        }

    }

}
