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
        try {
            // 1. DB에서 AI 요청 데이터 준비 (짧은 트랜잭션으로 즉시 커밋)
            AiTrendContentRequest aiRequest = referenceService.buildAiTrendRequest(username, code, referenceId, contentType);

            // 2. 대기열 진입 → SSE로 대기 순서 알림
            long position = aiWaitingQueueService.enterQueue(sessionId);
            progressService.sendQueued(sessionId, position);

            // 3. 슬롯 대기 중 3초마다 현재 대기 순서 갱신 전송
            ScheduledExecutorService positionScheduler = Executors.newSingleThreadScheduledExecutor();
            ScheduledFuture<?> positionTask = positionScheduler.scheduleAtFixedRate(() -> {
                long currentPos = aiWaitingQueueService.getPosition(sessionId);
                if (currentPos > 0) {
                    progressService.sendQueued(sessionId, currentPos);
                }
            }, 3, 3, TimeUnit.SECONDS);

            // 4. 슬롯 대기 (블로킹, DB 커넥션 미점유)
            try {
                aiWaitingQueueService.acquire();
            } finally {
                positionTask.cancel(false);
                positionScheduler.shutdown();
            }

            try {
                aiWaitingQueueService.leaveQueue(sessionId);

                // 5. 처리 시작 알림
                progressService.sendProcessing(sessionId);

                // 6. AI 서버 호출 (generated_image_url null이면 1회 재요청)
                ContentResponse response = createTrendContentWithRetry(aiRequest);

                // 7. 컨텐츠 저장 (짧은 트랜잭션으로 즉시 커밋)
                return CompletableFuture.completedFuture(
                        referenceService.finalizeTrendContent(username, code, referenceId, response, contentType)
                );

            } finally {
                // 예외 발생 여부와 관계없이 반드시 슬롯 반환
                aiWaitingQueueService.release();
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("트렌드 컨텐츠 생성 중단됨 (스레드 인터럽트): {}", e.getMessage());
            CompletableFuture<TrendContentDto> failed = new CompletableFuture<>();
            failed.completeExceptionally(e);
            return failed;
        }
    }

    private ContentResponse createTrendContentWithRetry(AiTrendContentRequest request) {
        ContentResponse response = aiServerApi.createTrendContent(request);
        if (response.getGenerated_image_url() == null) {
            log.warn("AI 서버 응답에 generated_image_url이 없습니다. 재요청합니다.");
            response = aiServerApi.createTrendContent(request);
            if (response.getGenerated_image_url() == null) {
                log.error("재요청 후에도 generated_image_url이 null입니다.");
            }
        }
        return response;
    }
}