package com.a.persona.app.controller.admin.notice.payload;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class AdminNoticeRequest {

    @NotEmpty
    String title;
    @NotEmpty
    String content;

}
