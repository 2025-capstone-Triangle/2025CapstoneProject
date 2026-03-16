package com.a.persona.app.model.personaLog.repo;

import com.a.persona.app.model.personaLog.domain.PersonaLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonaLogRepository extends JpaRepository<PersonaLog,String>, PersonaLogRepositoryCustom {
}
