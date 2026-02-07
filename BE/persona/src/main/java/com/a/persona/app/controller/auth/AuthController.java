package com.a.persona.app.controller.auth;

import com.a.persona.app.controller.auth.payload.*;
import com.a.persona.app.controller.member.payload.EmailRequest;
import com.a.persona.app.model.auth.AuthService;
import com.a.persona.app.model.auth.dto.TokenDto;
import com.a.persona.app.model.mail.MailService;
import com.a.persona.app.model.member.service.MemberService;
import com.a.persona.infra.response.CommonApiResponse;
import com.a.persona.infra.response.ResponseCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Map;

@Tag(name = "인증", description = "로그인 및 인증 관련 API입니다. <br><br>" +
        "⚠️ <b>로그아웃 안내</b><br>" +
        "• URL: <code>POST /api/v1/logout</code><br>")
@RestController
@RequestMapping(value = "/api/v1", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Slf4j
@Controller
public class AuthController {

    private final AuthService authService;
    private final MemberService memberService;
    private final MailService mailService;

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
            "사용자 성별은 ENUM값(FEMALE, MALE, ETC)으로 관리됩니다. ")
    @PostMapping("/signup")
    public ResponseEntity<CommonApiResponse<ResponseCode>> signup(
            @RequestBody SignupRequest signupRequest
    ) {

        memberService.createMember(signupRequest);

        return ResponseEntity.ok()
                .body(CommonApiResponse.success(ResponseCode.OK));
    }


    /**
     * 중복 확인 처리 API<br>
     * 요청객체에서 이메일 또는 아이디 중 둘 중 하나만 입력이 되어야 하며,<br>
     * 이메일, 아이디가 모두 담겨있거나 모두 없는 경우 오류코드 반환
     * @param duplicationCheckRequest 이메일 또는 아이디를 담는 요청 객체
     * @return 검사 성공시 {@code Boolean} 형을 응답에 담아 보내며,<br>
     * 잘못 된 요청인 경우 {@code HttpStatus.BAD_REQUEST} 반환
     */
    @PostMapping("/check")
    @Operation(summary = "중복 검사", description = "중복된 이메일 또는 닉네임이 존재하는지 확인합니다.<br>"
            + "이메일 또는 닉네임이 이미 존재하는지 <code>Boolean</code> 으로 반환합니다.<br>"
            + "요청시 이메일 또는 닉네임 둘중 하나만 값이 있어야 하며, 둘다 null이거나 데이터를 가지고 있다면 <code>400(BadRequest)</code>를 반환합니다.")
    public ResponseEntity<CommonApiResponse<Map<String, Boolean>>> isDuplicated(
            @RequestBody DuplicationCheckRequest duplicationCheckRequest
    ) {
        String email = duplicationCheckRequest.getEmail();
        String username = duplicationCheckRequest.getUsername();
        if(email != null && username == null){
            if(memberService.isEmailExists(email))
                return ResponseEntity.ok(CommonApiResponse.success(Map.of("isDuplicated", true)));
            return ResponseEntity.ok(CommonApiResponse.success(Map.of("isDuplicated", false)));
        } else if (email == null && username != null){
            if(memberService.isUsername(username))
                return ResponseEntity.ok(CommonApiResponse.success(Map.of("isDuplicated", true)));
            return  ResponseEntity.ok(CommonApiResponse.success(Map.of("isDuplicated", false)));
        } else {
            return ResponseEntity.badRequest().body(CommonApiResponse.error(ResponseCode.BAD_REQUEST));
        }
    }

    /**
     * 이메일로 코드 전송
     * @param emailRequest
     * @return
     */
    @PostMapping("/check-email")
    @Operation(summary = "이메일 코드 요청", description = "첨부된 이메일로 코드를 발송합니다.<br>")
    public ResponseEntity<CommonApiResponse<Void>> createVerifyCode(
            @RequestBody @Valid EmailRequest emailRequest
    ){
        String userEmail = emailRequest.getEmail();
        try {
            // 이메일 발송
            mailService.sendVerificationEmail(userEmail);
            return ResponseEntity.ok(CommonApiResponse.noContent());
        } catch (MessagingException | IOException e) {
            return ResponseEntity.internalServerError().body(CommonApiResponse.error(ResponseCode.INTERNAL_SERVER_ERROR));
        }
    }


    /**
     * 코드 발송 확인
     * @param verifyEmailRequest
     * @return
     */
    @PostMapping("/verify-code")
    @Operation(summary = "코드 검증", description = "입력된 코드가 적절한지 검증합니다.<br>")
    public ResponseEntity<CommonApiResponse<Void>> verifyEmail(
            @RequestBody @Valid VerifyEmailRequest verifyEmailRequest
    ) {
        if(verifyEmailRequest.getCode()==null) {
            return ResponseEntity.badRequest().body(CommonApiResponse.error(ResponseCode.BAD_REQUEST));
        }

        String userEmail = verifyEmailRequest.getEmail();
        if(authService.isVerifyCode(userEmail, verifyEmailRequest.getCode())) {
            return ResponseEntity.ok(CommonApiResponse.noContent());
        }
        return ResponseEntity.status(ResponseCode.INVALID_CODE.status())
                .body(CommonApiResponse.error(ResponseCode.INVALID_CODE));
    }



}
