import os
import io
import asyncio
import time
import cv2
import numpy as np
import boto3
import httpx
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from google import genai
from google.genai import types
from PIL import Image
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision


class ContentGeneration:
    def __init__(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        dotenv_path = os.path.join(parent_dir, '.env')
        load_dotenv(dotenv_path)

        self.api_key = os.getenv("OPENAI_API_KEY")

        # AWS S3 설정
        self.s3 = boto3.client(
            's3',
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
            aws_secret_access_key=os.getenv("AWS_SECRET_KEY"),
            region_name=os.getenv("AWS_REGION", "ap-northeast-2")
        )
        self.bucket_name = os.getenv("AWS_BUCKET")

        # LLM 설정
        self.llm = ChatOpenAI(
            model="gpt-5-mini",
            api_key=self.api_key,
            temperature=0.7
        )

        # Gemini 클라이언트 (GOOGLE_API_KEY 환경변수 자동 참조)
        self.gemini_client = genai.Client()

        # MediaPipe Pose Landmarker 초기화 (스마트 크롭용)
        model_path = os.path.join(current_dir, 'pose_landmarker_heavy.task')
        base_options = python.BaseOptions(model_asset_path=model_path)
        options = vision.PoseLandmarkerOptions(base_options=base_options)
        self.landmarker = vision.PoseLandmarker.create_from_options(options)

    def _build_base_prompt(self, report, answers, tones):
        framing_map = {
            1: "tightly framed extreme close-up focusing on expressive eyes and skin texture",
            2: "cinematic bust shot, focusing on upper body and jewelry",
            3: "half-body shot, natural pose with arms slightly in frame",
            4: "full-body shot, standing naturally, capturing the outfit and silhouette",
            5: "wide cinematic shot, person harmonized with the vast background environment"
        }

        env = "at a trendy outdoor cafe in Seoul or a sun-drenched street" if answers.get('q1_environment') == 1 \
              else "inside a minimalist, aesthetically pleasing studio or a modern interior with soft window light"

        density = "clean minimalist background, focus strictly on the subject" if answers.get('q3_minimal_maximal') == 1 \
                  else "richly detailed environment with plants, books, and sophisticated props"

        mood_str = "bright, airy, and high-key lighting with a fresh feel" if answers.get('q4_mood') == 1 \
                   else "moody, calm, and slightly dark cinematic atmosphere"
        contrast_str = "with deep shadows and striking highlights" if answers.get('q5_contrast_type') == 1 \
                       else "with soft, low-contrast, and dreamy transitions"

        s_val, v_val, c_val, t_val = tones

        if s_val > 80: saturation = "vibrant, highly saturated colors, popping tones"
        elif s_val < 30: saturation = "muted, desaturated, almost pastel-like color palette"
        else: saturation = "natural color balance, realistic saturation"

        if v_val > 80: brightness = "bright, overexposed aesthetic, high-key lighting"
        elif v_val < 30: brightness = "underexposed, low-key lighting, dark and mysterious"
        else: brightness = "well-lit, balanced exposure"

        if c_val > 80: contrast = "extreme contrast, deep black shadows and bright highlights"
        elif c_val < 30: contrast = "soft, low contrast, hazy and dreamy look"
        else: contrast = "standard cinematic contrast"

        if t_val > 70: temp = "warm golden hour glow, amber and orange tint"
        elif t_val < 30: temp = "cool blue hour tint, icy and crisp atmosphere"
        else: temp = "neutral daylight white balance"

        return (
            f"{framing_map.get(answers.get('q7_framing'), 'portrait')}, {env}, {saturation}, {brightness}, {contrast}, {temp}. "
            f"{density}, {mood_str}, {contrast_str}, {temp}. "
            f"Overall visual style matches these specific attributes: "
            f"Saturation level {s_val}/100, Brightness {v_val}/100, Contrast {c_val}/100."
        )

    async def generate_profile_prompt(self, be_input, report, answers, tones):
        base_elements = self._build_base_prompt(report, answers, tones)

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
            - BE의 [트렌드 컨셉]에 묘사된 상황(장소, 소품, 의상)을 최우선으로 반영하세요.
            - 여기에 사용자의 [선호 색상]을 의상 포인트나 배경 조명에 자연스럽게 녹이세요.
            - [기술적 스타일]에 명시된 채도, 명도, 구도 설정을 반드시 적용하세요.
            - 인물은 20대 한국 여성의 자연스러운 모습으로, 'Shot on iPhone 15 Pro' 느낌의 고해상도 실사여야 합니다.

            결과는 영어로만, "A high-quality realistic photo of..."로 시작해서 출력하세요.
        """
        res = await self.llm.ainvoke(prompt_refine_msg)
        return res.content.strip()

    async def download_image_as_pil(self, image_url: str) -> Image.Image:
        """URL에서 이미지를 다운로드해 PIL Image로 반환"""
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url)
            if response.status_code == 200:
                return Image.open(io.BytesIO(response.content))
            else:
                raise ValueError(f"유저 이미지 다운로드 실패: {response.status_code}")

    def generate_persona_image(self, prompt: str, user_pil_image: Image.Image) -> bytes | None:
        """Gemini로 유저 얼굴을 유지한 채 이미지를 생성하고 PNG bytes를 반환"""
        try:
            print("🎨 Gemini로 이미지 생성 요청 중...")
            response = self.gemini_client.models.generate_content(
                model="gemini-3.1-flash-image-preview",
                contents=[prompt, user_pil_image],
                config=types.GenerateContentConfig(
                    response_modalities=['TEXT', 'IMAGE'],
                    image_config=types.ImageConfig(
                        aspect_ratio="4:5",  # 인스타 포스트 기본 비율
                        image_size="1K",
                    ),
                )
            )

            for part in response.parts:
                if part.text is not None:
                    print(f"💬 Gemini 응답: {part.text}")
                elif image := part.as_image():
                    # 임시 파일 저장 → bytes 읽기 → 삭제
                    ts = int(time.time())
                    temp_path = f"temp_gemini_{ts}.png"
                    image.save(temp_path)
                    with open(temp_path, "rb") as f:
                        image_bytes = f.read()
                    os.remove(temp_path)
                    print("✨ 이미지 데이터 획득 성공!")
                    return image_bytes

            print("⚠️ Gemini 응답에 이미지가 없습니다.")
            return None

        except Exception as e:
            print(f"❌ 이미지 생성 에러: {e}")
            return None

    # --- [스마트 크롭 로직] ---
    def apply_smart_crop(self, image_bytes: bytes, aspect_ratio=0.8, mode="Post"):
        img_array = np.frombuffer(image_bytes, np.uint8)
        cv_img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        h, w, _ = cv_img.shape

        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB))
        detection_result = self.landmarker.detect(mp_image)

        if not detection_result.pose_landmarks:
            print("⚠️ 포즈를 찾지 못해 중앙 크롭을 수행합니다.")
            return self._center_crop(cv_img, aspect_ratio)

        landmarks = detection_result.pose_landmarks[0]
        crop_coords = self._calculate_crop_coords(landmarks, w, h, aspect_ratio, mode)

        if crop_coords:
            (x, y, cw, ch) = crop_coords
            return cv_img[y:y+ch, x:x+cw]
        return cv_img

    def _calculate_crop_coords(self, landmarks, w, h, aspect_ratio, mode):
        x_coords = [lm.x for lm in landmarks]
        y_coords = [lm.y for lm in landmarks]
        person_center_x = (min(x_coords) + max(x_coords)) / 2
        person_h_rel = max(y_coords) - min(y_coords)
        eye_y_rel = (landmarks[1].y + landmarks[5].y) / 2

        zoom_factors = {"Profile": 5, "Post": 1.6, "Story": 2.0}
        eye_ratios = {"Profile": 0.4, "Post": 0.3, "Story": 0.25}

        zoom = zoom_factors.get(mode, 1.6)
        eye_ratio = eye_ratios.get(mode, 0.3)

        pixel_crop_h = min(h, person_h_rel * h * zoom)
        pixel_crop_w = pixel_crop_h * aspect_ratio

        if pixel_crop_w > w:
            pixel_crop_w = w
            pixel_crop_h = pixel_crop_w / aspect_ratio

        target_x_min = person_center_x - ((pixel_crop_w / w) * 0.5)
        target_y_min = eye_y_rel - ((pixel_crop_h / h) * eye_ratio)

        x_min = int(max(0, min(1 - (pixel_crop_w/w), target_x_min)) * w)
        y_min = int(max(0, min(1 - (pixel_crop_h/h), target_y_min)) * h)

        return (x_min, y_min, int(pixel_crop_w), int(pixel_crop_h))

    def _center_crop(self, img, aspect_ratio):
        h, w, _ = img.shape
        if w/h > aspect_ratio:
            new_w = int(h * aspect_ratio)
            start_x = (w - new_w) // 2
            return img[:, start_x:start_x+new_w]
        new_h = int(w / aspect_ratio)
        start_y = (h - new_h) // 2
        return img[start_y:start_y+new_h, :]

    def upload_cv2_to_s3(self, cv_img, file_name):
        try:
            _, buffer = cv2.imencode('.png', cv_img)
            image_bytes = buffer.tobytes()
            s3_path = f"generated_personas/{file_name}.png"

            self.s3.put_object(
                Bucket=self.bucket_name, Key=s3_path,
                Body=image_bytes, ContentType='image/png'
            )

            region = os.getenv("AWS_REGION", "ap-northeast-2")
            final_url = f"https://{self.bucket_name}.s3.{region}.amazonaws.com/{s3_path}"
            print(f"✅ S3 업로드 완료: {final_url}")
            return final_url
        except Exception as e:
            print(f"❌ S3 업로드 에러: {e}")
            return None


# --- 실행부 ---
async def main(trend_prompt, crop_type=1):
    generator = ContentGeneration()

    crop_configs = {
        0: {"ratio": 1.0, "mode": "Profile", "label": "1-1_Square"},
        1: {"ratio": 0.8, "mode": "Post", "label": "4-5_Portrait"},
        2: {"ratio": 0.5625, "mode": "Story", "label": "9-16_Full"}
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