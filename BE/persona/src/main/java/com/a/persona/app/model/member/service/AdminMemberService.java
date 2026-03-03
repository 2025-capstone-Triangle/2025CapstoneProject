package com.a.persona.app.model.member.service;

import com.a.persona.app.model.member.code.Status;
import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.member.domain.MemberBlock;
import com.a.persona.app.model.member.dto.MemberStatDto;
import com.a.persona.app.model.member.repo.MemberBlockRepository;
import com.a.persona.app.model.member.repo.MemberRepository;
import com.a.persona.infra.error.exceptions.CommonException;
import com.a.persona.infra.response.ResponseCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;


@Service
@Transactional
@RequiredArgsConstructor
public class AdminMemberService {

    private final MemberRepository memberRepository;
    private final MemberBlockRepository memberBlockRepository;

    /**
     * 멤버를 전체 조회합니다.
     * @return List<MemberStatDto>
     */
    public List<MemberStatDto> getAllMember(Boolean isBlocked) {
        return memberRepository.findStatAllByIsActive(true, isBlocked);
    }

    /**
     * 아이디에 해당하는 멤버를 조회합니다.
     * @param id 멤버 아이디
     * @return MemberStatDto
     */
    public MemberStatDto getMember(Long id, Boolean isBlocked) {

        return memberRepository.findStatByIdAndIsActive(id, true, isBlocked).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
    }

    /**
     * 멤버의 상태를 변경합니다.
     * @param id 멤버 아이디
     * @param status 상태
     */
    public void changeMemberStatus(Long id, Status status, String reason) {

        Member member = memberRepository.findByIdAndIsActive(id, true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        member.setStatus(status);

        MemberBlock memberBlock = MemberBlock.builder()
                .member(member)
                .blockedAt(LocalDateTime.now())
                .reason(reason)
                .build();

        memberBlockRepository.save(memberBlock);
        memberRepository.save(member);

    }
}
