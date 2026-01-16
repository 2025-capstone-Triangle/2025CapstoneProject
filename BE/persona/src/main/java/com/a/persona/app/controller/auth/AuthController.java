package com.a.persona.app.controller.auth;

import com.a.persona.app.controller.auth.payload.SigninRequest;
import com.a.persona.app.controller.auth.payload.SignupRequest;
import com.a.persona.app.controller.auth.payload.TokenResponse;
import com.a.persona.app.model.auth.AuthService;
import com.a.persona.app.model.auth.dto.TokenDto;
import com.a.persona.app.model.member.service.MemberService;
import com.a.persona.infra.response.CommonApiResponse;
import com.a.persona.infra.response.ResponseCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name="인증", description = "로그인 및 인증 관련 API입니다.")
@RestController
@RequestMapping(value = "/api/v1", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Slf4j
@Controller
public class AuthController {

    private final AuthService authService;
    private final MemberService memberService;

    /**
     * 로그인 처리 매서드
     * @param signinRequest 로그인 요청 객체
     * @param response 응답에 사용할 서블렛 객체
     * @return AccessToken, RefreshToken 을 담아 반환
     */
    @PostMapping("/signin")
    @Operation(summary = "로그인", description = "로그인 요청을 처리합니다.<br>"
            + "로그인에 성공한 경우, 비동기로 로그인 로그에 로그인 기록을 저장합니다. (이 부분은 아직 미구현)")
    public ResponseEntity<CommonApiResponse<TokenResponse>> login(
            @RequestBody SigninRequest signinRequest,
            HttpServletResponse response
    ) {
        TokenDto tokenDto = authService.signin(signinRequest);

        return ResponseEntity.ok(CommonApiResponse.success(TokenResponse.getTokenResponse(tokenDto, response)));
    }

    /**
     * 회원가입 요청을 처리합니다.
     *
     * @param signupRequest
     * @return 계정이 이미 존재하는 경우 {@code HttpStatus.CONFLICT}를, 그 외의 경우는 {@code HttpStatus.OK}
     */
    @Operation(summary = "회원가입", description = "회원가입 요청을 처리합니다. <br>" +
            "사용자 생년월일은 YYYY-MM-DD 의 형식입니다." +
            "사용자 성별은 ENUM값(FEMALE, MALE)으로 관리됩니다. ")
    @PostMapping("/signup")
    public ResponseEntity<CommonApiResponse<ResponseCode>> signup(
            @RequestBody SignupRequest signupRequest
    ) {

        memberService.createMember(signupRequest);

        return ResponseEntity.ok()
                .body(CommonApiResponse.success(ResponseCode.OK));
    }

}
