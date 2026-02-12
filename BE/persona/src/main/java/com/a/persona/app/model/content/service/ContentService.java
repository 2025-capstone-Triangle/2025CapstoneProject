package com.a.persona.app.model.content.service;

import com.a.persona.app.controller.content.payload.ContentRequest;
import com.a.persona.app.model.content.domain.Content;
import com.a.persona.app.model.content.domain.ContentLike;
import com.a.persona.app.model.content.dto.ContentStatDto;
import com.a.persona.app.model.content.repo.ContentLikeRepository;
import com.a.persona.app.model.persona.dto.PersonaDto;
import com.a.persona.app.model.reference.domain.Reference;
import com.a.persona.app.model.content.dto.ContentDto;
import com.a.persona.app.model.content.repo.ContentRepository;
import com.a.persona.app.model.contentLog.service.ContentLogService;
import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.member.repo.MemberRepository;
import com.a.persona.app.model.persona.domain.Persona;
import com.a.persona.app.model.persona.repo.PersonaRepository;
import com.a.persona.app.model.reference.domain.ReferenceLike;
import com.a.persona.app.model.reference.repo.ReferenceRepository;
import com.a.persona.infra.error.exceptions.NotFoundException;
import com.a.persona.infra.response.ResponseCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ContentService {

    private final ContentRepository contentRepository;
    private final PersonaRepository personaRepository;
    private final MemberRepository memberRepository;
    private final ContentLogService contentLogService;
    private final ReferenceRepository referenceRepository;
    private final ContentLikeRepository contentLikeRepository;

    /**
     * 페르소나 코드를 통해 해당 페르소나의 모든 생성된 컨텐츠를 조회합니다.
     * @param code 페르소나 코드
     * @return
     */
    public List<ContentStatDto> getContent(String username, String code){
        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        Persona persona = personaRepository.findPersonaByMemberAndCodeAndIsActive(member,code,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        Content thumbnail = contentRepository.findByIdAndIsActive(persona.getThumbnailId(), true);


        List<ContentStatDto> contents = contentRepository.findByPersonaAndIsActive(persona,true);
        contents.forEach(c -> {c.setPersona(PersonaDto.fromEntity(persona, thumbnail));});

        return contents;

    }

    public void deleteContent(Long id) {
        Content content = contentRepository.findById(id).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        content.setIsActive(false);
        contentRepository.save(content);
    }

    public ContentDto createContent(String username, ContentRequest contentRequest) {
        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        Persona persona = personaRepository.findPersonaByMemberAndCodeAndIsActive(member,contentRequest.getCode(),true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        Reference reference = referenceRepository.findById(contentRequest.getReferenceId()).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        
        // todo AI server에 페르소나, 레퍼런스, 비율 전달
        
        Content content = Content.builder()
                .persona(persona)
                .reference(reference)
                .img("임시") // todo ai 연결 후 수정
                .description("임시")
                .type(contentRequest.getType())
                .build();
        
        // 생성 로그
        contentLogService.createContentLog(member,reference);

        return null;
    }

    /**
     * 컨텐츠의 북마크를 생성하거나 삭제합니다.
     * @param id 해당 컨텐츠
     * @param like 북마크 상태
     */
    public void updateLike(Long id, Boolean like) {

        Content content = contentRepository.findById(id).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));

        if(like){
            ContentLike contentLike = ContentLike.builder()
                    .content(content)
                    .build();
            contentLikeRepository.save(contentLike);
        }else {
            contentLikeRepository.deleteContentLikeByContent(content);
        }
    }
}
