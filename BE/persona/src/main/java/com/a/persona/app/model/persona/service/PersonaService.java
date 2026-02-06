package com.a.persona.app.model.persona.service;

import com.a.persona.app.controller.persona.payload.PersonaRequest;
import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.member.repo.MemberRepository;
import com.a.persona.app.model.persona.domain.Persona;
import com.a.persona.app.model.persona.dto.PersonaDto;
import com.a.persona.app.model.persona.repo.PersonaRepository;
import com.a.persona.infra.config.AmazonConfig;
import com.a.persona.infra.error.exceptions.CommonException;
import com.a.persona.infra.response.ResponseCode;
import com.a.persona.infra.s3.AmazonS3Manager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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


    /**
     * 사용자의 모든 페르소나를 조회합니다.
     * @param username
     * @return
     */
    public List<PersonaDto> findPersonas(String username) {

        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));

        List<Persona> personas = personaRepository.findPersonasByMemberAndIsActive(member,true);

        return new ArrayList<PersonaDto>(
                personaRepository.findPersonasByMemberAndIsActive(member,true).stream().map(
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
        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        Persona persona = personaRepository.findPersonaByMemberAndCodeAndIsActive(member,code,true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        return modelMapper.map(persona,PersonaDto.class);
    }

    /**
     * code에 해당하는 페르소나를 삭제하는 메소드
     * @param username 유저 아이디
     * @param code 삭제할 페르소나 코드
     */
    public void deletePersona(String username, String code) {
        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        Persona persona = personaRepository.findPersonaByMemberAndCodeAndIsActive(member,code,true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
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
        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        Persona persona = personaRepository.findPersonaByMemberAndCodeAndIsActive(member,code,true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        persona.setIsSaved(true);
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
        // UUID 생성 및 저장
        String uuid = UUID.randomUUID().toString();
        String fileName = username+"_"+uuid;

        // todo 파일 확장자 변경


        // 이미지 파일 업로드 및 URL 리스트 반환
        List<String> pictureUrls = s3Manager.upload(image, amazonConfig.getImagePath(), fileName);
        for(String pictureUrl : pictureUrls){
            log.info("pictureUrl :{}", pictureUrl);
        }
        // 이미지 파일 업로드 및 URL 리스트 반환
        List<String> voiceUrls = s3Manager.upload(voice, amazonConfig.getVoicePath(), fileName);
        for(String voiceUrl : voiceUrls){
            log.info("voiceUrl :{}", voiceUrl);
        }
        // todo AI server로 보내기

        // todo 이름 키워드를 통해 대충 만들기

        // todo code 꼭 생성

        return null;
    }
}
