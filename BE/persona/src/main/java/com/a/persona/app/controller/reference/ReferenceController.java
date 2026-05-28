package com.a.persona.app.controller.reference;

import com.a.persona.app.controller.reference.payload.ReferenceLikeReqeust;
import com.a.persona.app.controller.reference.payload.ReferenceStatResponse;
import com.a.persona.app.controller.reference.payload.TrendContentRequest;
import com.a.persona.app.controller.reference.payload.TrendContentResponse;
import com.a.persona.app.model.reference.dto.ReferenceStatDto;
import com.a.persona.app.model.reference.service.ReferenceCreationService;
import com.a.persona.app.model.reference.service.ReferenceService;
import com.a.persona.infra.response.CommonApiResponse;
import com.a.persona.infra.response.ResponseCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Tag(name="레퍼런스", description = "요즘 뜨는 컨텐츠 관련 API입니다.")
@RestController
@RequestMapping(value = "/api/v1/reference", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Slf4j
@Controller
public class ReferenceController {

    private final ReferenceService referenceService;
    private final ReferenceCreationService referenceCreationService;

    @GetMapping
    @Operation(summary = "레퍼런스 조회", description = "요즘 뜨는 컨텐츠 전체를 최신순으로 정렬하여 조회합니다. <br>" +
            "사용자가 로그인 상태일 시, 북마크 정보를 반환합니다. 그렇지 않을 시, 모두 false로 반환됩니다.")
    public ResponseEntity<CommonApiResponse<List<ReferenceStatResponse>>> getReference(
            @AuthenticationPrincipal UserDetails userDetails
    ){
        List<ReferenceStatDto> dtos;
        if(userDetails == null){
            dtos = referenceService.getAllReferences(null);
        }
        else{
            dtos = referenceService.getAllReferences(userDetails.getUsername());
        }

        List<ReferenceStatResponse> responses = dtos.stream().map(
                ReferenceStatResponse::from)
                .toList();
        return ResponseEntity.ok(CommonApiResponse.success(responses));
    }

    // 레퍼런스 좋아요 처리
    @PatchMapping
    @Operation(summary = "레퍼런스 북마크", description = "요즘 뜨는 컨텐츠를 북마크 처리 합니다.<br>" +
            "id는 해당 레퍼런스의 id입니다. like 안에 Boolean 값을 넣어 처리합니다.")
    public ResponseEntity<CommonApiResponse<Void>> likeReference(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ReferenceLikeReqeust referenceLikeReqeust
    ){
        referenceService.updateLike(userDetails.getUsername(), referenceLikeReqeust.getId(),referenceLikeReqeust.getLike());

        return ResponseEntity.ok(CommonApiResponse.noContent());
    }

    @PostMapping
    @Operation(summary = "레퍼런스를 바탕으로 컨텐츠 생성", description = "요즘 뜨는 컨텐츠를 바탕으로 컨텐츠를 생성합니다.<br>" +
            "persona 코드와, reference id를 입력하면 해당하는 레퍼런스와 페르소나를 참고하여 생성합니다.")
    public CompletableFuture<ResponseEntity<CommonApiResponse<TrendContentResponse>>> createTrendContent(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody TrendContentRequest request
    ) {
        return referenceCreationService.createTrendContent(
                        userDetails.getUsername(),
                        request.getCode(),
                        request.getReferenceId(),
                        request.getType(),
                        request.getSessionId()
                )
                .thenApply(dto -> ResponseEntity.ok(CommonApiResponse.success(TrendContentResponse.fromDto(dto))))
                .exceptionally(e -> {
                    log.error("트렌드 컨텐츠 생성 실패: {}", e.getMessage());
                    return ResponseEntity.<CommonApiResponse<TrendContentResponse>>internalServerError()
                            .body(CommonApiResponse.error(ResponseCode.INTERNAL_SERVER_ERROR));
                });
    }


}
