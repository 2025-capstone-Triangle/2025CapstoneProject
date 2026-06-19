package com.a.persona.app.controller.content.payload;

import com.a.persona.app.model.content.code.ContentType;
import com.a.persona.app.model.content.dto.ContentDto;
import com.a.persona.app.model.persona.dto.PersonaDto;
import com.a.persona.app.model.reference.dto.ReferenceDto;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ContentResponse {

    Long id;

    ReferenceDto reference;

    String img;

    ContentType type;

    public static ContentResponse fromDto(ContentDto contentDto) {
        return ContentResponse.builder()
                .id(contentDto.getId())
                .reference(contentDto.getReference())
                .img(contentDto.getImg()) // 아까 TEXT로 바꾸셨던 그 S3 URL이 여기 들어가겠네요!
                .type(contentDto.getType())
                .build();
    }

}
