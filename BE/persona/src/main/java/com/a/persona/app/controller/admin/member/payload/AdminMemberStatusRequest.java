package com.a.persona.app.controller.admin.member.payload;

import com.a.persona.app.model.member.code.Status;
import lombok.Data;

@Data
public class AdminMemberStatusRequest {
    Long id;
    Status status;
}
