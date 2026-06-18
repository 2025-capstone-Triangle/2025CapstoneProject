package com.a.persona.app.controller.admin.reference;

import com.a.persona.app.controller.admin.reference.payload.AdminReferenceResponse;
import com.a.persona.app.model.reference.service.AdminReferenceService;
import com.a.persona.infra.response.CommonApiResponse;
import com.a.persona.infra.response.ResponseCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Tag(name="(관리자) 요즘 뜨는 컨텐츠 관리", description = "관리자가 사용할 수 있는 요즘 뜨는 컨텐츠 관리 API입니다.")
@RestController
@RequestMapping(value = "/api/v1/admin/reference", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Slf4j
@Controller
public class AdminReferenceController {

    private final AdminReferenceService adminReferenceService;

    // 컨텐츠 조회
    @GetMapping
    @Operation(summary = "요즘 뜨는 컨텐츠 조회", description = "요즘 뜨는 컨텐츠(레퍼런스)를 전체/단건 조회합니다.<br>" +
            "레퍼런스의 id와 함께 요청할 경우, 해당하는 레퍼런스 단건 조회도 가능합니다.")
    public ResponseEntity<CommonApiResponse<List<AdminReferenceResponse>>> getReference(
            @RequestParam(required = false) Long id
    ){
        List<AdminReferenceResponse> responses;
        if(id==null){
            responses = adminReferenceService.getAllReference().stream().map(
                    AdminReferenceResponse::from
            ).toList();
        }else{
            responses = adminReferenceService.getReference(id).stream().map(
                    AdminReferenceResponse::from
            ).toList();
        }

        return ResponseEntity.ok(CommonApiResponse.success(responses));

    }

    // 컨텐츠 추가
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "요즘 뜨는 컨텐츠 생성", description = "요즘 뜨는 컨텐츠(레퍼런스)를 생성합니다.<br>" +
            "form data로 보내주세요. <br>")
    public ResponseEntity<CommonApiResponse<Void>> createReference(
        @RequestPart("image") MultipartFile image,
        @RequestPart("name") String name,
        @RequestPart("prompt") String prompt,
        @RequestPart(value = "description", required = false) String description
    ) {

        try {
            adminReferenceService.createReference(image, name, prompt, description);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(CommonApiResponse.error(ResponseCode.INTERNAL_SERVER_ERROR));
        }
        return ResponseEntity.ok(CommonApiResponse.noContent());
    }

    // 컨텐츠 수정
    // 컨텐츠 추가
    @PatchMapping(path = "/{id}",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "요즘 뜨는 컨텐츠 수정", description = "요즘 뜨는 컨텐츠(레퍼런스)를 수정합니다.<br>" +
            "form data로 보내주세요. <br>" +
            "수정 사항이 없으면 혹시 아무것도 안 넣어서 보내주실 수 있나요?")
    public ResponseEntity<CommonApiResponse<Void>> updateReference(
            @PathVariable Long id,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "name", required = false) String name,
            @RequestPart(value = "prompt", required = false) String prompt,
            @RequestPart(value = "description", required = false) String description
    ) {

        try {
            adminReferenceService.updateReference(id, image, name, prompt, description);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(CommonApiResponse.error(ResponseCode.INTERNAL_SERVER_ERROR));
        }
        return ResponseEntity.ok(CommonApiResponse.noContent());
    }

    // 컨텐츠 삭제
    @DeleteMapping("/{id}")
    @Operation(summary = "요즘 뜨는 컨텐츠 삭제", description = "요즘 뜨는 컨텐츠(레퍼런스)를 삭제합니다.<br>" +
            "레퍼런스의 id에 해당하는 레퍼런스를 삭제합니다.")
    public ResponseEntity<CommonApiResponse<Void>> deleteReference(
            @PathVariable Long id
    ) {

        adminReferenceService.deleteReference(id);
        return ResponseEntity.ok(CommonApiResponse.noContent());
    }

}
