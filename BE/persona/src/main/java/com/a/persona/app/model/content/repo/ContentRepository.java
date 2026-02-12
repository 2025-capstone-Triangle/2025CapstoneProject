package com.a.persona.app.model.content.repo;

import com.a.persona.app.model.content.domain.Content;
import com.a.persona.app.model.persona.domain.Persona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentRepository extends JpaRepository<Content,Long>, ContentRepositoryCustom {
    Content findByIdAndIsActive(Long id, Boolean isActive);
}
