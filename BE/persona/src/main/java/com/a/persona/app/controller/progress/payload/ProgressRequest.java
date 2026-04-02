package com.a.persona.app.controller.progress.payload;

import lombok.Data;

@Data
public class ProgressRequest {
    private String sessionId;
    private int progress;
    private String message;
    private String step;
}
