from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from persona_pipeline import PersonaPipeline
from content_creator import ContentGeneration  # ImageGeneration 클래스가 포함된 파일
import uvicorn

app = FastAPI()

# 서비스 인스턴스 초기화
pipeline = PersonaPipeline()
content_creator = ContentGeneration()

# --- [데이터 모델 정의] ---

class DiagnosisRequest(BaseModel):
    """1. 페르소나 진단용 모델"""
    answers: dict
    q8_tone: list[int]
    images: str  # 원본 사진 URL
    voice: str   # 목소리 URL

class ContentCreateRequest(BaseModel):
    """2. 콘텐츠 생성용 모델"""
    report: dict       # 1번에서 저장된 페르소나 리포트 데이터
    answers: dict      # 질문 답변 데이터
    q8_tone: list[int]      # 톤 데이터
    user_image_url: str # 원본 사진 URL (Identity 유지용)
    crop_type: int = 1 # 0: 1:1, 1: 4:5, 2: 9:16

# --- [API 엔드포인트] ---

@app.post("/diagnose-persona")
async def diagnose_persona(data: DiagnosisRequest):
    """
    [서비스 1] 사용자의 페르소나를 진단하고 리포트를 반환합니다.
    """
    try:
        # 기존 pipeline의 분석 로직만 실행 (이미지 생성 제외)
        report = await pipeline.analyze(
            audio_url=data.voice, 
            image_url=data.images, 
            answers=data.answers,
            q8_tone=data.q8_tone
        )
        return {"status": "success", "report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"진단 중 오류 발생: {str(e)}")

@app.post("/generate-content")
async def generate_content(data: ContentCreateRequest):
    """
    [서비스 2] 진단된 리포트를 바탕으로 AI 이미지를 생성하고 스마트 크롭을 수행합니다.
    """
    try:
        # 1. 리포트와 답변을 바탕으로 최적의 프롬프트 생성
        final_prompt = await content_creator.generate_profile_prompt(
            report=data.report, 
            answers=data.answers, 
            tones=data.q8_tone
        )
        
        # 2. DALL-E 3 이미지 생성 (Base64)
        b64_image = content_creator.generate_persona_image(
            prompt=final_prompt, 
            user_image_url=data.user_image_url
        )
        
        if not b64_image:
            raise HTTPException(status_code=500, detail="이미지 생성 실패")

        # 3. 스마트 크롭 설정 적용
        crop_configs = {
            0: {"ratio": 1.0, "mode": "Profile"},
            1: {"ratio": 0.8, "mode": "Post"},
            2: {"ratio": 0.5625, "mode": "Story"}
        }
        config = crop_configs.get(data.crop_type, crop_configs[1])

        # 4. 스마트 크롭 및 S3 업로드
        cropped_cv_img = content_creator.apply_smart_crop(
            b64_image, 
            aspect_ratio=config["ratio"], 
            mode=config["mode"]
        )
        
        import time
        file_name = f"gen_{int(time.time())}"
        final_url = content_creator.upload_cv2_to_s3(cropped_cv_img, file_name)

        return {
            "status": "success",
            "generated_image_url": final_url,
            "used_prompt": final_prompt
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"콘텐츠 생성 중 오류 발생: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)