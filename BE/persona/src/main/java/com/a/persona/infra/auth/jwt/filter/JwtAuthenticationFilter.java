package com.a.persona.infra.auth.jwt.filter;

import com.a.persona.app.model.auth.code.AuthToken;
import com.a.persona.app.model.auth.token.AccessTokenBlackListRepository;
import com.a.persona.app.model.auth.token.RefreshTokenService;
import com.a.persona.app.model.auth.token.UserBlackListRepository;
import com.a.persona.app.model.auth.token.entity.RefreshToken;
import com.a.persona.app.model.auth.token.entity.UserBlackList;
import com.a.persona.infra.auth.jwt.JwtTokenProvider;
import com.a.persona.infra.auth.jwt.TokenCookieFactory;
import com.a.persona.infra.auth.jwt.dto.AccessTokenDto;
import com.a.persona.infra.error.exceptions.CommonException;
import com.a.persona.infra.response.ResponseCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j // ◀◀◀ 롬복 Slf4j 어노테이션 추가
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final RefreshTokenService refreshTokenService;
    private final UserBlackListRepository userBlackListRepository;
    private final AccessTokenBlackListRepository accessTokenBlackListRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.domain-only}")
    private String appDomain;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        List<String> excludePath = new ArrayList<>();
        excludePath.addAll(List.of("/api/v1/auth/signup", "/api/v1/auth/signin", "/favicon.ico", "/img", "/js", "/css", "/download","/api/v1/notify/subscribe"));
        excludePath.addAll(List.of("/api/v1/check", "/api/v1/auth/email", "/api/v1/auth/code", "/error"));
        String path = request.getRequestURI();
        return excludePath.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String accessToken = jwtTokenProvider.resolveToken(request, AuthToken.ACCESS_TOKEN);

        if (accessToken == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            if (jwtTokenProvider.validateToken(accessToken, request)) {

                Claims claims = jwtTokenProvider.getClaims(accessToken);
                if (accessTokenBlackListRepository.existsById(claims.getSubject() + ":" + claims.getId())) {
                    log.warn("JwtAuthenticationFilter: Access token {} is blacklisted.", claims.getId());
                    filterChain.doFilter(request, response);
                    return;
                }

                Authentication authentication = jwtTokenProvider.getAuthentication(accessToken);

                if (userBlackListRepository.existsById(authentication.getName())) {
                    log.warn("JwtAuthenticationFilter: User {} is in blacklist.", authentication.getName());
                    filterChain.doFilter(request, response);
                    return;
                }

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                log.warn("JwtAuthenticationFilter: Access token is invalid.");
            }
        } catch (ExpiredJwtException e) {
            log.warn("JwtAuthenticationFilter: Access token has expired. Attempting to refresh.");
            manageTokenRefresh(accessToken, request, response);
        } catch (Exception e) {
            log.error("JwtAuthenticationFilter: An unexpected error occurred during token processing.", e);
        }

        filterChain.doFilter(request, response);
    }

    private void manageTokenRefresh(
        String accessToken,
        HttpServletRequest request,
        HttpServletResponse response) throws IOException {

        Claims claims = jwtTokenProvider.getClaims(accessToken);
        if (userBlackListRepository.existsById(claims.getSubject())) {
            log.warn("JwtAuthenticationFilter: User {} is in blacklist, refresh token will not be processed.", claims.getSubject());
            return;
        }

        String refreshToken = jwtTokenProvider.resolveToken(request, AuthToken.REFRESH_TOKEN);
        if (refreshToken == null) {
            log.warn("JwtAuthenticationFilter: Refresh token not found for expired access token.");
            return;
        }

        RefreshToken rt = refreshTokenService.findByAccessTokenId(claims.getId());

        if (rt == null) {
            log.warn("JwtAuthenticationFilter: No matching refresh token found in DB for access token jti: {}", claims.getId());
            return;
        }

        if (!rt.getToken().equals(refreshToken)) {
            log.error("JwtAuthenticationFilter: SECURITY INCIDENT - Refresh token mismatch for user {}. User will be blacklisted.", claims.getSubject());
            userBlackListRepository.save(new UserBlackList(claims.getSubject()));
            throw new CommonException(ResponseCode.SECURITY_INCIDENT);
        }

        addToken(response, claims, rt);
    }

    private void addToken(HttpServletResponse response, Claims claims, RefreshToken refreshToken) {
        String username = claims.getSubject();
        AccessTokenDto newAccessToken = jwtTokenProvider.generateAccessToken(username,
            (String) claims.get("roles"));
        Authentication authentication = jwtTokenProvider.getAuthentication(newAccessToken.getToken());

        SecurityContextHolder.getContext().setAuthentication(authentication);

        RefreshToken newRefreshToken = refreshTokenService.renewingToken(refreshToken.getAtId(), newAccessToken.getJti());

        ResponseCookie accessTokenCookie = TokenCookieFactory.create(AuthToken.ACCESS_TOKEN.name(),
            newAccessToken.getToken(), jwtTokenProvider.getAccessTokenExpiration(), appDomain);

        ResponseCookie refreshTokenCookie = TokenCookieFactory.create(
            AuthToken.REFRESH_TOKEN.name(),
            newRefreshToken.getToken(),
            newRefreshToken.getTtl(), appDomain);

        response.addHeader("Set-Cookie", accessTokenCookie.toString());
        response.addHeader("Set-Cookie", refreshTokenCookie.toString());
    }
}