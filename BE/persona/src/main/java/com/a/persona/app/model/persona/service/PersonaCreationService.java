package com.a.persona.app.model.persona.service;

import com.a.persona.app.controller.persona.payload.LikeAnswerRequest;
import com.a.persona.app.model.persona.dto.PersonaDto;
import com.a.persona.app.model.progress.service.ProgressService;
import com.a.persona.infra.config.AmazonConfig;
import com.a.persona.infra.feign.AiServerApi;
import com.a.persona.infra.feign.dto.PersonaRequest;
import com.a.persona.infra.feign.dto.PersonaResponseWrapper;
import com.a.persona.infra.s3.AmazonS3Manager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class PersonaCreationService {

    private final PersonaService personaService;
    private final AiWaitingQueueService aiWaitingQueueService;
    private final ProgressService progressService;
    private final AiServerApi aiServerApi;
    private final AmazonS3Manager s3Manager;
    private final AmazonConfig amazonConfig;

    @Async("personaTaskExecutor")
    public CompletableFuture<PersonaDto> createPersona(
            String username,
            MultipartFile profile,
            MultipartFile image,
            MultipartFile voice,
            LikeAnswerRequest preferenceType,
            List<Long> tone,
            String sessionId
    ) {

        try {
            // 1. Preference 저장 (짧은 트랜잭션으로 즉시 커밋)
            Long preferenceId = personaService.savePreference(preferenceType, tone);

            // 2. S3 업로드 (트랜잭션 불필요)
            String fileName = (username != null ? username : "guest") + "_" + UUID.randomUUID();
            String profileUrl = s3Manager.upload(profile, amazonConfig.getImagePath(), fileName);
            String pictureUrl = s3Manager.upload(image, amazonConfig.getImagePath(), fileName);
            String voiceUrl   = s3Manager.upload(voice, amazonConfig.getVoicePath(), fileName);

            // 3. 대기열 진입 → SSE로 대기 순서 알림
            long position = aiWaitingQueueService.enterQueue(sessionId);
            progressService.sendQueued(sessionId, position);

            // 4. 슬롯 대기 (블로킹, DB 커넥션 미점유)
            aiWaitingQueueService.acquire();

            // acquire() 성공 직후 바로 try로 감싸야 release() 누락 방지
            try {
                aiWaitingQueueService.leaveQueue(sessionId);

                // 5. 처리 시작 알림
                progressService.sendProcessing(sessionId);

                // 6. AI 서버 호출
                PersonaRequest request = PersonaRequest.builder()
                        .answers(preferenceType)
                        .q8_tone(tone)
                        .images(pictureUrl)
                        .voice(voiceUrl)
                        .session_id(sessionId)
                        .build();

                PersonaResponseWrapper result = aiServerApi.analyzePersona(request);

                // 7. Persona 저장 (짧은 트랜잭션으로 즉시 커밋)
                return CompletableFuture.completedFuture(
                        personaService.finalizePersona(username, preferenceId, result, profileUrl)
                );

            } finally {
                // 예외 발생 여부와 관계없이 반드시 슬롯 반환
                aiWaitingQueueService.release();
            }

        } catch (IOException | InterruptedException e) {
            log.error("페르소나 생성 중 오류: {}", e.getMessage());
            CompletableFuture<PersonaDto> failed = new CompletableFuture<>();
            failed.completeExceptionally(e);
            return failed;
        }
    }
}