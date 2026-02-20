package com.a.persona.infra.feign;

import com.a.persona.infra.feign.dto.PersonaRequest;
import com.a.persona.infra.feign.dto.PersonaResponseWrapper;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "ai-server",
        url="http://13.125.232.224:8000"
)
public interface AiServerApi {

    @PostMapping("/analyze-persona")
    PersonaResponseWrapper analyzePersona(
            @RequestBody
            PersonaRequest request
    );

}
