package com.a.persona.infra;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.examples.Example;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.ObjectSchema;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.security.SecurityRequirement; // 추가
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// 1. OpenAPI 기본 정보 정의
@OpenAPIDefinition(
        info = @Info(
                title = "Person:a API 명세서",
                description = """
            개발이 시작되지 항목에 대한 API는 추후 변경사항이 있을 수 있습니다.<br>\
            <strong>HTTP 메소드에 대한 변경 및 요청 파라메터에 대한 변경이 있을 수 있음</strong>에 유의하세요.<br>\
            제안 및 문의사항이 있다면 언제든 알려주세요.<br>\
            <i>만약 API 예시 또는 응답이 다음 구조가 아니라면 즉시 백엔드에게 알려주세요.</i><br>\
            <pre>{
              &nbsp;&nbsp;"status": ,
              &nbsp;&nbsp;"message": ,
              &nbsp;&nbsp;"data":
            }</pre><br>
            <strong>*모든 API는 로그인 API 실행 후 발급받은 토큰을 Authorize에 입력한 뒤 사용할 수 있습니다.</strong>""",
                version = "v1"
        )
)
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openApiSpec() {
        // 순서가 보장된 공통 에러 응답 스키마 정의
        ObjectSchema errorSchema = new ObjectSchema();
        errorSchema.addProperty("status",
                new StringSchema().description("에러 상태 코드").example("status_code"));
        errorSchema.addProperty("message",
                new StringSchema().description("에러 메시지").example("string"));
        errorSchema.addProperty("data",
                new ObjectSchema().nullable(true).description("에러 데이터").example(null));

        // 공통 에러 응답 예시
        Example errorExample = new Example()
                .summary("에러 응답 예시")
                .description("일반적인 에러 응답 형태")
                .value(createErrorExampleMap());

        return new OpenAPI()
                // 2. 서버 URL 설정 (루트 경로)
                .servers(Collections.singletonList(new Server().url("/")))

                // 3. 전역 Security Requirement 설정 (모든 API에 인증 필요 표시)
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))

                .components(new Components()
                        // 4. JWT Bearer 인증 스키마 정의
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .name("Authorization")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Bearer는 제외하고 입력하세요."))

                        // 5. 공통 에러 응답 스키마 등록
                        .addSchemas("ApiErrorResponse", errorSchema)

                        // 6. 공통 에러 응답 예시 등록
                        .addExamples("ErrorExample", errorExample));
    }

    @Bean
    public OperationCustomizer operationCustomizer() {
        return (operation, handlerMethod) -> {
            // 7. 모든 API에 4xx/5xx 공통 응답 자동 추가
            MediaType errorMediaType = new MediaType()
                    .schema(new Schema<>().$ref("#/components/schemas/ApiErrorResponse"));

            errorMediaType.addExamples("공통 에러", new Example()
                    .summary("공통 에러 응답")
                    .value(createErrorExampleMap()));

            operation.getResponses().addApiResponse("4xx/5xx", new ApiResponse()
                    .description("에러발생시의 응답 예시입니다.")
                    .content(new Content().addMediaType("application/json", errorMediaType)));

            return operation;
        };
    }

    // Helper method: 에러 응답 예시를 위한 Map 생성 (순서 보장을 위해 LinkedHashMap 사용)
    private Map<String, Object> createErrorExampleMap() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("status", "status_code");
        map.put("message", "string");
        map.put("data", null);
        return map;
    }
}