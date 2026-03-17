package com.a.persona.infra.feign.dto;

import lombok.Data;

@Data
public class ContentResponse {

    String status;
    String generated_image_url;
    String used_prompt;

}
