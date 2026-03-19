package com.a.persona.infra.feign;


import com.a.persona.infra.feign.dto.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "ai-server",
        url="${feign.client.ai-server.url}"
)
public interface AiServerApi {

    @PostMapping("/diagnose-persona")
    PersonaResponseWrapper analyzePersona(
            @RequestBody
            PersonaRequest request
    );


    @PostMapping("/generate-content")
    ContentResponse createContent(
        AiContentRequest request
    );

    @PostMapping("/generate-trend-content")
    ContentResponse createTrendContent(
            AiTrendContentRequest request
    );
}
