package com.a.persona.app.model.member.service;

import com.a.persona.app.controller.auth.payload.SignupRequest;
import com.a.persona.app.model.auth.code.Role;
import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.member.repo.MemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 이메일을 통해 중복된 사용자가 있는지 검색합니다.
     * @param email 사용자 이메일
     * @return Boolean
     */
    public boolean isEmailExists(String email) {

        return memberRepository.findByEmailAndIsActive(email,true).isPresent();
    }

    /**
     * 아이디(username을 통해 중복된 사용자가 있는지 검색합니다.)
     * @param username 사용자 아이디
     * @return Boolean
     */
    public boolean isUsername(String username) {

        return memberRepository.findByUsernameAndIsActive(username,true).isPresent();
    }

    /**
     * 새로운 멤버를 추가합니다.
     * @param signupRequest 새로운 멤버의 정보
     */
    public void createMember(SignupRequest signupRequest) {
        Member member = Member.builder()
                .username(signupRequest.getUsername())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .email(signupRequest.getEmail())
                .role(Role.ROLE_USER)
                .birth(signupRequest.getBirth())
                .sex(signupRequest.getSex())
                .is_creator(signupRequest.getIs_creator())
                .build();

        memberRepository.save(member);
    }
}
