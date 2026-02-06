package com.a.persona.app.controller.member;


import com.a.persona.app.controller.member.payload.EmailRequest;
import com.a.persona.app.controller.member.payload.MemberRequest;
import com.a.persona.app.controller.member.payload.MemberResponse;
import com.a.persona.app.controller.member.payload.PasswordRequest;
import com.a.persona.app.model.member.dto.MemberDto;
import com.a.persona.app.model.member.service.MemberService;
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

import java.util.Objects;

@Tag(name="멤버", description = "멤버 관련 API입니다.")
@RestController
@RequestMapping(value = "/api/v1/member", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Slf4j
@Controller
public class MemberController {

    private final MemberService memberService;

    /**
     * 현재 로그인한 멤버의 정보를 가져옵니다.
     * @param userDetails
     * @return MemberResponse
     */
    @GetMapping()
    @Operation(summary = "멤버 정보 조회", description = "현재 로그인한 사용자의 정보를 조회합니다. <br>" +
            "만약 현재 로그인한 멤버의 정보를 찾을 수 없는 경우, {@code HttpStatus.NOT_FOUND} 가 반환됩니다. ")
    public ResponseEntity<CommonApiResponse<MemberResponse>> getCurrentMember(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        MemberDto memberDto = memberService.getMember(userDetails.getUsername());
        MemberResponse memberResponse = MemberResponse.fromDto(memberDto);
        return ResponseEntity.ok(CommonApiResponse.success(memberResponse));
    }

    /**
     * 입력된 비밀번호가 맞는지 확인합니다.
     * @param userDetails
     * @param passwordRequest
     * @return Boolean
     */
    @PostMapping("/check")
    @Operation(summary = "비밀번호 검증", description = "입력된 비밀번호와 현재 로그인한 사용자의 비밀번호를 비교하여 검증합니다.")
    public ResponseEntity<CommonApiResponse<Boolean>> isCorrect(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid PasswordRequest passwordRequest
    ) {
        String currentPassword = userDetails.getPassword();
        return ResponseEntity.ok(CommonApiResponse.success(Objects.equals(currentPassword, passwordRequest.getPassword())));
    }

    /**
     * 멤버의 비밀번호를 변경합니다.
     * @param userDetails
     * @param passwordRequest
     * @return
     */
    @PatchMapping("/password")
    @Operation(summary = "비밀번호 변경", description = "입력된 비밀번호로 현재 로그인한 사용자의 비밀번호를 변경합니다.")
    public ResponseEntity<CommonApiResponse<Void>> updatePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid PasswordRequest passwordRequest
    ){
        memberService.updatePassword(userDetails.getUsername(), passwordRequest.getPassword());
        return ResponseEntity.ok(CommonApiResponse.noContent());
    }

    /**
     * 멤버의 비밀번호를 변경합니다.
     * @param userDetails
     * @param emailRequest
     * @return
     */
    @PatchMapping("/email")
    @Operation(summary = "이메일 변경", description = "입력된 이메일로 현재 로그인한 사용자의 이메일을 변경합니다.<br>" +
            "이메일 인증 미구현")
    public ResponseEntity<CommonApiResponse<Void>> updateEmail(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid EmailRequest emailRequest
            ){
        memberService.updateEmail(userDetails.getUsername(), emailRequest.getEmail());
        return ResponseEntity.ok(CommonApiResponse.noContent());
    }

    /**
     * 멤버의 정보를 변경합니다.
     * @param userDetails
     * @param memberRequest
     * @return
     */
    @PatchMapping("")
    @Operation(summary = "멤버 정보 변경", description = "입력된 정보로 변경합니다.")
    public ResponseEntity<CommonApiResponse<Void>> updateMember(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody MemberRequest memberRequest
    ){
        memberService.updateMember(userDetails.getUsername(), memberRequest.toDto());
        return ResponseEntity.ok(CommonApiResponse.noContent());
    }

    // 회원 탈퇴
    @DeleteMapping("")
    @Operation(summary = "멤버 탈퇴", description = "현재 로그인한 멤버의 정보를 soft delete합니다. <br>" +
            "연관된 모든 정보도 전부 soft delete 됩니다.(로그 제외)")
    public ResponseEntity<CommonApiResponse<Void>> deleteMember(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        //todo 연관된 테이블 정리
        memberService.deleteMember(userDetails.getUsername());
        return ResponseEntity.ok(CommonApiResponse.noContent());
    }
}
