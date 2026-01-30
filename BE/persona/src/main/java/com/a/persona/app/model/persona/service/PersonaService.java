package com.a.persona.app.model.persona.service;

import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.member.repo.MemberRepository;
import com.a.persona.app.model.persona.domain.Persona;
import com.a.persona.app.model.persona.dto.PersonaDto;
import com.a.persona.app.model.persona.repo.PersonaRepository;
import com.a.persona.infra.error.exceptions.CommonException;
import com.a.persona.infra.response.ResponseCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class PersonaService {


    private final PersonaRepository personaRepository;
    private final MemberRepository memberRepository;
    private final ModelMapper modelMapper;

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
                                .build()
                ).toList()
        );



        
    }

    public PersonaDto findPersona(String username, Long id) {
        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        Persona persona = personaRepository.findPersonaByMemberAndIdAndIsActive(member,id,true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        return modelMapper.map(persona,PersonaDto.class);

    }

    public void deletePersona(String username, Long id) {
        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        Persona persona = personaRepository.findPersonaByMemberAndIdAndIsActive(member,id,true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        persona.setIsActive(false);
        personaRepository.save(persona);
    }

    public void savePersona(String username, Long id) {
        Member member = memberRepository.findByUsernameAndIsActive(username,true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        Persona persona = personaRepository.findPersonaByMemberAndIdAndIsActive(member,id,true).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        persona.setIsSaved(true);
        personaRepository.save(persona);
    }
}
