package com.a.persona.app.model.reference.repo;

import com.a.persona.app.model.reference.domain.Reference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReferenceRepository extends JpaRepository<Reference,Long>, ReferenceRepositoryCustom {

}
