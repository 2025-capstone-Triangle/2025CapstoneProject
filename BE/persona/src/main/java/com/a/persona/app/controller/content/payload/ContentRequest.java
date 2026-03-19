package com.a.persona.app.controller.content.payload;

import com.a.persona.app.model.content.code.ContentType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ContentRequest {

    @NotEmpty
    String code;

    @NotNull
    ContentType type;

}
