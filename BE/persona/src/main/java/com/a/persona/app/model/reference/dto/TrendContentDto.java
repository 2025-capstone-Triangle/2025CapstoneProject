package com.a.persona.app.model.reference.dto;

import com.a.persona.app.model.content.code.ContentType;
import com.a.persona.app.model.content.domain.Content;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class TrendContentDto {

    private Long id;

    private ReferenceDto reference;

    private String img;

    private ContentType type;

    public static TrendContentDto fromEntity(Content content) {
        return TrendContentDto.builder()
                .id(content.getId())
                // Reference 엔티티를 ReferenceDto로 변환
                .reference(content.getReference() != null ? ReferenceDto.fromEntity(content.getReference()) : null)
                .img(content.getImg())
                .type(content.getType())
                .build();
    }
}
