package com.a.persona.app.model.progress.service;

import com.a.persona.app.controller.progress.payload.ProgressRequest;
import com.a.persona.app.model.progress.repo.SseEmitterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProgressService {

    private final SseEmitterRepository sseEmitterRepository;

    /**
     * FE 서버와 SSE 연결을 맺습니다.
     * @param sessionId SSE id
     * @return {@code SseEmitter}
     */
    public SseEmitter connect(String sessionId) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        sseEmitterRepository.save(sessionId, emitter);

        emitter.onCompletion(() -> sseEmitterRepository.delete(sessionId));
        emitter.onTimeout(() -> sseEmitterRepository.delete(sessionId));
        emitter.onError(e -> sseEmitterRepository.delete(sessionId));

        sendEvent(emitter, "connect", "connected");

        return emitter;
    }

    /**
     * 대기열에 들어간 상태를 전송합니다.
     * @param sessionId sse id
     * @param position 현재 대기열
     */
    public void sendQueued(String sessionId, long position) {
        sseEmitterRepository.findByJobId(sessionId).ifPresent(emitter ->
                sendEvent(emitter, "queued", Map.of("position", position))
        );
    }

    /**
     * 다시 돌입합니다.
     * @param sessionId sse id
     */
    public void sendProcessing(String sessionId) {
        sseEmitterRepository.findByJobId(sessionId).ifPresent(emitter ->
                sendEvent(emitter, "processing", "started")
        );
    }

    /**
     * ai 서버에서 넘어온 것을 전달합니다.
     * @param request
     */
    public void sendProgress(ProgressRequest request) {
        sseEmitterRepository.findByJobId(request.getSessionId())
                .ifPresent(emitter -> {
                    sendEvent(emitter, "progress", request);

                    if ("completed".equals(request.getStep()) || "error".equals(request.getStep())) {
                        emitter.complete();
                    }
                });
    }

    /**
     * 이벤트를 전송합니다.
     * @param emitter
     * @param eventName
     * @param data
     */
    private void sendEvent(SseEmitter emitter, String eventName, Object data) {
        try {
            emitter.send(SseEmitter.event()
                    .name(eventName)
                    .data(data));
        } catch (IOException e) {
            emitter.completeWithError(e);
        }
    }
}
