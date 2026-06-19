package com.a.persona.app.model.personaLog.service;

import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.persona.domain.Persona;
import com.a.persona.app.model.personaLog.domain.PersonaLog;
import com.a.persona.app.model.personaLog.repo.PersonaLogRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class PersonaLogService {

    private final PersonaLogRepository personaLogRepository;

    /**
     * 페르소나 생성 시, 페르소나를 로그를 생성합니다.
     * @param member 생성한 사람
     * @param persona 생성된 페르소나
     */
    public void createPersonaLog(Member member, Persona persona){
        PersonaLog personaLog = PersonaLog.builder()
                .time(LocalDateTime.now())
                .member(member)
                .persona(persona)
                .build();

        personaLogRepository.save(personaLog);

    }

}
