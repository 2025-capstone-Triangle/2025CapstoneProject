package com.a.persona.app.controller.persona.payload;

import com.a.persona.app.model.member.domain.Member;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PersonaResponse {

    Long id;

    String name;

    String profile;

    List<String> keywords = new ArrayList<>();

    List<String> colors = new ArrayList<>();

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    Boolean isActive;

    String code;
    
}
