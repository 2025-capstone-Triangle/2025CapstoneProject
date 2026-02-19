package com.a.persona.app.controller.admin.notify.payload;

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
public class AdminNoticeResponse {

    Long id;
    String title;
    String author;
    String content;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    public static AdminNoticeResponse from(NoticeDto dto) {
        return AdminNoticeResponse.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .author(dto.getAuthor())
                .content(dto.getContent())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }



}
