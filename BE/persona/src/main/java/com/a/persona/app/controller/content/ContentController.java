package com.a.persona.app.controller.content;

import com.a.persona.app.controller.content.payload.ContentRequest;
import com.a.persona.app.controller.content.payload.ContentResponse;
import com.a.persona.app.model.content.dto.ContentDto;
import com.a.persona.app.model.content.service.ContentService;
import com.a.persona.infra.response.CommonApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name="추가 컨텐츠 생성", description = "추가 컨텐츠 생성 관련 API입니다.")
@RestController
@RequestMapping(value = "/api/v1/content", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Slf4j
@Controller
public class ContentController {

    private final ContentService contentService;
    private final ModelMapper modelMapper;

    // content 조회
    @GetMapping("")
    @Operation(summary = "content 조회", description = "선택한 페르소나의 생성된 모든 컨텐츠를 조회합니다. <br>" +
            "페르소나 코드를 입력받습니다.")
    public ResponseEntity<CommonApiResponse<List<ContentResponse>>> getCurrentContent(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String code
    ) {
        // todo 단건 조회도 필요한가?
        List<ContentDto> contents = contentService.getContent(userDetails.getUsername(),code);
        List<ContentResponse> responses = contents.stream().map(
                contentDto ->
                    modelMapper.map(contentDto, ContentResponse.class)
        ).toList();

        return ResponseEntity.ok(CommonApiResponse.success(responses));
    }

    // content 생성
    @PostMapping()
    @Operation(summary = "content 생성", description = "현재 로그인한 사용자의 페르소나를 기반으로 컨텐츠를 생성합니다." +
            "Type(SQUARE(1:1), FEED(4:5), STORY(9:16))")
    public ResponseEntity<CommonApiResponse<ContentResponse>> createContent(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ContentRequest contentRequest
    ) {
        // todo ai server와 통신
        ContentResponse response = null;
        return ResponseEntity.ok(CommonApiResponse.success(response));
    }


    // content 삭제
    @DeleteMapping("/{id}")
    @Operation(summary = "content 삭제", description = "해당 content를 soft delete합니다. <br>" +
            "연관된 모든 정보도 전부 soft delete 됩니다.")
    public ResponseEntity<CommonApiResponse<Void>> deleteMember(
            @PathVariable Long id
    ) {
        //todo 연관된 테이블 정리
        contentService.deleteContent(id);
        return ResponseEntity.ok(CommonApiResponse.noContent());
    }
}
