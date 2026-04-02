package com.a.persona.app.controller.progress;

import com.a.persona.app.controller.progress.payload.ProgressRequest;
import com.a.persona.app.model.progress.service.ProgressService;
import com.a.persona.infra.response.CommonApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Tag(name="진행상황", description = "ai 서버와 통신 시 진행상황 공유를 위한 API 입니다.")
@RestController
@RequestMapping(value = "/api/v1/progress", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Slf4j
@Controller
public class ProgressController {

    private final ProgressService sseService;

    @PostMapping
    @Operation(summary = "[AI 서버용] 진행 상황 공유", description = "ai 서버에서 단계별로 진행 될 때의 상황을 공유받을 API 입니다.<br>" +
            "sessionId에는 persona 진단 시에 함께 들어간 callback_url의 내용을, 그 외에는 직접 String type으로 생성하여 보내주세요.<br>" +
            "진단 완료 시에는 fe와 be의 SSE 연결 종료를 위해 꼭 step에 completed 라는 내용을 담아 보내주세요.")
    public ResponseEntity<CommonApiResponse<Void>> receiveProgress(
        ProgressRequest request
    ) {
        sseService.sendProgress(request);

        return ResponseEntity.ok(CommonApiResponse.noContent());
    }

    @Operation(summary = "[FE 서버용] SSE 연결", description = "fe에서 페르소나 진단 경과를 공유받기 위해 SSE를 연결하는 API 입니다.<br>" +
            "sessionId는 직접 생성하여 보내주세요. 단 현재 연결되어 있는 SSE의 sessionId와는 겹치지 않도록 생성해주세요.<br>" +
            "페르소나 진단 요청을 보내기 전, connect라는 이벤트가 수신되었는지 확인하고 진단 요청을 보낼 수 있도록 조정해주세요.")
    @GetMapping(value = "/{sessionId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter connect(@PathVariable String sessionId) {
        return sseService.connect(sessionId);
    }


}
