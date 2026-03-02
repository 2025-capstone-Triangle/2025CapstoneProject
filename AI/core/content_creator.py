import asyncio
from image_generation import ImageGeneration # 기존 네 클래스
from image_crop import run_pose_visualization # 방금 만든 크롭 함수

async def generate_and_crop_pipeline():
    # 1. 초기화
    generator = ImageGeneration()
    
    # 가상의 페르소나 리포트 (실제로는 Analyzer에서 옴)
    mock_report = {
        "name": "맑은 자연 속 소녀",
        "summary": "화사한 자연의 풍광을 즐기는 미니멀리스트",
        "color_palette": ["#E6EEE4", "#FDCB5D9E", "#FFDFDF"],
        "keywords": ["Country", "Daylight", "Minimal", "Pure"]
    }
    
    # 가상의 사용자 응답 데이터
    test_payload = {
        "answers": {
            "q1_environment": 1, "q3_minimal_maximal": 1, "q4_mood": 1, 
            "q5_contrast_type": 2, "q7_framing": 5
        },
        "q8_tone": [34, 83, 42, 72]
    }

    print("🎨 1단계: DALL-E 이미지 생성 중...")
    # 프롬프트 생성 후 이미지 URL 확보
    final_prompt = await generator.generate_profile_prompt(
        mock_report, 
        test_payload["answers"], 
        test_payload["q8_tone"]
    )
    dalle_url = generator.generate_persona_image(final_prompt)
    
    if dalle_url:
        print(f"✨ 생성 성공! URL: {dalle_url}")
        
        print("\n✂️ 2단계: 스마트 크롭 시작 (Profile, Post, Story)...")
        # 생성된 DALL-E URL을 크롭 함수에 전달!
        result_files = await run_pose_visualization(dalle_url)
        
        if result_files:
            print(f"✅ 모든 공정 완료! 저장된 파일들: {result_files}")
        else:
            print("⚠️ 크롭 실패 (포즈를 인식하지 못했을 수 있음)")
    else:
        print("❌ 이미지 생성 실패")

if __name__ == "__main__":
    asyncio.run(generate_and_crop_pipeline())