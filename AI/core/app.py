from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import uvicorn
import os
import time

from persona_pipeline import PersonaPipeline
from image_generation import ImageGeneration as BasicGen
from content_generation import ContentGeneration as TrendGen

app = FastAPI()

# 서버 시작 시 인스턴스들을 미리 만들어둬서 속도를 높임
pipeline = PersonaPipeline()
content_creator = BasicGen()
trend_setter = TrendGen()

# --- [데이터 모델 정의] ---

class DiagnosisRequest(BaseModel):
    """1. 페르소나 진단용: 음성과 이미지를 분석해 리포트 생성"""
    answers: dict
    q8_tone: List[int] = [0, 0, 0, 0]
    images: str  # 사용자 원본 사진 URL
    voice: str   # 사용자 목소리 URL

class ContentCreateRequest(BaseModel):
    """2. 콘텐츠 생성용: 진단 리포트를 바탕으로 AI 이미지 생성 및 크롭"""
    report: dict
    answers: dict
    q8_tone: List[int] = [0, 0, 0, 0]
    user_image_url: str  # BE에서 URL로 전달
    crop_type: int = 1   # 0: 1:1(Profile), 1: 4:5(Post), 2: 9:16(Story)

class TrendContentRequest(BaseModel):
    """3. 트렌드 기반 콘텐츠 생성용"""
    trend_prompt: str    # BE에서 주는 트렌드 텍스트
    report: dict
    answers: dict
    q8_tone: List[int]
    user_image_url: str  # BE에서 URL로 전달
    crop_type: int = 1


# --- [API 엔드포인트] ---

@app.post("/diagnose-persona")
async def diagnose_persona(data: DiagnosisRequest):
    """
    [서비스 1] 사용자 데이터를 분석하여 페르소나 성향 리포트를 반환합니다.
    """
    try:
        result = await pipeline.run_e2e_test(
            audio_url=data.voice,
            image_url=data.images,
            answers=data.answers,
            tones=data.q8_tone
        )

        # S3 업로드는 persona_pipeline 내부에서 처리되므로 temp_image_path는 여기서 사용 안 함
        return {
            "status": "success",
            "report": result.get('report'),
            "image_url": result.get('image_url')  # S3 URL
        }
    except Exception as e:
        print(f"❌ 진단 에러 로그: {e}")
        raise HTTPException(status_code=500, detail=f"진단 중 오류 발생: {str(e)}")


@app.post("/generate-content")
async def generate_content(data: ContentCreateRequest):
    """
    [서비스 2] 분석된 리포트를 기반으로 AI 이미지를 생성하고 스마트 크롭 후 S3에 업로드합니다.
    """
    try:
        # 1. 프롬프트 생성
        final_prompt = await content_creator.generate_profile_prompt(
            report=data.report,
            answers=data.answers,
            tones=data.q8_tone
        )

        # 2. BE에서 받은 URL → PIL Image 변환 (app.py에서 처리)
        user_pil_image = await content_creator.download_image_as_pil(data.user_image_url)

        # 3. Gemini로 이미지 생성 → bytes 반환
        image_bytes = content_creator.generate_persona_image(
            prompt=final_prompt,
            user_pil_image=user_pil_image
        )

        if not image_bytes:
            raise HTTPException(status_code=500, detail="AI 이미지 생성에 실패했습니다.")

        # 4. 크롭 설정
        crop_configs = {
            0: {"ratio": 1.0, "mode": "Profile"},
            1: {"ratio": 0.8, "mode": "Post"},
            2: {"ratio": 0.5625, "mode": "Story"}
        }
        config = crop_configs.get(data.crop_type, crop_configs[1])

        # 5. 스마트 크롭 (bytes 전달)
        cropped_cv_img = content_creator.apply_smart_crop(
            image_bytes,
            aspect_ratio=config["ratio"],
            mode=config["mode"]
        )

        # 6. S3 업로드
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
    [서비스 3] BE에서 받은 트렌드 프롬프트를 페르소나와 결합하여 생성
    """
    try:
        # 1. 프롬프트 생성
        final_prompt = await trend_setter.generate_profile_prompt(
            be_input=data.trend_prompt,
            report=data.report,
            answers=data.answers,
            tones=data.q8_tone
        )

        # 2. BE에서 받은 URL → PIL Image 변환 (app.py에서 처리)
        user_pil_image = await trend_setter.download_image_as_pil(data.user_image_url)

        # 3. Gemini로 이미지 생성 → bytes 반환
        image_bytes = trend_setter.generate_persona_image(
            prompt=final_prompt,
            user_pil_image=user_pil_image
        )

        if not image_bytes:
            raise HTTPException(status_code=500, detail="AI 이미지 생성 실패")

        # 4. 크롭 설정
        crop_configs = {
            0: {"ratio": 1.0, "mode": "Profile"},
            1: {"ratio": 0.8, "mode": "Post"},
            2: {"ratio": 0.5625, "mode": "Story"}
        }
        config = crop_configs.get(data.crop_type, crop_configs[1])

        # 5. 스마트 크롭 (bytes 전달)
        cropped_cv_img = trend_setter.apply_smart_crop(
            image_bytes,
            aspect_ratio=config["ratio"],
            mode=config["mode"]
        )

        # 6. S3 업로드
        file_name = f"trend_gen_{int(time.time())}"
        final_url = trend_setter.upload_cv2_to_s3(cropped_cv_img, file_name)

        if not final_url:
            raise HTTPException(status_code=500, detail="S3 업로드에 실패했습니다.")

        return {
            "status": "success",
            "generated_image_url": final_url,
            "used_prompt": final_prompt
        }
    except Exception as e:
        print(f"❌ 트렌드 생성 에러 상세: {e}")
        raise HTTPException(status_code=500, detail=f"트렌드 콘텐츠 생성 오류: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)