package com.a.persona.app.model.notice.dto;

import com.a.persona.app.model.notice.domain.Notice;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class NoticeDto {

    private Long id;

    private String title;

    private String content;

    private Boolean isPinned;

    private Boolean isDraft;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Boolean isActive;


    public static NoticeDto fromEntity(Notice notice) {
        return NoticeDto.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .isPinned(notice.getIsPinned())
                .isDraft(notice.getIsDraft())
                .createdAt(notice.getCreatedAt())
                .updatedAt(notice.getUpdatedAt())
                .isActive(notice.getIsActive())
                .build();
    }

}
