package com.a.persona.app.model.progress.repo;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SseEmitterRepository {

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public void save(String jobId, SseEmitter emitter) {
        emitters.put(jobId, emitter);
    }

    public Optional<SseEmitter> findByJobId(String jobId) {
        return Optional.ofNullable(emitters.get(jobId));
    }

    public void delete(String jobId) {
        emitters.remove(jobId);
    }
}
