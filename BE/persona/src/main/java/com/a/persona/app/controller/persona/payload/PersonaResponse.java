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

    private Long id;

    private String name;

    private String profile;

    private List<String> keywords = new ArrayList<>();

    private List<String> colors = new ArrayList<>();

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Boolean isActive;

}
