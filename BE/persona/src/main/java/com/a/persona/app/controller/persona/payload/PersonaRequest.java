package com.a.persona.app.controller.persona.payload;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.Data;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Data
public class PersonaRequest {

    MultipartFile profile;
    MultipartFile image;
    MultipartFile voice;
    @Parameter(name = "answer")
    String preferenceType;
    @Parameter(name = "q8_tone")
    List<Long> tone= List.of(0L,0L,0L,0L);


    public LikeAnswerRequest getLikeAnswerRequest()
    {
        if (this.preferenceType == null || this.preferenceType.isBlank()) {
            return null;
        }

        try {
            ObjectMapper objectMapper = new ObjectMapper();

            return objectMapper.readValue(this.preferenceType, LikeAnswerRequest.class);
        } catch (Exception e) {
            throw new RuntimeException("preferenceType JSON 파싱 실패: " + e.getMessage());
        }

    }

}
