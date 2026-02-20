package com.a.persona.app.controller.notice.payload;

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
    String content;
    Boolean isPinned;
    Boolean isDraft;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    public static NoticeResponse from(NoticeDto dto) {
        return NoticeResponse.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .content(dto.getContent())
                .isDraft(dto.getIsDraft())
                .isPinned(dto.getIsPinned())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }



}
