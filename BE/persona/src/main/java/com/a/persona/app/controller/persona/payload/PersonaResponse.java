package com.a.persona.app.controller.persona.payload;

import com.a.persona.app.model.member.domain.Member;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class PersonaResponse {

    Long id;

    String name;

    String profile;

    Set<String> keywords = new HashSet<>();

    Set<String> colors = new HashSet<>();

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    Boolean isActive;

    String code;
    
}
