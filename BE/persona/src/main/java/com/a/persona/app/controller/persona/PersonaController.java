package com.a.persona.app.controller.persona;

import com.a.persona.app.controller.persona.payload.PersonaResponse;
import com.a.persona.app.controller.persona.payload.PersonaSaveRequest;
import com.a.persona.app.model.persona.dto.PersonaDto;
import com.a.persona.app.model.persona.service.PersonaService;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Tag(name="페르소나", description = "페르소나 관련 API입니다.")
@RestController
@RequestMapping(value = "/api/v1/persona", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Slf4j
@Controller
public class PersonaController {

    private final PersonaService personaService;

    /**
     * 현재 로그인한 멤버의 페르소나 리스트를 가져옵니다.
     * @param userDetails 로그인한 멤버
     * @param code 검색할 페르소나 코드
     * @return
     */
    @GetMapping()
    @Operation(summary = "페르소나 조회", description = "현재 로그인한 사용자의 페르소나를 조회합니다. <br>" +
            "Parameter에 페르소나 code를 넣을 시, 해당하는 페르소나에 대한 정보만을 반환합니다. <br>" +
            "그렇지 않을 경우, 해당 계정에 존재하는 모든 페르소나에 대한 정보가 출력됩니다.")
    public ResponseEntity<CommonApiResponse<List<PersonaResponse>>> getPersona(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String code
    ) {
        // 전체 조회
        if(code==null){
            List<PersonaDto> personas = personaService.findPersonas(userDetails.getUsername());
            List<PersonaResponse> responses = personas.stream().map(
                    personaDto -> PersonaResponse.builder()
                            .id(personaDto.getId())
                            .name(personaDto.getName())
                            .profile(personaDto.getProfile())
                            .keywords(personaDto.getKeywords())
                            .colors(personaDto.getColors())
                            .createdAt(personaDto.getCreatedAt())
                            .updatedAt(personaDto.getUpdatedAt())
                            .isActive(personaDto.getIsActive())
                            .code(personaDto.getCode())
                            .build()
            ).toList();
            return ResponseEntity.ok(CommonApiResponse.success(responses));
        }

        // 단건 조회
        PersonaDto personaDto = personaService.findPersona(userDetails.getUsername(), code);
        List<PersonaResponse> responses = List.of(PersonaResponse.builder()
                .id(personaDto.getId())
                .name(personaDto.getName())
                .profile(personaDto.getProfile())
                .keywords(personaDto.getKeywords())
                .colors(personaDto.getColors())
                .createdAt(personaDto.getCreatedAt())
                .updatedAt(personaDto.getUpdatedAt())
                .isActive(personaDto.getIsActive())
                .code(personaDto.getCode())
                .build());

        return ResponseEntity.ok(CommonApiResponse.success(responses));
    }

    /**
     * 주어진 데이터로 페르소나를 진단합니다.
     * @param userDetails 진단할 사용자
     * @param image 사용자 이미지
     * @param voice 사용자 목소리
     * @param preferenceType 사용자 선호 테스트 결과
     * @return
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "페르소나 진단", description = "현재 로그인한 사용자의 페르소나를 새로 진단합니다. <br>" +
            "저장 전, 결과 화면을 보여주기 위해 사용되는 API입니다. <br>" +
            "진단 후, 페르소나의 id를 같이 보냅니다. 추후 페르소나 저장 시에 위 id를 함께 보내면 저장할 수 있습니다.<br>" +
            "(이미지 파일은 jpg, 음성 파일은 wav로 통일)" +
            "json 파일로는 이미지나 음성 파일을 보낼 수 없어서 form data로 보내주세요")
    public ResponseEntity<CommonApiResponse<PersonaResponse>> createPersona(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart("image") List<MultipartFile> image,
            @RequestPart("voice") List<MultipartFile> voice,
            @RequestPart("preferenceType") String preferenceType
    ) {
        PersonaDto personaDto = null;
        String username = null;

        try {
            // 비회원 유저 고려
            if(userDetails!=null)
                username = userDetails.getUsername();
            
            // 페르소나 진단
            personaDto = personaService.createPersona(username, image, voice, preferenceType);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(CommonApiResponse.error(ResponseCode.INTERNAL_SERVER_ERROR));
        }

        // AI 연결 전 임시로
        if(personaDto==null){
            return ResponseEntity.ok(CommonApiResponse.noContent());
        }

        PersonaResponse response = PersonaResponse.builder()
                .id(personaDto.getId())
                .name(personaDto.getName())
                .profile(personaDto.getProfile())
                .keywords(personaDto.getKeywords())
                .colors(personaDto.getColors())
                .createdAt(personaDto.getCreatedAt())
                .updatedAt(personaDto.getUpdatedAt())
                .isActive(personaDto.getIsActive())
                .code(personaDto.getCode())
                .build();
        return ResponseEntity.ok(CommonApiResponse.success(response));
    }

    /**
     * 신규 페르소나 저장
     * @param userDetails 저장할 유저
     * @param personaSaveRequest 페르소나
     * @return
     */
    @PatchMapping("/save-new")
    @Operation(summary = "페르소나 저장", description = "현재 로그인한 사용자의 페르소나를 새로 진단합니다. <br>" +
            "저장 전, 결과 화면을 보여주기 위해 사용되는 API입니다.")
    public ResponseEntity<CommonApiResponse<List<PersonaResponse>>> savePersona(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PersonaSaveRequest personaSaveRequest
            ) {
        personaService.savePersona(userDetails.getUsername(), personaSaveRequest.getCode(), personaSaveRequest.getName());

        return ResponseEntity.ok(CommonApiResponse.noContent());
    }

    /**
     * 페르소나 이름 수정
     * @param userDetails 저장할 유저
     * @param personaSaveRequest 수정할 페르소나의 코드 및 새로운 이름
     * @return
     */
    @PatchMapping("")
    @Operation(summary = "페르소나 수정", description = "코드에 해당하는 페르소나의 이름을 수정합니다. <br>" +
            "저장 전, 결과 화면을 보여주기 위해 사용되는 API입니다.")
    public ResponseEntity<CommonApiResponse<List<PersonaResponse>>> updatePersona(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PersonaSaveRequest personaSaveRequest
    ) {
        personaService.updatePersona(userDetails.getUsername(), personaSaveRequest.getCode(), personaSaveRequest.getName());

        return ResponseEntity.ok(CommonApiResponse.noContent());
    }

    /**
     * 공유받은 페르소나를 저장합니다.
     * @param userDetails 저장할 유저
     * @param personaSaveRequest 저장할 페르소나읰 코드와 혹시나 변경한다면 이름
     * @return
     */
    @PatchMapping("/save-share")
    @Operation(summary = "공유받은 페르소나 저장", description = "공유 받은 페르소나를 저장합니다.<br>" +
            "내가 생각하기에 그 페르소나 결과 페이지로 넘어가서 이름도 편집할 수 있게 해 둠")
    public ResponseEntity<CommonApiResponse<Void>> saveSharedPersona(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PersonaSaveRequest personaSaveRequest
    ){
        personaService.saveSharedPersona(userDetails.getUsername(), personaSaveRequest.getCode(), personaSaveRequest.getName());
        return ResponseEntity.ok(CommonApiResponse.noContent());
    }

    /**
     * 해당 페르소나를 저장합니다.
     * @param userDetails
     * @param code
     * @return
     */
    @DeleteMapping("")
    @Operation(summary = "페르소나 삭제", description = "해당 페르소나를 soft delete합니다. <br>" +
            "연관된 모든 정보도 전부 soft delete 됩니다.(로그, 멤버 제외)")
    public ResponseEntity<CommonApiResponse<Void>> deleteMember(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String code
    ) {
        //todo 연관된 테이블 정리
        personaService.deletePersona(userDetails.getUsername(), code);
        return ResponseEntity.ok(CommonApiResponse.noContent());
    }

}
