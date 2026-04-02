import os
import asyncio
import time

from base_generator import BaseContentGenerator


class ImageGeneration(BaseContentGenerator):
    """
    페르소나 진단 결과를 바탕으로 AI 프로필 이미지를 생성하는 클래스.
    Gemini 생성 이미지는 1:1 비율을 사용합니다.
    """
    _gemini_aspect_ratio = "1:1"

    async def generate_profile_prompt(self, report, answers, tones):
        base_elements = self._build_base_prompt(answers, tones)

        prompt_refine_msg = f"""
        당신은 상업 사진 작가이자 AI 프롬프트 엔지니어입니다.
        사용자의 정체성을 유지하면서 인스타그램 감성 사진을 생성하기 위한 영문 지시문을 작성하세요.

        [분석 데이터]
        - 구도 및 조명: {base_elements}
        - 인스타 무드: {report['name']}, {', '.join(report['keywords'])}
        - 핵심 컬러: {', '.join(report['color_palette'])}

        [지침]
        1. "Framing": 위 '구도 및 조명'의 첫 번째 항목(프레이밍)을 반드시 그대로 적용할 것. 사용자가 선택한 구도(예: full-body, half-body 등)를 임의로 변경하지 말 것.
        2. "Mood & Setting": 위 '구도 및 조명'에 명시된 환경, 분위기, 채도, 명도, 조명 설정을 모두 반영할 것.
        3. "Extreme Identity Consistency": 원본 사진 속 인물의 얼굴형과 특징을 유지하세요.
        4. "Instagram Aesthetic": Shot on iPhone 15 Pro, cinematic lighting 포함.
        5. "Natural Texture": 실제 사진 같은 Grain과 질감 추가.
        6. 영어로 작성하세요.
        """
        res = await self.llm.ainvoke(prompt_refine_msg)
        framing = self._get_framing(answers)
        return f"Camera framing: {framing}. {res.content.strip()}"


# --- 실행부 ---
async def main(crop_type=1):
    generator = ImageGeneration()

    crop_configs = {
        0: {"ratio": 1.0,    "mode": "Profile", "label": "1-1_Square"},
        1: {"ratio": 0.8,    "mode": "Post",    "label": "4-5_Portrait"},
        2: {"ratio": 0.5625, "mode": "Story",   "label": "9-16_Full"}
    }
    config = crop_configs.get(crop_type, crop_configs[1])

    mock_report = {
        "name": "맑은 자연 산책자",
        "color_palette": ["#F7E3E0", "#EBEBEB", "#F7FFE5"],
        "keywords": ["Natural", "Daylight", "Minimal"]
    }

    # 1. 프롬프트 생성
    final_prompt = await generator.generate_profile_prompt(
        mock_report, test_payload["answers"], test_payload["q8_tone"]
    )

    # 2. 유저 이미지 PIL로 다운로드
    user_photo_url = os.getenv("TEST_IMAGE_URL")
    user_pil_image = await generator.download_image_as_pil(user_photo_url)

    # 3. 이미지 생성
    print("3. 이미지 생성 중...")
    image_bytes = generator.generate_persona_image(final_prompt, user_pil_image)

    # 4. 포즈 기반 스마트 크롭 적용
    if image_bytes:
        print("4. 스마트 크롭 적용 중...")
        cropped_cv_img = generator.apply_smart_crop(
            image_bytes,
            aspect_ratio=config["ratio"],
            mode=config["mode"]
        )

        print("5. S3 업로드 중...")
        unique_filename = f"user_test_{int(time.time())}"
        final_s3_url = generator.upload_cv2_to_s3(cropped_cv_img, unique_filename)

        print(f"🔗 새로 생성된 이미지 주소: {final_s3_url}")
        return final_s3_url


if __name__ == "__main__":
    test_payload = {
        "answers": {"q1_environment": 1, "q2_style": 2, "q3_minimal_maximal": 1, "q4_mood": 1, "q5_contrast_type": 2, "q6_motion": 2, "q7_framing": 5},
        "q8_tone": [34, 73, 36, 72]
    }
    user_input_selection = 1  # 0: 1:1 Square, 1: 4:5 Portrait, 2: 9:16 Story
    asyncio.run(main(crop_type=user_input_selection))
