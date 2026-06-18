package com.a.persona.app.model.member.service;

import com.a.persona.app.controller.auth.payload.SignupRequest;
import com.a.persona.app.model.auth.code.Role;
import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.member.dto.MemberDto;
import com.a.persona.app.model.member.repo.MemberRepository;
import com.a.persona.infra.error.exceptions.CommonException;
import com.a.persona.infra.response.ResponseCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class MemberService {

    private final ModelMapper modelMapper;
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

        if(isEmailExists(signupRequest.getEmail())) {
            throw new CommonException(ResponseCode.CONFLICT);
        }

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

    /**
     * 멤버의 정보를 조회합니다.
     * @param username 유저 아이디
     * @return MemberDto
     */
    public MemberDto getMember(String username) {

        Member member = memberRepository.findByUsernameAndIsActive(username, true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        return modelMapper.map(member, MemberDto.class);
    }

    /**
     * 멤버의 비밀번호를 변경합니다.
     * @param username
     * @param password
     */
    public void updatePassword(String username, String password) {
        Member member = memberRepository.findByUsernameAndIsActive(username, true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        member.setPassword(passwordEncoder.encode(password));
        memberRepository.save(member);
    }

    /**
     * 멤버의 이메일을 변경합니다.
     * @param username
     * @param email
     */
    public void updateEmail(String username, String email) {
        Member member = memberRepository.findByUsernameAndIsActive(username, true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        member.setEmail(email);
        memberRepository.save(member);
    }

    /**
     * 멤버의 기타 정보를 변경합니다.
     * @param username
     * @param memberDto
     */
    public void updateMember(String username, MemberDto memberDto) {

        Member member = memberRepository.findByUsernameAndIsActive(username, true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        if(memberDto.getIs_creator()!=null){
            member.setIs_creator(memberDto.getIs_creator());
        }
        if(memberDto.getBirth()!=null){
            member.setBirth(memberDto.getBirth());
        }
        if(memberDto.getSex()!=null){
            member.setSex(memberDto.getSex());
        }
        memberRepository.save(member);

    }

    /**
     * 멤버를 soft delete 합니다.
     * @param username
     */
    public void deleteMember(String username) {
        Member member = memberRepository.findByUsernameAndIsActive(username, true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        member.setIs_creator(false);
        memberRepository.save(member);
    }
}
