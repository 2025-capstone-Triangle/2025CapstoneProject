package com.a.persona.infra.auth.jwt.filter;

import com.a.persona.app.model.auth.code.AuthToken;
import com.a.persona.app.model.auth.token.AccessTokenBlackListRepository;
import com.a.persona.app.model.auth.token.RefreshTokenService;
import com.a.persona.app.model.auth.token.entity.TokenBlackList;
import com.a.persona.infra.auth.jwt.JwtTokenProvider;
import com.a.persona.infra.auth.jwt.TokenCookieFactory;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class LogoutFilter extends OncePerRequestFilter {
    
    private final RefreshTokenService refreshTokenService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AccessTokenBlackListRepository accessTokenBlackListRepository;

    @Value("${app.domain-only}")
    private String appDomain;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
        FilterChain filterChain) throws ServletException, IOException {
        
        String accessToken = jwtTokenProvider.resolveToken(request, AuthToken.ACCESS_TOKEN);
        
        if(accessToken == null){
            filterChain.doFilter(request,response);
            return;
        }
        
        String path = request.getRequestURI();
        Claims claims  = jwtTokenProvider.getClaims(accessToken);
        
        if(path.equals("/api/v1/logout")){
            refreshTokenService.deleteByAccessTokenId(claims.getId());

            long remainingSeconds = (claims.getExpiration().getTime() - System.currentTimeMillis()) / 1000;
            if (remainingSeconds > 0) {
                accessTokenBlackListRepository.save(
                    new TokenBlackList(claims.getSubject(), claims.getId(), remainingSeconds)
                );
            }

            SecurityContextHolder.clearContext();
            ResponseCookie expiredAccessToken = TokenCookieFactory.createExpiredToken(AuthToken.ACCESS_TOKEN.name(), appDomain);
            ResponseCookie expiredRefreshToken = TokenCookieFactory.createExpiredToken(AuthToken.REFRESH_TOKEN.name(), appDomain);
            ResponseCookie expiredSessionId = TokenCookieFactory.createExpiredToken(AuthToken.AUTH_SERVER_SESSION_ID.name(), appDomain);
            response.addHeader("Set-Cookie", expiredAccessToken.toString());
            response.addHeader("Set-Cookie", expiredRefreshToken.toString());
            response.addHeader("Set-Cookie", expiredSessionId.toString());
            response.sendRedirect("/");
        }
        
        filterChain.doFilter(request,response);
    }
}
