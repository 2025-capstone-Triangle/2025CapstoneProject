package com.a.persona.app.model.contentLog.repo;

import com.a.persona.app.model.contentLog.domain.ContentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContentLogRepository extends JpaRepository<ContentLog,String> {
}
