package com.a.persona.app.model.auth;

import com.a.persona.app.controller.auth.payload.SigninRequest;
import com.a.persona.app.model.auth.dto.TokenDto;
import com.a.persona.app.model.auth.token.RefreshTokenService;
import com.a.persona.app.model.auth.token.UserBlackListRepository;
import com.a.persona.app.model.auth.token.entity.RefreshToken;
import com.a.persona.infra.auth.jwt.JwtTokenProvider;
import com.a.persona.infra.auth.jwt.dto.AccessTokenDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AuthService {

    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final UserBlackListRepository userBlackListRepository;
//    private final LoginLogService loginLogService;

    public TokenDto signin(SigninRequest signinRequest) {
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(signinRequest.getUsername(),
                        signinRequest.getPassword());

        // loadUserByUsername + password 검증 후 인증 객체 반환
        // 인증 실패 시: AuthenticationException 발생
        Authentication authentication = authenticationManagerBuilder.getObject()
                .authenticate(authenticationToken);
        // todo 로그인시 자동으로 로그인 기록 저장

        return processSignin(authentication);
    }

    /**
     * Spring Security 에서 인증을 수동으로 처리한 후,<br>
     * 인증 객체를 SecurityContext에 직접 설정하고,<br>
     * 인증된 사용자 정보를 기반으로 토큰 발급
     * @param authentication
     * @return {@code TokenDto}
     */
    public TokenDto processSignin(Authentication authentication) {
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String roles =  String.join(",", authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList());
        return processTokenSignin(authentication.getName(), roles);
    }

    public TokenDto processTokenSignin(String email, String roles) {
        // black list 에 있다면 해제
        userBlackListRepository.deleteById(email);

        // 3. 인증 정보를 기반으로 JWT 토큰 생성
        AccessTokenDto accessToken = jwtTokenProvider.generateAccessToken(email, roles);
        RefreshToken refreshToken = refreshTokenService.saveWithAtId(accessToken.getJti());

        return TokenDto.builder()
                .accessToken(accessToken.getToken())
                .atId(accessToken.getJti())
                .refreshToken(refreshToken.getToken())
                .grantType("Bearer")
                .refreshExpiresIn(jwtTokenProvider.getRefreshTokenExpiration())
                .expiresIn(jwtTokenProvider.getAccessTokenExpiration())
                .build();
    }

}
