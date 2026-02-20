package com.a.persona.app.controller.admin.reference.payload;

import com.a.persona.app.controller.reference.payload.ReferenceStatResponse;
import com.a.persona.app.model.reference.dto.ReferenceStatDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReferenceResponse {

    Long id;

    String name;

    String img;

    LocalDateTime createdAt;

    Long usedCount;

    public static AdminReferenceResponse from(ReferenceStatDto dto) {
        return AdminReferenceResponse.builder()
                .id(dto.getId())
                .name(dto.getName())
                .img(dto.getImg())
                .usedCount(dto.getUsedCount())
                .createdAt(dto.getCreatedAt())
                .build();
    }


}
