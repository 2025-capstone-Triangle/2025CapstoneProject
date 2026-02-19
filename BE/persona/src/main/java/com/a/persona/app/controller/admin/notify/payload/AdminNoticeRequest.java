package com.a.persona.app.controller.admin.notify.payload;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class AdminNoticeRequest {

    @NotEmpty
    String title;
    @NotEmpty
    String content;

}
