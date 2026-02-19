package com.a.persona.app.controller.notify.payload;

import com.a.persona.app.model.notice.dto.NoticeDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeResponse {

    Long id;
    String title;
    String author;
    String content;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    public static NoticeResponse from(NoticeDto dto) {
        return NoticeResponse.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .author(dto.getAuthor())
                .content(dto.getContent())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }



}
