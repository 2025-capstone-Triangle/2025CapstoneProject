package com.a.persona.app.model.member.repo;

import com.a.persona.app.model.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long>, MemberRepositoryCustom {
    Optional<Member> findByUsername(String username);

    Optional<Member> findByEmailAndIsActive(String email, Boolean isActive);

    Optional<Member> findByUsernameAndIsActive(String username, Boolean isActive);
}
