package com.a.persona.infra.feign.dto;

import lombok.Data;

@Data
public class PersonaResponseWrapper {

    private String status;
    private ReportData report;
    private String image_url;

}
