package com.a.persona.infra.s3;

import com.a.persona.infra.config.AmazonConfig;
import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class AmazonS3Manager {

    private final AmazonS3Client amazonS3Client;
    private final AmazonConfig amazonConfig;

    // 1. 리스트를 받아서 처리하는 메인 메서드
    public List<String> upload(List<MultipartFile> multipartFiles, String dirName, String uuid) throws IOException {
        List<String> uploadUrls = new ArrayList<>();

        for (MultipartFile multipartFile : multipartFiles) {
            // convert 과정 없이 바로 업로드 메서드 호출
            String uploadUrl = uploadToS3(multipartFile, dirName, uuid);
            uploadUrls.add(uploadUrl);
        }

        return uploadUrls;
    }

    // 2. 개별 MultipartFile을 S3 스트림으로 쏘는 핵심 로직
    private String uploadToS3(MultipartFile multipartFile, String dirName, String uuid) throws IOException {
        // 파일명 생성: 디렉토리/UUID_파일명 (원본 파일명 앞에 UUID를 붙여 중복 방지)
        String fileName = dirName + "/" + uuid + "_" + multipartFile.getOriginalFilename();

        // S3에 보낼 메타데이터 설정 (이게 있어야 S3가 파일 크기와 타입을 압축 없이 제대로 받습니다)
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(multipartFile.getSize());
        metadata.setContentType(multipartFile.getContentType());

        // 스트림으로 업로드 (로컬에 File을 생성하지 않음!)
        try (InputStream inputStream = multipartFile.getInputStream()) {
            amazonS3Client.putObject(new PutObjectRequest(
                    amazonConfig.getBucket(), fileName, inputStream, metadata));
        }

        return generatePresignedUrl(fileName);
    }


    private void removeNewFile(File targetFile) {
        if (targetFile.delete()) {
            log.info("파일이 삭제되었습니다.");
        } else {
            log.info("파일이 삭제되지 못했습니다.");
        }
    }

    private String generatePresignedUrl(String fileName) {
        // 유효 기간 설정 (예: 10분)
        Date expiration = new Date();
        long expTimeMillis = expiration.getTime();
        expTimeMillis += 1000 * 60 * 10; // 10분 추가
        expiration.setTime(expTimeMillis);

        // Presigned URL 요청 생성
        GeneratePresignedUrlRequest generatePresignedUrlRequest =
                new GeneratePresignedUrlRequest(amazonConfig.getBucket(), fileName)
                        .withMethod(HttpMethod.GET) // AI 서버가 '읽기' 위해 GET 방식 사용
                        .withExpiration(expiration);

        URL url = amazonS3Client.generatePresignedUrl(generatePresignedUrlRequest);
        return url.toString();
    }
}

