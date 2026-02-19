package com.a.persona.app.model.notice.repo;

import com.a.persona.app.model.notice.domain.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Integer> {
    List<Notice> findByIsActive(Boolean isActive);

    Optional<Notice> findByIdAndIsActive(Long id, Boolean isActive);
}
