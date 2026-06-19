package com.a.persona.app.model.contentLog.service;

import com.a.persona.app.model.reference.domain.Reference;
import com.a.persona.app.model.contentLog.domain.ContentLog;
import com.a.persona.app.model.contentLog.repo.ContentLogRepository;
import com.a.persona.app.model.member.domain.Member;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class ContentLogService {

    private final ContentLogRepository contentLogRepository;

    /**
     * 컨텐츠 생성 시 로그를 생성합니다.
     * @param member
     * @param reference
     */
    public void createContentLog(Member member, Reference reference) {
        ContentLog contentLog = ContentLog.builder()
                .time(LocalDateTime.now())
                .member(member)
                .reference(reference)
                .build();

        contentLogRepository.save(contentLog);
    }
}
