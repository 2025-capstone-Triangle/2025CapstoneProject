package com.a.persona.app.controller.admin.reference.payload;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminReferenceRequest {

    String name;

    String img;

    String prompt;


}
