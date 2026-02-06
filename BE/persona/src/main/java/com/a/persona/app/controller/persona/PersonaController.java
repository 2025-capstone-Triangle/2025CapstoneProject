package com.a.persona.app.controller.persona;


import com.a.persona.app.controller.persona.payload.PersonaRequest;
import com.a.persona.app.controller.persona.payload.PersonaResponse;
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
     * @param userDetails
     * @return List<PersonaResponse>
     */
    @GetMapping()
    @Operation(summary = "페르소나 조회", description = "현재 로그인한 사용자의 페르소나를 조회합니다. <br>" +
            "Parameter에 페르소나 code를 넣을 시, 해당하는 페르소나에 대한 정보만을 반환합니다. <br>" +
            "그렇지 않을 경우, 해당 계정에 존재하는 모든 페르소나에 대한 정보가 출력됩니다.")
    public ResponseEntity<CommonApiResponse<List<PersonaResponse>>> getPersona(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Long id // todo code로 변경 필요
    ) {
        // 전체 조회
        if(id==null){
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
                            .build()
            ).toList();
            return ResponseEntity.ok(CommonApiResponse.success(responses));
        }

        // 단건 조회
        PersonaDto personaDto = personaService.findPersona(userDetails.getUsername(), id);
        List<PersonaResponse> responses = List.of(PersonaResponse.builder()
                .id(personaDto.getId())
                .name(personaDto.getName())
                .profile(personaDto.getProfile())
                .keywords(personaDto.getKeywords())
                .colors(personaDto.getColors())
                .createdAt(personaDto.getCreatedAt())
                .updatedAt(personaDto.getUpdatedAt())
                .isActive(personaDto.getIsActive())
                .build());

        return ResponseEntity.ok(CommonApiResponse.success(responses));
    }

    // 페르소나 진단
    @PostMapping()
    @Operation(summary = "페르소나 진단", description = "현재 로그인한 사용자의 페르소나를 새로 진단합니다. <br>" +
            "저장 전, 결과 화면을 보여주기 위해 사용되는 API입니다. <br>" +
            "진단 후, 페르소나의 id를 같이 보냅니다. 추후 페르소나 저장 시에 위 id를 함께 보내면 저장할 수 있습니다.<br>" +
            "(이미지 파일은 jpg, 음성 파일은 wav로 통일)")
    public ResponseEntity<CommonApiResponse<PersonaResponse>> createPersona(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart("image") List<MultipartFile> image,   // 파일 파트
            @RequestPart("voice") List<MultipartFile> voice,   // 파일 파트
            @RequestPart("preferenceType") String preferenceType
    ) {
        PersonaDto personaDto = null;
        try {
            personaDto = personaService.createPersona(userDetails.getUsername(), image, voice, preferenceType);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(CommonApiResponse.error(ResponseCode.INTERNAL_SERVER_ERROR));
        }
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

    // 페르소나 저장
    @PatchMapping("/save")
    @Operation(summary = "페르소나 저장", description = "현재 로그인한 사용자의 페르소나를 새로 진단합니다. <br>" +
            "저장 전, 결과 화면을 보여주기 위해 사용되는 API입니다.")
    public ResponseEntity<CommonApiResponse<List<PersonaResponse>>> savePersona(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String code
    ) {
        // todo code로 변경
        personaService.savePersona(userDetails.getUsername(), 1L);

        return ResponseEntity.ok(CommonApiResponse.noContent());
    }

    // 페르소나 수정

    // 페르소나 공유
    
    // 페르소나 삭제
    @DeleteMapping("/{id}")
    @Operation(summary = "페르소나 삭제", description = "해당 페르소나를 soft delete합니다. <br>" +
            "연관된 모든 정보도 전부 soft delete 됩니다.(로그, 멤버 제외)")
    public ResponseEntity<CommonApiResponse<Void>> deleteMember(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        //todo 연관된 테이블 정리
        personaService.deletePersona(userDetails.getUsername(), id);
        return ResponseEntity.ok(CommonApiResponse.noContent());
    }

}
