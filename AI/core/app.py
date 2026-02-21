from fastapi import FastAPI
from pydantic import BaseModel
from persona_pipeline import PersonaPipeline
import uvicorn

app = FastAPI()
pipeline = PersonaPipeline()

# 1. 백엔드에서 보내줄 새로운 JSON 규격 정의
class MediaInfo(BaseModel):
    images: str
    voice: str

class AnalysisRequest(BaseModel):
    answers: dict  # q1~q7 질문 답변들
    q8_tone: list  # [채도, 명도, 대비, 색온도]
    media: MediaInfo  # 이미지와 음성 URL

@app.post("/analyze-persona")
async def analyze_persona(data: AnalysisRequest):
    # 2. 파이프라인의 run_e2e_test에 데이터 전달
    # 기존 user_pref 대신 answers와 q8_tone을 직접 넘겨주도록 수정
    result = await pipeline.run_e2e_test(
        audio_url=data.media.voice, 
        image_url=data.media.images, 
        answers=data.answers,
        q8_tone=data.q8_tone
    )

    # 3. 분석 결과 반환
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)