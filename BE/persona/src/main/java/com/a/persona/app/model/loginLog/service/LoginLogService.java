package com.a.persona.app.model.loginLog.service;

import com.a.persona.app.model.loginLog.domain.LoginLog;
import com.a.persona.app.model.loginLog.repo.LoginLogRepository;
import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.member.repo.MemberRepository;
import com.a.persona.infra.error.exceptions.NotFoundException;
import com.a.persona.infra.response.ResponseCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class LoginLogService {

    private final LoginLogRepository loginLogRepository;
    private final MemberRepository memberRepository;

    /**
     * 로그인 시 로그를 생성합니다.
     * @param username 로그인한 아이디
     */
    public void createLoginLog(String username) {

        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));

        LoginLog loginLog = LoginLog.builder()
                .time(LocalDateTime.now())
                .member(member)
                .build();

        loginLogRepository.save(loginLog);
    }
}
