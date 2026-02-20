package com.a.persona.infra.feign.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class PersonaRequest {

    String image_url;
    String voice_url;
    String user_pref;

}
