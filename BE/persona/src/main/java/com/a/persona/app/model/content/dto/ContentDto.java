package com.a.persona.app.model.content.dto;

import com.a.persona.app.model.content.code.ContentType;
import com.a.persona.app.model.content.domain.Content;
import com.a.persona.app.model.persona.dto.PersonaDto;
import com.a.persona.app.model.reference.domain.Reference;
import com.a.persona.app.model.persona.domain.Persona;
import com.a.persona.app.model.reference.dto.ReferenceDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class ContentDto {

    private Long id;

    private Long persona;

    private ReferenceDto reference;

    private String img;

    private ContentType type;

    private String description;

    public static ContentDto fromEntity(Content content) {
        return ContentDto.builder()
                .id(content.getId())
                // Persona 엔티티를 PersonaDto로 변환 (방금 만든 로직 활용)
                .persona(content.getPersona() != null ? content.getPersona().getId() : null)
                // Reference 엔티티를 ReferenceDto로 변환
                .reference(content.getReference() != null ? ReferenceDto.fromEntity(content.getReference()) : null)
                .img(content.getImg())
                .type(content.getType())
                .description(content.getDescription())
                .build();
    }
}
