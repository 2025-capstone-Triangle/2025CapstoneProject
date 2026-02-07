package com.a.persona.app.model.persona.service;

import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.member.repo.MemberRepository;
import com.a.persona.app.model.persona.domain.Persona;
import com.a.persona.app.model.persona.dto.PersonaDto;
import com.a.persona.app.model.persona.repo.PersonaRepository;
import com.a.persona.app.model.personaLog.service.PersonaLogService;
import com.a.persona.infra.config.AmazonConfig;
import com.a.persona.infra.error.exceptions.NotFoundException;
import com.a.persona.infra.nanoid.CodeGenerator;
import com.a.persona.infra.response.ResponseCode;
import com.a.persona.infra.s3.AmazonS3Manager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.parameters.P;
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
    private final ModelMapper modelMapper;
    private final AmazonConfig amazonConfig;
    private final PersonaLogService personaLogService;


    /**
     * 사용자의 모든 페르소나를 조회합니다.
     * @param username
     * @return
     */
    public List<PersonaDto> findPersonas(String username) {

        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));

        List<Persona> personas = personaRepository.findPersonasByMemberAndIsActive(member,true);

        return new ArrayList<PersonaDto>(
                    personas.stream().map(
                    persona -> PersonaDto.builder()
                            .id(persona.getId())
                            .name(persona.getName())
                            .profile(persona.getProfile())
                            .member(member)
                            .keywords(persona.getKeywords())
                            .colors(persona.getColors())
                            .createdAt(persona.getCreatedAt())
                            .updatedAt(persona.getUpdatedAt())
                            .isActive(persona.getIsActive())
                            .code(persona.getCode())
                            .build()
                ).toList()
        );
    }

    /**
     *
     * @param username
     * @param code
     * @return
     */
    public PersonaDto findPersona(String username, String code) {
        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        Persona persona = personaRepository.findPersonaByMemberAndCodeAndIsActive(member,code,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        return PersonaDto.builder()
                .id(persona.getId())
                .name(persona.getName())
                .profile(persona.getProfile())
                .member(member)
                .keywords(persona.getKeywords())
                .colors(persona.getColors())
                .createdAt(persona.getCreatedAt())
                .updatedAt(persona.getUpdatedAt())
                .isActive(persona.getIsActive())
                .code(persona.getCode())
                .build();
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
     * @param username
     * @param image
     * @param voice
     * @param preferenceType
     * @return
     * @throws IOException
     */
    public PersonaDto createPersona(String username, List<MultipartFile> image, List<MultipartFile> voice, String preferenceType) throws IOException {

        Persona persona = new Persona();

        Member member = null;
        if(username!=null){
            member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new NotFoundException(ResponseCode.NOT_FOUND));
        }

        // UUID 생성 및 저장
        String uuid = UUID.randomUUID().toString();
        String fileName = username+"_"+uuid;

        // todo 파일 확장자 변경


        // 이미지 파일 업로드 및 URL 리스트 반환
        List<String> pictureUrls = s3Manager.upload(image, amazonConfig.getImagePath(), fileName);

        // 이미지 파일 업로드 및 URL 리스트 반환
        List<String> voiceUrls = s3Manager.upload(voice, amazonConfig.getVoicePath(), fileName);

        // todo AI server로 보내기

        // todo 이름 키워드를 통해 대충 만들기

        String code;
        // 코드가 중복이 아니도록
        do {
            code = CodeGenerator.generateShareCode();
        } while (isExistCode(code));
        persona.setCode(code);
        // todo 이미지 파일 저장 presigned-url이 아니라 진짜 url

        // 페르소나 생성 로그
        personaLogService.createPersonaLog(member,persona);

        return null;
    }

    /**
     * 해당 페르소나 코드가 중복되는지 확인합니다.
     * @param code 중복 확인할 코드
     * @return
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

        // 기존의 페르소나를 복붙
        Persona newPersona = Persona.builder()
                .name(name)
                .profile(sharedpersona.getProfile())
                .member(member)
                .keywords(new HashSet<>(sharedpersona.getKeywords()))
                .colors(new HashSet<>(sharedpersona.getColors()))
                .isSaved(true)
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
