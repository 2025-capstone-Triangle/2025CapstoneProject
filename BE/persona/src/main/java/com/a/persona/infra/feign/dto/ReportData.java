package com.a.persona.infra.feign.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ReportData {
    private String name;
    private List<String> color_palette;
    private String summary;
    private String traits;
    private List<String> keywords;
}
