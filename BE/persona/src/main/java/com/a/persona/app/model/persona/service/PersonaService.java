package com.a.persona.app.model.persona.service;

import com.a.persona.app.controller.persona.payload.LikeAnswerRequest;
import com.a.persona.app.model.content.code.ContentType;
import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.member.repo.MemberRepository;
import com.a.persona.app.model.persona.domain.Persona;
import com.a.persona.app.model.persona.domain.Preference;
import com.a.persona.app.model.persona.dto.PersonaDto;
import com.a.persona.app.model.persona.repo.PersonaRepository;
import com.a.persona.app.model.persona.repo.PreferenceRepository;
import com.a.persona.app.model.personaLog.service.PersonaLogService;
import com.a.persona.infra.config.AmazonConfig;
import com.a.persona.infra.error.exceptions.NotFoundException;
import com.a.persona.infra.feign.AiServerApi;
import com.a.persona.infra.feign.dto.*;
import com.a.persona.infra.nanoid.CodeGenerator;
import com.a.persona.infra.response.ResponseCode;
import com.a.persona.infra.s3.AmazonS3Manager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PersonaService {


    private final PersonaRepository personaRepository;
    private final MemberRepository memberRepository;
    private final AmazonS3Manager s3Manager;
    private final AmazonConfig amazonConfig;
    private final PersonaLogService personaLogService;
    private final AiServerApi aiServerApi;
    private final PreferenceRepository preferenceRepository;


    /**
     * 사용자의 모든 페르소나를 조회합니다.
     * @param username 사용자의 아이디
     * @return List<PersonaDto>
     */
    public List<PersonaDto> findPersonas(String username) {

        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));

        List<Persona> personas = personaRepository.findPersonasByMemberAndIsActive(member,true);

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
     * 페르소나 생성을 위한 데이터를 받아 ai 서버로 보내어 persona를 생성하는 메소드
     * @param username 유저 아이디
     * @param profile 유저의 대표 이미지
     * @param image 유저 참고 이미지
     * @param voice 유저 목소리
     * @param preferenceType 유저 선호 타입
     * @return PersonaDto 
     * @throws IOException 업로드 예외
     */
    public PersonaDto createPersona(String username, MultipartFile profile, MultipartFile image, MultipartFile voice, LikeAnswerRequest preferenceType, List<Long> tone) throws IOException {

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

        preferenceRepository.save(preference);

        Member member = null;
        if(username!=null){
            member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        }

        // UUID 생성 및 저장
        String uuid = UUID.randomUUID().toString();
        String fileName = username+"_"+uuid;

        // 프로필 이미지 업로드
        String profileUrl = s3Manager.upload(profile, amazonConfig.getImagePath(), fileName);

        // 이미지 파일 업로드 및 URL 리스트 반환
        String pictureUrl = s3Manager.upload(image, amazonConfig.getImagePath(), fileName);

        // 이미지 파일 업로드 및 URL 리스트 반환
        String voiceUrl = s3Manager.upload(voice, amazonConfig.getVoicePath(), fileName);


        // AI 서버에 페르소나 진단 요청
        PersonaRequest request = PersonaRequest.builder()
                .answers(preferenceType)
                .q8_tone(tone)
                .images(pictureUrl)
                .voice(voiceUrl).build();

        PersonaResponseWrapper result = aiServerApi.analyzePersona(request);

        String code;
        // 코드가 중복이 아니도록
        do {
            code = CodeGenerator.generateShareCode();
        } while (isExistCode(code));
        // todo 이미지 파일 저장 presigned-url을 만들 수 있는 그 코드? 를 저장하기

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
        // 페르소나 생성 로그
        personaLogService.createPersonaLog(member,persona);

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
    public void saveSharedPersona(String username, String code, String name) {
        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        // 기존 페르소나
        Persona sharedpersona = personaRepository.findPersonaByCodeAndIsActive(code,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));

        if(name==null)
            name = sharedpersona.getName();

        // 기존의 페르소나를 복붙
        Persona newPersona = Persona.builder()
                .name(name)
                .profile(sharedpersona.getProfile())
                .member(member)
                .keywords(new HashSet<>(sharedpersona.getKeywords()))
                .colors(new HashSet<>(sharedpersona.getColors()))
                .isSaved(true)
                .thumbnail(sharedpersona.getThumbnail())
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
