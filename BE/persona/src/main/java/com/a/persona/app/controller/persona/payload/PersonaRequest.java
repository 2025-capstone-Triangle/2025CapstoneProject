package com.a.persona.app.controller.persona.payload;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class PersonaRequest {

    // 이미지
    // jpg
    List<MultipartFile> image;
    // test 결괏값
    String preferenceType;
    // 음성 파일
    // wav
    List<MultipartFile> voice;

}
