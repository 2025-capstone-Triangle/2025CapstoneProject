package com.a.persona.app.controller.admin.notify;

import com.a.persona.app.controller.admin.notify.payload.AdminNoticeRequest;
import com.a.persona.app.controller.admin.notify.payload.AdminNoticeResponse;
import com.a.persona.app.model.notice.service.AdminNoticeService;
import com.a.persona.infra.response.CommonApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name="(관리자) 공지 관리", description = "관리자가 사용할 수 있는 공지사항 관리 관련 API입니다.")
@RestController
@RequestMapping(value = "/api/v1/admin/notice", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Slf4j
@Controller
public class AdminNoticeController {

    private final AdminNoticeService adminNoticeService;

    // 공지 조회 (전체/단건)
    @GetMapping
    @Operation(summary = "공지사항 조회", description = "공지사항을 전체/단건 조회합니다.<br>" +
            "공지사항의 id와 함께 요청할 경우, 해당하는 공지사항 단건 조회도 가능합니다.")
    public ResponseEntity<CommonApiResponse<List<AdminNoticeResponse>>> getNotice(
            @RequestParam(required = false) Long id
    ) {
        List<AdminNoticeResponse> responses;

        if(id == null){
            responses = adminNoticeService.getAllNotice().stream().map(
                    AdminNoticeResponse::from
            ).toList();
        }else{
            responses = List.of(AdminNoticeResponse.from(adminNoticeService.getNotice(id)));
        }

        return ResponseEntity.ok(CommonApiResponse.success(responses));
    }

    // 공지 등록
    @PostMapping
    @Operation(summary = "공지사항 등록", description = "공지사항을 전체/단건 조회합니다.<br>" +
            "공지사항의 id와 함께 요청할 경우, 해당하는 공지사항 단건 조회도 가능합니다.")
    public ResponseEntity<CommonApiResponse<Void>> getNotice(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AdminNoticeRequest adminNoticeRequest

    ) {
        adminNoticeService.createNotice(adminNoticeRequest.getTitle(), adminNoticeRequest.getContent(),userDetails.getUsername());
        return ResponseEntity.ok(CommonApiResponse.noContent());
    }

    // 공지 수정
    @PatchMapping("/{id}")
    @Operation(summary = "공지사항 수정", description = "해당 id의 공지사항을 수정합니다.<br>")
    public ResponseEntity<CommonApiResponse<Void>> updateNotice(
            @Valid @RequestBody AdminNoticeRequest adminNoticeRequest,
            @PathVariable Long id
    ) {
        adminNoticeService.updateNotice(id, adminNoticeRequest.getTitle(), adminNoticeRequest.getContent());
        return ResponseEntity.ok(CommonApiResponse.noContent());
    }

    // 공지 삭제
    @DeleteMapping("/{id}")
    @Operation(summary = "공지사항 삭제", description = "해당 id의 공지사항을 삭제합니다.<br>")
    public ResponseEntity<CommonApiResponse<Void>> deleteNotice(
            @PathVariable Long id
    ) {
            adminNoticeService.deleteNotice(id);
            return ResponseEntity.ok(CommonApiResponse.noContent());
    }

}
