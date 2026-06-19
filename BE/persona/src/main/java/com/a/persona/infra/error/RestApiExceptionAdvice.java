package com.a.persona.infra.error;

import com.a.persona.infra.error.exceptions.CommonException;
import com.a.persona.infra.error.exceptions.NotFoundException;
import com.a.persona.infra.response.CommonApiResponse;
import com.a.persona.infra.response.ResponseCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.ui.Model;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice(basePackages = "com.a.persona.app.controller")
@Slf4j
public class RestApiExceptionAdvice {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonApiResponse<Map<String, String>>>
    validatorHandler(MethodArgumentNotValidException ex) {
        log.error(ex.getMessage(), ex);
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getFieldErrors().forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        return ResponseEntity
                   .badRequest()
                   .body(CommonApiResponse.error(ResponseCode.BAD_REQUEST, errors));
    }
    
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<CommonApiResponse<String>>
    methodNotSupportedHandler(HttpRequestMethodNotSupportedException ex) {
        log.error(ex.getMessage(), ex);
        return ResponseEntity
                   .badRequest()
                   .body(CommonApiResponse.error(ResponseCode.BAD_REQUEST, ex.getMessage()));
    }
    
    @ExceptionHandler(CommonException.class)
    public ResponseEntity<CommonApiResponse<String>> restApiExceptionHandler(CommonException ex) {
        return ResponseEntity
                   .status(ex.code().status())
                   .body(CommonApiResponse.error(ex.code()));
    }
    
    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<CommonApiResponse<String>>  authorizationDeniedHandler(AuthorizationDeniedException ex, Model model){
        log.error(ex.getMessage(), ex);
        return ResponseEntity
                   .status(HttpStatus.UNAUTHORIZED)
                   .body(CommonApiResponse.error(ResponseCode.UNAUTHORIZED));
    }
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<CommonApiResponse<String>> runtimeExceptionHandler(RuntimeException ex) {
        log.error(ex.getMessage(), ex);
        return ResponseEntity
                   .internalServerError()
                   .body(CommonApiResponse.error(ResponseCode.INTERNAL_SERVER_ERROR));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<CommonApiResponse<String>> notFoundExceptionHandler(NotFoundException ex) {
        return ResponseEntity
            .status(ex.code().status())
            .body(CommonApiResponse.error(ex.code()));
    }
    
}
