package com.a.persona.app.model.notice.service;

import com.a.persona.app.controller.admin.notice.payload.AdminNoticeRequest;
import com.a.persona.app.model.notice.domain.Notice;
import com.a.persona.app.model.notice.dto.NoticeDto;
import com.a.persona.app.model.notice.repo.NoticeRepository;
import com.a.persona.infra.error.exceptions.CommonException;
import com.a.persona.infra.response.ResponseCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class AdminNoticeService {

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
        return NoticeDto.fromEntity(noticeRepository.findByIdAndIsActive(id, true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND)));
    }

    /**
     * 새로운 공지사항을 생성합니다.
     * @param adminNoticeRequest 생성되도록 요청된 공지사항 정보
     */
    public void createNotice(AdminNoticeRequest adminNoticeRequest) {

        Notice notice = Notice.builder()
                .title(adminNoticeRequest.getTitle())
                .content(adminNoticeRequest.getContent())
                .isPinned(adminNoticeRequest.getIsPinned())
                .isDraft(adminNoticeRequest.getIsDraft())
                .build();
        noticeRepository.save(notice);
    }

    /**
     * 공지사항을 수정합니다.
     * @param id 해당 공지사항 아이디
     * @param adminNoticeRequest 수정될 공지사항 정보
     */
    public void updateNotice(Long id, AdminNoticeRequest adminNoticeRequest) {
        Notice notice = noticeRepository.findByIdAndIsActive(id, true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        notice.setTitle(adminNoticeRequest.getTitle());
        notice.setContent(adminNoticeRequest.getContent());
        notice.setIsPinned(adminNoticeRequest.getIsPinned());
        notice.setIsDraft(adminNoticeRequest.getIsDraft());
        noticeRepository.save(notice);
    }

    /**
     * 해당 아이디의 공지사항을 삭제합니다.
     * @param id 공지 아이디
     */
    public void deleteNotice(Long id) {
        Notice notice = noticeRepository.findByIdAndIsActive(id, true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        notice.setIsActive(false);
        noticeRepository.save(notice);
    }
}
