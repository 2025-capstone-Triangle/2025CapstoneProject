package com.a.persona.app.model.reference.service;

import com.a.persona.app.model.content.code.ContentType;
import com.a.persona.app.model.persona.service.AiWaitingQueueService;
import com.a.persona.app.model.progress.service.ProgressService;
import com.a.persona.app.model.reference.dto.TrendContentDto;
import com.a.persona.infra.feign.AiServerApi;
import com.a.persona.infra.feign.dto.AiTrendContentRequest;
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
public class ReferenceCreationService {

    private final ReferenceService referenceService;
    private final AiWaitingQueueService aiWaitingQueueService;
    private final ProgressService progressService;
    private final AiServerApi aiServerApi;

    @Async("referenceTaskExecutor")
    public CompletableFuture<TrendContentDto> createTrendContent(
            String username,
            String code,
            Long referenceId,
            ContentType contentType,
            String sessionId
    ) {
        log.info("[TrendContent] START | user={} code={} referenceId={} type={} sessionId={} thread={}",
                username, code, referenceId, contentType, sessionId, Thread.currentThread().getName());
        try {
            // 1. DB에서 AI 요청 데이터 준비
            log.debug("[TrendContent] STEP1 buildAiTrendRequest | user={} sessionId={}", username, sessionId);
            AiTrendContentRequest aiRequest = referenceService.buildAiTrendRequest(username, code, referenceId, contentType);
            log.debug("[TrendContent] STEP1 done | trend_prompt={}", aiRequest.getTrend_prompt());

            // 2. 대기열 진입
            log.debug("[TrendContent] STEP2 enterQueue | sessionId={}", sessionId);
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
            log.debug("[TrendContent] STEP4 acquire slot | sessionId={}", sessionId);
            try {
                aiWaitingQueueService.acquire();
            } finally {
                positionTask.cancel(false);
                positionScheduler.shutdown();
            }
            log.debug("[TrendContent] STEP4 slot acquired | sessionId={}", sessionId);

            try {
                aiWaitingQueueService.leaveQueue(sessionId);
                progressService.sendProcessing(sessionId);

                // 5. AI 서버 호출
                log.info("[TrendContent] STEP5 AI call start | sessionId={}", sessionId);
                ContentResponse response = createTrendContentWithRetry(aiRequest);
                log.info("[TrendContent] STEP5 AI call done | sessionId={} imageUrl={}", sessionId, response.getGenerated_image_url());

                // 6. 컨텐츠 저장
                log.debug("[TrendContent] STEP6 finalize | sessionId={}", sessionId);
                TrendContentDto result = referenceService.finalizeTrendContent(username, code, referenceId, response, contentType);
                log.info("[TrendContent] DONE | user={} sessionId={}", username, sessionId);
                return CompletableFuture.completedFuture(result);

            } finally {
                aiWaitingQueueService.release();
                log.debug("[TrendContent] slot released | sessionId={}", sessionId);
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("[TrendContent] INTERRUPTED | user={} sessionId={}", username, sessionId, e);
            CompletableFuture<TrendContentDto> failed = new CompletableFuture<>();
            failed.completeExceptionally(e);
            return failed;
        } catch (Exception e) {
            log.error("[TrendContent] FAILED | user={} sessionId={} error={}", username, sessionId, e.getMessage(), e);
            CompletableFuture<TrendContentDto> failed = new CompletableFuture<>();
            failed.completeExceptionally(e);
            return failed;
        }
    }

    private ContentResponse createTrendContentWithRetry(AiTrendContentRequest request) {
        log.debug("[TrendContent] feign createTrendContent call | trend_prompt={}", request.getTrend_prompt());
        ContentResponse response = aiServerApi.createTrendContent(request);
        log.debug("[TrendContent] feign createTrendContent response | imageUrl={}", response.getGenerated_image_url());
        if (response.getGenerated_image_url() == null) {
            log.warn("[TrendContent] generated_image_url null, retrying...");
            response = aiServerApi.createTrendContent(request);
            if (response.getGenerated_image_url() == null) {
                log.error("[TrendContent] retry 후에도 generated_image_url=null");
            }
        }
        return response;
    }
}