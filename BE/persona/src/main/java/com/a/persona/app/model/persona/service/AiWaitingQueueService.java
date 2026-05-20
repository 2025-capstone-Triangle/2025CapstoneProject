package com.a.persona.app.model.persona.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.Semaphore;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiWaitingQueueService {

    private static final String WAITING_KEY = "ai:queue:waiting";
    private static final int MAX_CONCURRENT = 2;

    // fair=true: 먼저 대기한 스레드가 먼저 슬롯 획득
    private final Semaphore semaphore = new Semaphore(MAX_CONCURRENT, true);
    private final RedisTemplate<String, Object> redisTemplate;

    // 대기열 진입 → 현재 내 순서 반환
    // rightPush()는 push 후 새 리스트 길이를 원자적으로 반환하므로 별도 size() 호출 불필요
    public long enterQueue(String sessionId) {
        Long position = redisTemplate.opsForList().rightPush(WAITING_KEY, sessionId);
        long pos = position != null ? position : 1;
        log.info("[AI 대기열] sessionId={} 진입 | 현재 대기 순서: {}번째", sessionId, pos);
        return pos;
    }

    // 현재 대기열에서 내 순서 반환 (없으면 0)
    public long getPosition(String sessionId) {
        List<Object> queue = redisTemplate.opsForList().range(WAITING_KEY, 0, -1);
        if (queue == null) return 0;
        int index = queue.indexOf(sessionId);
        return index >= 0 ? index + 1 : 0;
    }

    // 슬롯 획득 후 대기열에서 제거
    public void leaveQueue(String sessionId) {
        redisTemplate.opsForList().remove(WAITING_KEY, 1, sessionId);
    }

    // 슬롯이 날 때까지 스레드 블로킹 (DB 커넥션 미점유 상태)
    public void acquire() throws InterruptedException {
        log.info("[AI 슬롯] 슬롯 대기 시작 | 남은 슬롯: {}", semaphore.availablePermits());
        semaphore.acquire();
        log.info("[AI 슬롯] 슬롯 획득 완료");
    }

    // 처리 완료 후 슬롯 반환
    public void release() {
        semaphore.release();
        log.info("[AI 슬롯] 슬롯 반환 | 남은 슬롯: {}", semaphore.availablePermits());
    }
}