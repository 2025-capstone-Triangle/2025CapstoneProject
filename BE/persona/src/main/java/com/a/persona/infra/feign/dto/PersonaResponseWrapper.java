package com.a.persona.infra.feign.dto;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
public class PersonaResponseWrapper {

    private String status;
    private ReportData report;

    @Getter
    @NoArgsConstructor
    public static class ReportData {
        private String name;
        private List<String> color_palette;
        private String summary;
        private String traits;
        private List<String> keywords;
    }

}
