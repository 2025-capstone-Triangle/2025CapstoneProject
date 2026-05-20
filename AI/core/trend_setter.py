import os
import asyncio
import time

from base_generator import BaseContentGenerator


class ContentGeneration(BaseContentGenerator):
    """
    BE에서 전달한 트렌드 컨셉과 페르소나를 결합해 AI 이미지를 생성하는 클래스.
    Gemini 생성 이미지는 인스타 포스트 기본 비율인 4:5를 사용합니다.
    """
    _gemini_aspect_ratio = "4:5"

    async def generate_profile_prompt(self, be_input, report, answers, tones):
        base_elements = self._build_base_prompt(answers, tones)

        if answers.get('q1_environment') == 1:
            camera_style = (
                "Shot on iPhone 15 Pro (ProRAW) — natural ambient light, authentic candid quality, "
                "feels like a genuine photo a 20-something Korean woman would post on Instagram, "
                "slight background bokeh, true skin texture with no heavy retouching."
            )
        else:
            camera_style = (
                "Shot on Sony A7III with 85mm f/1.4 — professional studio or large-window interior lighting, "
                "editorial-quality depth of field, soft and intentional light shaping, "
                "polished yet natural feel that a 20-something Korean influencer would post on Instagram."
            )

        prompt_refine_msg = f"""
            당신은 인스타그램 트렌드를 선도하는 비주얼 디렉터입니다.
            Back-end에서 넘어온 [트렌드 컨셉]을 바탕으로 이미지를 생성하는 것을 기본 목표로 하되,
            사용자의 [페르소나]와 [비주얼 취향]을 완벽히 반영한 최종 이미지 생성용 프롬프트를 영어로 작성하세요.

            [1. 트렌드 컨셉 (BE 수신)]
            : "{be_input}"

            [2. 사용자의 페르소나 & 취향]
            - 이름/키워드: {report['name']} ({', '.join(report['keywords'])})
            - 선호 색상: {', '.join(report['color_palette'])}
            - 기술적 스타일: {base_elements}

            [작성 지침]
            - 구도(Framing): [기술적 스타일]의 첫 번째 항목에 명시된 프레이밍을 반드시 그대로 따를 것. 사용자가 선택한 구도를 임의로 변경하지 말 것.
            - 트렌드 반영: BE의 [트렌드 컨셉]에 묘사된 상황(장소, 소품, 의상)을 반영하되, 구도는 위 사용자 선택을 우선시할 것.
            - 색상: 사용자의 [선호 색상]을 의상 포인트나 배경 조명에 자연스럽게 녹이세요.
            - 조명: [기술적 스타일]에 명시된 채도, 명도, 분위기, 조명 방향 및 색온도 설정을 모두 구체적으로 반영할 것.
            - 카메라 & 스타일: {camera_style}

            결과는 영어로만, "A high-quality realistic photo of..."로 시작해서 출력하세요.
        """
        res = await self.llm.ainvoke(prompt_refine_msg)
        framing = self._get_framing(answers)
        return f"Camera framing: {framing}. {res.content.strip()}"


# --- 실행부 ---
async def main(trend_prompt, crop_type=1):
    generator = ContentGeneration()

    crop_configs = {
        0: {"ratio": 1.0,    "mode": "Profile", "label": "1-1_Square"},
        1: {"ratio": 0.8,    "mode": "Post",    "label": "4-5_Portrait"},
        2: {"ratio": 0.5625, "mode": "Story",   "label": "9-16_Full"}
    }

    config = crop_configs.get(crop_type, crop_configs[1])

    mock_report = {
        "name": "차분한 도시 산책자",
        "color_palette": ["#1A1A1A", "#E0B2B2"],
        "keywords": ["Urban", "Midnight", "Minimal"]
    }

    print("1. 프롬프트 생성 중...")
    final_prompt = await generator.generate_profile_prompt(
        trend_prompt,
        mock_report,
        test_payload["answers"],
        test_payload["q8_tone"]
    )

    print("2. 유저 이미지 다운로드 중...")
    user_photo_url = os.getenv("TEST_IMAGE_URL")
    user_pil_image = await generator.download_image_as_pil(user_photo_url)

    print("3. 이미지 생성 중...")
    image_bytes = generator.generate_persona_image(final_prompt, user_pil_image)

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
    trend_concept = "A dreamy, high-key profile photograph of a young woman resembling the one in image, with her dark hair swept up and hand behind her head. She is surrounded by a dense, shimmering cloud of out-of-focus white cherry blossoms. The bright, direct sun is backlighting her and the flowers, creating brilliant rim light on her hair and a strong, ethereal halo effect. Her expression is calm and radiant. Wide aperture, shallow depth of field, creamy bokeh, bright and airy color palette"

    test_payload = {
        "answers": {"q1_environment": 1,
                    "q3_minimal_maximal": 1,
                    "q4_mood": 2,
                    "q5_contrast_type": 1,
                    "q7_framing": 4},
        "q8_tone": [34, 23, 56, 34]
    }

    user_input_selection = 2
    asyncio.run(main(trend_prompt=trend_concept, crop_type=user_input_selection))
