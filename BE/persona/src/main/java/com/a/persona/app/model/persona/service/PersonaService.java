package com.a.persona.app.model.persona.service;

import com.a.persona.app.controller.persona.payload.LikeAnswerRequest;
import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.member.repo.MemberRepository;
import com.a.persona.app.model.persona.domain.Persona;
import com.a.persona.app.model.persona.domain.Preference;
import com.a.persona.app.model.persona.dto.PersonaDto;
import com.a.persona.app.model.persona.repo.PersonaRepository;
import com.a.persona.app.model.persona.repo.PreferenceRepository;
import com.a.persona.app.model.personaLog.service.PersonaLogService;
import com.a.persona.infra.error.exceptions.NotFoundException;
import com.a.persona.infra.feign.dto.PersonaResponseWrapper;
import com.a.persona.infra.nanoid.CodeGenerator;
import com.a.persona.infra.response.ResponseCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PersonaService {


    private final PersonaRepository personaRepository;
    private final MemberRepository memberRepository;
    private final PersonaLogService personaLogService;
    private final PreferenceRepository preferenceRepository;


    /**
     * 사용자의 모든 페르소나를 조회합니다.
     * @param username 사용자의 아이디
     * @return List<PersonaDto>
     */
    public List<PersonaDto> findPersonas(String username) {

        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));

        List<Persona> personas = personaRepository.findPersonasByMemberAndIsActiveAndIsSaved(member,true,true);

        return new ArrayList<>(
                personas.stream().map(
                        PersonaDto::fromEntity
                ).toList()
        );
    }

    /**
     * 해당하는 페르소나를 조회합니다.
     * @param username 유저 아이디
     * @param code 조회할 페르소나
     * @return PersonaDto
     */
    public PersonaDto findPersona(String username, String code) {
        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        Persona persona = personaRepository.findPersonaByMemberAndCodeAndIsActive(member,code,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        return PersonaDto.fromEntity(persona);
    }

    /**
     * code에 해당하는 페르소나를 삭제하는 메소드
     * @param username 유저 아이디
     * @param code 삭제할 페르소나 코드
     */
    public void deletePersona(String username, String code) {
        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        Persona persona = personaRepository.findPersonaByMemberAndCodeAndIsActive(member,code,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        persona.setIsActive(false);
        personaRepository.save(persona);
    }

    /**
     * 진단한 페르소나를 저장하는 메소드
     * @param username 유저 아이디
     * @param code 페르소나 코드
     * @param name 페르소나 이름
     */
    public void savePersona(String username, String code, String name) {
        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        Persona persona = personaRepository.findPersonaByMemberAndCodeAndIsActive(member,code,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        persona.setIsSaved(true);
        if(name!=null)
            persona.setName(name);

        personaRepository.save(persona);
    }

    /**
     * Preference를 저장하고 ID를 반환합니다. PersonaCreationService에서 호출됩니다.
     */
    public Long savePreference(LikeAnswerRequest preferenceType, List<Long> tone) {
        Preference preference = Preference.builder()
                .q1Environment(preferenceType.getQ1_environment())
                .q2Style(preferenceType.getQ2_style())
                .q3MinimalMaximal(preferenceType.getQ3_minimal_maximal())
                .q4Mood(preferenceType.getQ4_mood())
                .q5ContrastType(preferenceType.getQ5_contrast_type())
                .q6Motion(preferenceType.getQ6_motion())
                .q7Framing(preferenceType.getQ7_framing())
                .q8Tone(tone)
                .build();
        return preferenceRepository.save(preference).getId();
    }

    /**
     * AI 결과를 받아 Persona를 저장합니다. PersonaCreationService에서 호출됩니다.
     */
    public PersonaDto finalizePersona(String username, Long preferenceId, PersonaResponseWrapper result, String profileUrl) {
        Member member = null;
        if (username != null) {
            member = memberRepository.findByUsernameAndIsActive(username, true)
                    .orElseThrow(() -> new NotFoundException(ResponseCode.NOT_FOUND));
        }

        Preference preference = preferenceRepository.findById(preferenceId);

        String code;
        do {
            code = CodeGenerator.generateShareCode();
        } while (isExistCode(code));

        Persona persona = Persona.builder()
                .name(result.getReport().getName())
                .profile(profileUrl)
                .member(member)
                .keywords(new HashSet<>(result.getReport().getKeywords()))
                .colors(new HashSet<>(result.getReport().getColor_palette()))
                .code(code)
                .thumbnail(result.getImage_url())
                .preference(preference)
                .summary(result.getReport().getSummary())
                .traits(result.getReport().getTraits())
                .build();

        personaRepository.save(persona);
        personaLogService.createPersonaLog(member, persona);

        return PersonaDto.fromEntity(persona);
    }

    /**
     * 해당 페르소나 코드가 중복되는지 확인합니다.
     * @param code 중복 확인할 코드
     * @return Boolean
     */
    public Boolean isExistCode(String code){
        return personaRepository.existsByCode(code);
    }

    /**
     * 페르소나의 이름을 업데이트 합니다.
     * @param username 아이디
     * @param code 수정할 페르소나 코드
     * @param name 수정할 페르소나의 새로운 이름!
     */
    public void updatePersona(String username, String code, String name) {
        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        Persona persona = personaRepository.findPersonaByMemberAndCodeAndIsActive(member,code,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        if(name!=null)
            persona.setName(name);
        personaRepository.save(persona);
    }

    /**
     * 공유받은 페르소나를 저장합니다.
     * @param username 저장할 유저 아이디
     * @param code 공유받은 페르소나 코드
     * @param name 혹시나 이름을 바꾼다면 이름
     */
    // todo 공유받은 것도 프로필 수정 해줘
    public void saveSharedPersona(String username, String code, String name) {
        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        // 기존 페르소나
        Persona sharedpersona = personaRepository.findPersonaByCodeAndIsActive(code,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));

        if(name==null)
            name = sharedpersona.getName();

        Preference newPreference = Preference.builder()
                .q1Environment(sharedpersona.getPreference().getQ1Environment())
                .q2Style(sharedpersona.getPreference().getQ2Style())
                .q3MinimalMaximal(sharedpersona.getPreference().getQ3MinimalMaximal())
                .q4Mood(sharedpersona.getPreference().getQ4Mood())
                .q5ContrastType(sharedpersona.getPreference().getQ5ContrastType())
                .q6Motion(sharedpersona.getPreference().getQ6Motion())
                .q7Framing(sharedpersona.getPreference().getQ7Framing())
                .q8Tone(new ArrayList<>(sharedpersona.getPreference().getQ8Tone()))
                .build();

        preferenceRepository.save(newPreference);

        // 기존의 페르소나를 복붙
        Persona newPersona = Persona.builder()
                .name(name)
                .profile(sharedpersona.getProfile())
                .member(member)
                .keywords(new HashSet<>(sharedpersona.getKeywords()))
                .colors(new HashSet<>(sharedpersona.getColors()))
                .isSaved(true)
                .thumbnail(sharedpersona.getThumbnail())
                .preference(newPreference)
                .summary(sharedpersona.getSummary())
                .traits(sharedpersona.getTraits())
                .build();
        String newCode;
        // 코드가 중복이 아니도록
        do {
            newCode = CodeGenerator.generateShareCode();
        } while (isExistCode(newCode));
        newPersona.setCode(newCode);
        if(name!=null)
            newPersona.setName(name);
        personaRepository.save(newPersona);
    }
}
