package com.a.persona.app.model.reference.service;

import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.member.repo.MemberRepository;
import com.a.persona.app.model.reference.domain.Reference;
import com.a.persona.app.model.reference.domain.ReferenceLike;
import com.a.persona.app.model.reference.dto.ReferenceStatDto;
import com.a.persona.app.model.reference.repo.ReferenceLikeRepository;
import com.a.persona.app.model.reference.repo.ReferenceRepository;
import com.a.persona.infra.error.exceptions.NotFoundException;
import com.a.persona.infra.response.ResponseCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ReferenceService {

    private final ReferenceLikeRepository referenceLikeRepository;
    private final MemberRepository memberRepository;
    private final ReferenceRepository referenceRepository;

    /**
     * 요즘 뜨는 컨텐츠들을 사용된 횟수와 북마크 여부와 함께 반환합니다.
     * @param username 사용자 이름
     * @return
     */
    public List<ReferenceStatDto> getAllReferences(String username) {
        List<ReferenceStatDto> references = new ArrayList<>();
        // 비회원
        if(username == null){
            references = referenceRepository.findByIsActive(true);
        }
        // 회원
        references = referenceRepository.findByIsActiveAndLike(false, username);

        return references;

    }

    /**
     * 요즘 뜨는 컨텐츠의 북마크 상태를 변경합니다.
     * @param username 사용자 이름
     * @param id 요즘 뜨는 컨텐츠의 아이디
     * @param like 북마크 상태
     */
    public void updateLike(String username, Long id, Boolean like) {

        Reference reference = referenceRepository.findById(id).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        Member member = memberRepository.findByUsername(username).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        ReferenceLike referenceLike = referenceLikeRepository.findByReferenceAndMember(reference, member);

        if(referenceLike == null){
            referenceLike = ReferenceLike.builder()
                    .member(member)
                    .reference(reference)
                    .build();
        }

        referenceLike.setIsActive(like);
        referenceLikeRepository.save(referenceLike);
    }
}
