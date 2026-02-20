package com.a.persona.app.model.member.service;

import com.a.persona.app.model.member.code.Status;
import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.member.dto.MemberDto;
import com.a.persona.app.model.member.repo.MemberRepository;
import com.a.persona.infra.error.exceptions.CommonException;
import com.a.persona.infra.response.ResponseCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@Transactional
@RequiredArgsConstructor
public class AdminMemberService {

    private final MemberRepository memberRepository;

    /**
     * 멤버를 전체 조회합니다.
     * @return List<MemberDto>
     */
    public List<MemberDto> getAllMember() {
        return memberRepository.findAllByIsActive(true).stream().map(
                MemberDto::fromEntity
        ).toList();
    }

    /**
     * 아이디에 해당하는 멤버를 조회합니다.
     * @param id 멤버 아이디
     * @return MemberDto
     */
    public MemberDto getMember(Long id) {

        return MemberDto.fromEntity(memberRepository.findByIdAndIsActive(id, true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND)));
    }

    /**
     * 멤버의 상태를 변경합니다.
     * @param id 멤버 아이디
     * @param status 상태
     */
    public void changeMemberStatus(Long id, Status status) {

        Member member = memberRepository.findByIdAndIsActive(id, true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        member.setStatus(status);
        memberRepository.save(member);

    }
}
