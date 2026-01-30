package com.a.persona.app.controller.member.payload;

import com.a.persona.app.model.member.code.Sex;
import com.a.persona.app.model.member.dto.MemberDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberResponse {

    private String username;

    private String email;

    private LocalDate birth;

    private Sex sex;

    private Boolean is_creator;

    public static MemberResponse fromDto(MemberDto memberDto) {
        return MemberResponse.builder()
                .username(memberDto.getUsername())
                .email(memberDto.getEmail())
                .birth(memberDto.getBirth())
                .sex(memberDto.getSex())
                .is_creator(memberDto.getIs_creator())
                .build();
    }
}
