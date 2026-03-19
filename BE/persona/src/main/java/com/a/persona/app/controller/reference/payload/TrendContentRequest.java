package com.a.persona.app.controller.reference.payload;

import com.a.persona.app.model.content.code.ContentType;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class TrendContentRequest {

    @NotNull
    String code;

    Long referenceId;

    @NotNull
    ContentType type;

}
