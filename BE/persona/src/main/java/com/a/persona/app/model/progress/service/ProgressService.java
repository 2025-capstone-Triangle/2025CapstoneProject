package com.a.persona.app.model.progress.service;

import com.a.persona.app.controller.progress.payload.ProgressRequest;
import com.a.persona.app.model.progress.repo.SseEmitterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProgressService {

    private final SseEmitterRepository sseEmitterRepository;

    public SseEmitter connect(String jobId) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        sseEmitterRepository.save(jobId, emitter);

        emitter.onCompletion(() -> sseEmitterRepository.delete(jobId));
        emitter.onTimeout(() -> sseEmitterRepository.delete(jobId));
        emitter.onError(e -> sseEmitterRepository.delete(jobId));

        sendEvent(emitter, "connect", "connected");

        return emitter;
    }

    public void sendProgress(ProgressRequest request) {
        sseEmitterRepository.findByJobId(request.getSessionId())
                .ifPresent(emitter -> {
                    sendEvent(emitter, "progress", request);

                    if ("completed".equals(request.getSessionId()) || "error".equals(request.getSessionId())) {
                        emitter.complete();
                    }
                });
    }

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
