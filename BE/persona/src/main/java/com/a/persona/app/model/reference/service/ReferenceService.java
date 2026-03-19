package com.a.persona.app.model.reference.service;

import com.a.persona.app.model.content.code.ContentType;
import com.a.persona.app.model.content.domain.Content;
import com.a.persona.app.model.content.repo.ContentRepository;
import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.member.repo.MemberRepository;
import com.a.persona.app.model.persona.domain.Persona;
import com.a.persona.app.model.persona.repo.PersonaRepository;
import com.a.persona.app.model.reference.domain.Reference;
import com.a.persona.app.model.reference.domain.ReferenceLike;
import com.a.persona.app.model.reference.dto.ReferenceStatDto;
import com.a.persona.app.model.reference.dto.TrendContentDto;
import com.a.persona.app.model.reference.repo.ReferenceLikeRepository;
import com.a.persona.app.model.reference.repo.ReferenceRepository;
import com.a.persona.infra.error.exceptions.NotFoundException;
import com.a.persona.infra.feign.AiServerApi;
import com.a.persona.infra.feign.dto.AiTrendContentRequest;
import com.a.persona.infra.feign.dto.ContentResponse;
import com.a.persona.infra.feign.dto.LikeAnswerData;
import com.a.persona.infra.feign.dto.ReportData;
import com.a.persona.infra.response.ResponseCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ReferenceService {

    private final ReferenceLikeRepository referenceLikeRepository;
    private final MemberRepository memberRepository;
    private final ReferenceRepository referenceRepository;
    private final PersonaRepository personaRepository;
    private final AiServerApi aiServerApi;
    private final ContentRepository contentRepository;

    /**
     * 요즘 뜨는 컨텐츠들을 사용된 횟수와 북마크 여부와 함께 반환합니다.
     * @param username 사용자 이름
     * @return List<ReferenceStatDto>
     */
    public List<ReferenceStatDto> getAllReferences(String username) {
        List<ReferenceStatDto> references;
        // 비회원
        if(username == null){
            references = referenceRepository.findByIsActive(true);
        }else{
            // 회원
            references = referenceRepository.findByIsActiveAndLike(false, username);
        }

        return references;

    }

    /**
     * 요즘 뜨는 컨텐츠의 북마크 상태를 변경합니다.
     * @param username 사용자 이름
     * @param id 요즘 뜨는 컨텐츠의 아이디
     * @param like 북마크 상태
     */
    @Transactional
    public void updateLike(String username, Long id, Boolean like) {

        Reference reference = referenceRepository.findById(id).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        Member member = memberRepository.findByUsername(username).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));

        if(like){
            ReferenceLike referenceLike = ReferenceLike.builder()
                    .member(member)
                    .reference(reference)
                    .build();
            referenceLikeRepository.save(referenceLike);
        }else {
            referenceLikeRepository.deleteReferenceLikeByReferenceAndMember(reference, member);
        }
    }

    public TrendContentDto createContent(String username, String code, Long referenceId, ContentType contentType) {

        Member member = memberRepository.findByUsername(username).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        Persona persona = personaRepository.findPersonaByMemberAndCodeAndIsActive(member, code, true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        Reference reference = referenceRepository.findById(referenceId).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));

        AiTrendContentRequest request = AiTrendContentRequest.builder()
                .trend_prompt(reference.getPrompt())
                .report(ReportData.builder()
                        .name(persona.getName())
                        .color_palette(persona.getColors().stream().toList())
                        .summary(persona.getSummary())
                        .traits(persona.getTraits())
                        .keywords(persona.getKeywords().stream().toList())
                        .build())
                .answers(LikeAnswerData.fromPreference(persona.getPreference()))
                .q8_tone(persona.getPreference().getQ8Tone())
                .user_image_url(persona.getProfile())
                .crop_type(contentType.value())
                .build();

        ContentResponse response = aiServerApi.createTrendContent(request);

        Content content = Content.builder()
                .persona(persona)
                .reference(reference)
                .img(response.getGenerated_image_url())
                .type(contentType)
                .build();

        contentRepository.save(content);

        return TrendContentDto.fromEntity(content);

    }
}
