package com.a.persona.app.controller.notice;


import com.a.persona.app.controller.notice.payload.NoticeResponse;
import com.a.persona.app.model.notice.service.NoticeService;
import com.a.persona.infra.response.CommonApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name="공지 조회", description = "공지사항 조회 관련 API입니다.")
@RestController
@RequestMapping(value = "/api/v1/notice", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Slf4j
@Controller
public class NoticeController {

    private final NoticeService noticeService;

    // 공지사항 조회
    @GetMapping
    @Operation(summary = "공지사항 조회", description = "공지사항을 전체/단건 조회합니다.<br>" +
            "공지사항의 id와 함께 요청할 경우, 해당하는 공지사항 단건 조회도 가능합니다.")
    public ResponseEntity<CommonApiResponse<List<NoticeResponse>>> getNotice(
            @RequestParam(required = false) Long id
    ) {
        List<NoticeResponse> responses;
        if(id == null){
            responses = noticeService.getAllNotice().stream().map(
                    NoticeResponse::from
            ).toList();
        }else{
            responses = List.of(NoticeResponse.from(noticeService.getNotice(id)));
        }

        return ResponseEntity.ok(CommonApiResponse.success(responses));
    }

    // pinned된 공지만 받기
    @GetMapping
    @Operation(summary = "고정된 공지사항 조회", description = "고정된 공지사항을 조회합니다.<br>")
    public ResponseEntity<CommonApiResponse<List<NoticeResponse>>> getPinnedNotice() {

        List<NoticeResponse> responses = noticeService.getPinnedNotice().stream().map(
                NoticeResponse::from
        ).toList();

        return ResponseEntity.ok(CommonApiResponse.success(responses));
    }
}
