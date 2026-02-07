package com.a.persona.app.model.loginLog.repo;

import com.a.persona.app.model.loginLog.domain.LoginLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoginLogRepository extends JpaRepository<LoginLog,String> {
}
