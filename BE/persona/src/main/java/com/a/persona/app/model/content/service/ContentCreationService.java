package com.a.persona.app.model.content.service;

import com.a.persona.app.controller.content.payload.ContentRequest;
import com.a.persona.app.model.content.code.ContentType;
import com.a.persona.app.model.content.dto.ContentDto;
import com.a.persona.app.model.persona.service.AiWaitingQueueService;
import com.a.persona.app.model.progress.service.ProgressService;
import com.a.persona.infra.feign.AiServerApi;
import com.a.persona.infra.feign.dto.AiContentRequest;
import com.a.persona.infra.feign.dto.ContentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentCreationService {

    private final ContentService contentService;
    private final AiWaitingQueueService aiWaitingQueueService;
    private final ProgressService progressService;
    private final AiServerApi aiServerApi;

    @Async("contentTaskExecutor")
    public CompletableFuture<ContentDto> createContent(
            String username,
            ContentRequest contentRequest,
            String sessionId
    ) {
        log.info("[Content] START | user={} code={} type={} sessionId={} thread={}",
                username, contentRequest.getCode(), contentRequest.getType(), sessionId, Thread.currentThread().getName());
        try {
            // 1. DB에서 AI 요청 데이터 준비
            log.debug("[Content] STEP1 buildAiRequest | user={} sessionId={}", username, sessionId);
            AiContentRequest aiRequest = contentService.buildAiRequest(username, contentRequest);
            log.debug("[Content] STEP1 done | aiRequest={}", aiRequest);

            // 2. 대기열 진입
            log.debug("[Content] STEP2 enterQueue | sessionId={}", sessionId);
            long position = aiWaitingQueueService.enterQueue(sessionId);
            progressService.sendQueued(sessionId, position);

            // 3. 슬롯 대기 중 3초마다 순서 갱신
            ScheduledExecutorService positionScheduler = Executors.newSingleThreadScheduledExecutor();
            ScheduledFuture<?> positionTask = positionScheduler.scheduleAtFixedRate(() -> {
                long currentPos = aiWaitingQueueService.getPosition(sessionId);
                if (currentPos > 0) {
                    progressService.sendQueued(sessionId, currentPos);
                }
            }, 3, 3, TimeUnit.SECONDS);

            // 4. 슬롯 대기
            log.debug("[Content] STEP4 acquire slot | sessionId={}", sessionId);
            try {
                aiWaitingQueueService.acquire();
            } finally {
                positionTask.cancel(false);
                positionScheduler.shutdown();
            }
            log.debug("[Content] STEP4 slot acquired | sessionId={}", sessionId);

            try {
                aiWaitingQueueService.leaveQueue(sessionId);
                progressService.sendProcessing(sessionId);

                // 5. AI 서버 호출
                log.info("[Content] STEP5 AI call start | sessionId={}", sessionId);
                ContentResponse response = createContentWithRetry(aiRequest);
                log.info("[Content] STEP5 AI call done | sessionId={} imageUrl={}", sessionId, response.getGenerated_image_url());

                // 6. 컨텐츠 저장
                log.debug("[Content] STEP6 finalize | sessionId={}", sessionId);
                ContentDto result = contentService.finalizeContent(username, contentRequest.getCode(), response, contentRequest.getType());
                log.info("[Content] DONE | user={} sessionId={} contentId={}", username, sessionId, result);
                return CompletableFuture.completedFuture(result);

            } finally {
                aiWaitingQueueService.release();
                log.debug("[Content] slot released | sessionId={}", sessionId);
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("[Content] INTERRUPTED | user={} sessionId={}", username, sessionId, e);
            CompletableFuture<ContentDto> failed = new CompletableFuture<>();
            failed.completeExceptionally(e);
            return failed;
        } catch (Exception e) {
            log.error("[Content] FAILED | user={} sessionId={} error={}", username, sessionId, e.getMessage(), e);
            CompletableFuture<ContentDto> failed = new CompletableFuture<>();
            failed.completeExceptionally(e);
            return failed;
        }
    }

    private ContentResponse createContentWithRetry(AiContentRequest request) {
        log.debug("[Content] feign createContent call | request={}", request);
        ContentResponse response = aiServerApi.createContent(request);
        log.debug("[Content] feign createContent response | imageUrl={}", response.getGenerated_image_url());
        if (response.getGenerated_image_url() == null) {
            log.warn("[Content] generated_image_url null, retrying...");
            response = aiServerApi.createContent(request);
            if (response.getGenerated_image_url() == null) {
                log.error("[Content] retry 후에도 generated_image_url=null");
            }
        }
        return response;
    }
}