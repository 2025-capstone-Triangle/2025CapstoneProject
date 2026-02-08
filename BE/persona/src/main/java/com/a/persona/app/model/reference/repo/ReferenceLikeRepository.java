package com.a.persona.app.model.reference.repo;

import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.reference.domain.Reference;
import com.a.persona.app.model.reference.domain.ReferenceLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReferenceLikeRepository extends JpaRepository<ReferenceLike,Long> {
    ReferenceLike findByReferenceAndMember(Reference reference, Member member);
}
