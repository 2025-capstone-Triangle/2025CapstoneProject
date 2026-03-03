package com.a.persona.app.model.member.repo;

import com.a.persona.app.model.member.domain.MemberBlock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberBlockRepository extends JpaRepository<MemberBlock, String> {
}
