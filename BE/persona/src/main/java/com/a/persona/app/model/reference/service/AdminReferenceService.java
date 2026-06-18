package com.a.persona.app.model.reference.service;

import com.a.persona.app.model.reference.domain.Reference;
import com.a.persona.app.model.reference.dto.ReferenceStatDto;
import com.a.persona.app.model.reference.repo.ReferenceRepository;
import com.a.persona.infra.config.AmazonConfig;
import com.a.persona.infra.error.exceptions.CommonException;
import com.a.persona.infra.response.ResponseCode;
import com.a.persona.infra.s3.AmazonS3Manager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
@Transactional
public class AdminReferenceService {

    private final ReferenceRepository referenceRepository;
    private final AmazonS3Manager s3Manager;
    private final AmazonConfig amazonConfig;

    /**
     * 모든 레퍼런스를 조회합니다
     * @return List<ReferenceStatDto>
     */
    public List<ReferenceStatDto> getAllReference() {
        List<ReferenceStatDto> references;

        references = referenceRepository.findByIsActive(true);

        return references;

    }

    /**
     * 레퍼런스 단건조회
     * @return List<ReferenceStatDto>
     */
    public List<ReferenceStatDto> getReference(Long id) {
        List<ReferenceStatDto> references;

        references = referenceRepository.findByIdAndIsActive(id, true);

        return references;

    }

    /**
     * 레퍼런스 생성
     * @param image 참고 이미지
     * @param name 이름
     * @param prompt 레퍼런스로 이미지를 생성하기 위한 프롬프트
     * @throws IOException upload 예외
     */
    public void createReference(MultipartFile image, String name, String prompt, String description) throws IOException {
        String uuid = UUID.randomUUID().toString();
        String fileName = "reference_"+uuid;
        String imageUrl = s3Manager.upload(image, amazonConfig.getReferencePath(), fileName);

        Reference reference = Reference.builder()
                .name(name)
                .prompt(prompt)
                .img(imageUrl)
                .description(description)
                .build();

        referenceRepository.save(reference);
    }

    /**
     * 레퍼런스 수정
     * @param id 수정할 레퍼런스 id
     * @param image 새로 업로드할 이미지
     * @param name 수정할 이름
     * @param prompt 수정할 프롬프트
     * @throws IOException 업로드 예외
     */
    public void updateReference(Long id, MultipartFile image, String name, String prompt, String description) throws IOException {

        Reference reference = referenceRepository.findById(id).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));


        if(image != null){
            String uuid = UUID.randomUUID().toString();
            String fileName = "reference_"+uuid;
            String imageUrl = s3Manager.upload(image, amazonConfig.getReferencePath(), fileName);
            reference.setImg(imageUrl);
        }
        if(name != null){
            reference.setName(name);
        }
        if(prompt != null){
            reference.setPrompt(prompt);
        }
        if(description != null){
            reference.setDescription(description);
        }
        referenceRepository.save(reference);
    }

    /**
     * 해당 아이디에 해당하는 레퍼런스를 삭제합니다.
     * @param id 삭제할 레퍼런스 아이디
     */
    public void deleteReference(Long id) {

        Reference reference = referenceRepository.findById(id).orElseThrow(()->new CommonException(ResponseCode.NOT_FOUND));
        reference.setIsActive(false);
        referenceRepository.save(reference);

    }
}
