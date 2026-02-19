from fastapi import FastAPI
from pydantic import BaseModel  # 링크 형식을 정의
from persona_pipeline import PersonaPipeline
import uvicorn

app = FastAPI()
pipeline = PersonaPipeline()

# 1. 백엔드에서 보내줄 데이터 형식을 미리 정의
class AnalysisRequest(BaseModel):
    image_url: str
    voice_url: str
    user_pref: str

@app.post("/analyze-persona")
async def analyze_persona(data: AnalysisRequest):
    # 2. data.image_url 처럼 점(.)을 찍어서 꺼내 쓰는 형식
    result = await pipeline.run_e2e_test(
        audio_url=data.voice_url, 
        image_url=data.image_url, 
        user_pref=data.user_pref
    )

    # 3. 분석 결과 반환
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)