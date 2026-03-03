package com.a.persona.app.model.member.repo;

import com.a.persona.app.model.member.dto.MemberStatDto;

import java.util.List;
import java.util.Optional;

public interface MemberRepositoryCustom {

    List<MemberStatDto> findStatAllByIsActive(boolean b, Boolean isBlocked);

    Optional<MemberStatDto> findStatByIdAndIsActive(Long id, boolean b, Boolean isBlocked);
}
