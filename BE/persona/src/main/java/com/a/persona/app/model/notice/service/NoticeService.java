package com.a.persona.app.model.notice.service;

import com.a.persona.app.model.notice.dto.NoticeDto;
import com.a.persona.app.model.notice.repo.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class NoticeService {

    private  final NoticeRepository noticeRepository;

    /**
     * 모든 공지사항을 조회합니다.
     * @return List<NoticeDto>
     */
    public List<NoticeDto> getAllNotice() {
        return noticeRepository.findByIsActive(true).stream().map(
                NoticeDto::fromEntity
        ).toList();
    }

    /**
     * 해당하는 id의 공지사항을 조회합니다.
     * @param id 조회할 공지사항 id
     * @return NoticeDto
     */
    public NoticeDto getNotice(Long id) {
        return NoticeDto.fromEntity(noticeRepository.findByIdAndIsActive(id, true));
    }
}
