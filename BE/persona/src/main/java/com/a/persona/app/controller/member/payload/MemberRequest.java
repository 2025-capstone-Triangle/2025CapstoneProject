package com.a.persona.app.controller.member.payload;

import com.a.persona.app.model.member.code.Sex;
import com.a.persona.app.model.member.dto.MemberDto;

import java.time.LocalDate;

public class MemberRequest {
    private LocalDate birth;

    private Sex sex;

    private Boolean is_creator;

    public MemberDto toDto() {
        return MemberDto.builder()
                .birth(birth)
                .sex(sex)
                .is_creator(is_creator)
                .build();
    }
}
