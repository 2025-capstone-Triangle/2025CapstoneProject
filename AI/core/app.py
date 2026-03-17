from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os

from persona_pipeline import PersonaPipeline
from content_creator import ContentGeneration

app = FastAPI()

# 서버 시작 시 인스턴스들을 미리 만들어둬서 속도를 높임
pipeline = PersonaPipeline()
content_creator = ContentGeneration()

# --- [데이터 모델 정의] ---

class DiagnosisRequest(BaseModel):
    """1. 페르소나 진단용: 음성과 이미지를 분석해 리포트 생성"""
    answers: dict
    q8_tone: List[int] = [0, 0, 0, 0]
    images: str  # 사용자 원본 사진 URL
    voice: str   # 사용자 목소리 URL

class ContentCreateRequest(BaseModel):
    """2. 콘텐츠 생성용: 진단 리포트를 바탕으로 AI 이미지 생성 및 크롭"""
    report: dict        # 진단 단계에서 받은 페르소나 리포트 전체
    answers: dict       # 설문 답변 데이터
    q8_tone: List[int] = [0, 0, 0, 0]
    user_image_url: str # Identity 유지를 위한 참조 이미지 URL
    crop_type: int = 1  # 0: 1:1(Profile), 1: 4:5(Post), 2: 9:16(Story)

class TrendContentRequest(BaseModel):
    """3. 트렌드 기반 콘텐츠 생성용 (새로 추가)"""
    trend_prompt: str   # BE에서 주는 트렌드 텍스트 (예: "빨간 목도리...")
    report: dict        # 페르소나 리포트
    answers: dict       # 설문 데이터
    q8_tone: List[int]  # 톤 데이터
    user_image_url: str # 인물 참조 이미지
    crop_type: int = 1

# --- [API 엔드포인트] ---

@app.post("/diagnose-persona")
async def diagnose_persona(data: DiagnosisRequest):
    """
    [서비스 1] 사용자 데이터를 분석하여 페르소나 성향 리포트를 반환합니다.
    """
    try:
        # persona_pipeline.py의 run_e2e_test 함수를 호출
        # tones라는 인자명으로 q8_tone 전달
        result = await pipeline.run_e2e_test(
            audio_url=data.voice,
            image_url=data.images,
            answers=data.answers,
            tones=data.q8_tone
        )
        
        # 진단 단계에서는 리포트 내용만 반환
        return {
            "status": "success", 
            "report": result.get('report'),
            "image_url": result.get('image_url')
        }
    except Exception as e:
        print(f"❌ 진단 에러 로그: {e}")
        raise HTTPException(status_code=500, detail=f"진단 중 오류 발생: {str(e)}")

@app.post("/generate-content")
async def generate_content(data: ContentCreateRequest):
    """
    [서비스 2] 분석된 리포트를 기반으로 DALL-E 3 이미지를 생성하고 스마트 크롭 후 S3에 업로드합니다.
    """
    try:
        # 1. content_creator를 사용하여 AI 이미지 생성을 위한 상세 프롬프트 도출
        final_prompt = await content_creator.generate_profile_prompt(
            report=data.report,
            answers=data.answers,
            tones=data.q8_tone
        )

        # 2. DALL-E 3 이미지 생성 (Base64 형식으로 받음)
        b64_image = content_creator.generate_persona_image(
            prompt=final_prompt,
            user_image_url=data.user_image_url
        )

        if not b64_image:
            raise HTTPException(status_code=500, detail="AI 이미지 생성에 실패했습니다.")

        # 3. 크롭 설정 (사용자 선택에 따름)
        crop_configs = {
            0: {"ratio": 1.0, "mode": "Profile"},
            1: {"ratio": 0.8, "mode": "Post"},
            2: {"ratio": 0.5625, "mode": "Story"}
        }
        config = crop_configs.get(data.crop_type, crop_configs[1])

        # 4. MediaPipe 기반 스마트 크롭 실행
        cropped_cv_img = content_creator.apply_smart_crop(
            b64_image,
            aspect_ratio=config["ratio"],
            mode=config["mode"]
        )

        # 5. S3 업로드 (고유한 파일명 생성)
        import time
        file_name = f"persona_gen_{int(time.time())}"
        final_url = content_creator.upload_cv2_to_s3(cropped_cv_img, file_name)

        if not final_url:
            raise HTTPException(status_code=500, detail="S3 업로드에 실패했습니다.")

        return {
            "status": "success",
            "generated_image_url": final_url,
            "used_prompt": final_prompt
        }
    except Exception as e:
        print(f"❌ 생성 에러 로그: {e}")
        raise HTTPException(status_code=500, detail=f"콘텐츠 생성 중 오류 발생: {str(e)}")

@app.post("/generate-trend-content")
async def generate_trend_content(data: TrendContentRequest):
    """
    [신규 기능] BE에서 받은 트렌드 프롬프트를 페르소나와 결합하여 생성
    """
    try:
        # 1. 트렌드 프롬프트 + 유저 페르소나 결합
        final_prompt = await content_creator.generate_profile_prompt(
            "",
            report=data.report,
            answers=data.answers,
            tones=data.q8_tone
        )

        # 2. 이미지 생성
        b64_image = content_creator.generate_persona_image(
            prompt=final_prompt,
            user_image_url=data.user_image_url
        )

        if not b64_image:
            raise HTTPException(status_code=500, detail="AI 이미지 생성 실패")

        # 3. 크롭 & S3 업로드
        crop_configs = {0: {"ratio": 1.0, "mode": "Profile"}, 1: {"ratio": 0.8, "mode": "Post"}, 2: {"ratio": 0.5625, "mode": "Story"}}
        config = crop_configs.get(data.crop_type, crop_configs[1])
        
        cropped_cv_img = content_creator.apply_smart_crop(b64_image, aspect_ratio=config["ratio"], mode=config["mode"])
        
        file_name = f"trend_gen_{int(time.time())}"
        final_url = content_creator.upload_cv2_to_s3(cropped_cv_img, file_name)

        return {
            "status": "success",
            "generated_image_url": final_url,
            "used_prompt": final_prompt
        }
    except Exception as e:
        print(f"❌ 트렌드 생성 에러: {e}")
        raise HTTPException(status_code=500, detail=f"트렌드 콘텐츠 생성 오류: {str(e)}")
    
if __name__ == "__main__":
    # 서버 실행 (IP 0.0.0.0으로 설정해야 외부/도커에서 접근 가능)
    uvicorn.run(app, host="0.0.0.0", port=8000)