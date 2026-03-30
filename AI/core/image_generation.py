import os
import io
import asyncio
import time
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

import numpy as np
import cv2

import boto3
from google import genai
from google.genai import types
from PIL import Image
import httpx

from image_crop  import image_crop

class ImageGeneration:
    def __init__(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        dotenv_path = os.path.join(parent_dir, '.env')
        load_dotenv(dotenv_path)

        self.api_key = os.getenv("OPENAI_API_KEY")

        self.s3 = boto3.client(
            's3',
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
            aws_secret_access_key=os.getenv("AWS_SECRET_KEY"),
            region_name=os.getenv("AWS_REGION", "ap-northeast-2")
        )
        self.bucket_name = os.getenv("AWS_BUCKET")

        self.llm = ChatOpenAI(
            model="gpt-5-mini",
            api_key=self.api_key,
            temperature=0.7
        )

        # Gemini 클라이언트 (GOOGLE_API_KEY 환경변수 자동 참조)
        self.gemini_client = genai.Client()

    def _build_base_prompt(self, answers, tones):
        framing_map = {
            1: "extreme close-up focusing on facial features",
            2: "bust shot, upper body",
            3: "half-body shot",
            4: "full-body shot, standing figure",
            5: "wide cinematic shot with person as a focal point"
        }
        framing = framing_map.get(answers.get('q7_framing'), "portrait")
        env = "outdoors" if answers.get('q1_environment') == 1 else "indoors"
        density = "minimalist and clean" if answers.get('q3_minimal_maximal') == 1 else "maximalist with rich details"
        mood = "bright and airy" if answers.get('q4_mood') == 1 else "moody and calm"
        contrast = "high contrast" if answers.get('q5_contrast_type') == 1 else "soft and low contrast"
        temp = "warm golden hour lighting" if tones[3] > 50 else "cool cinematic blue lighting"

        return f"A {framing} of the person, {env}, {density}, {mood}, {contrast}, {temp}."

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
        1. "Extreme Identity Consistency": 원본 사진 속 인물의 얼굴형과 특징을 유지하세요.
        2. "Instagram Aesthetic": Shot on iPhone 15 Pro, cinematic lighting 포함.
        3. "Natural Texture": 실제 사진 같은 Grain과 질감 추가.
        4. 영어로 작성하세요.
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
                        aspect_ratio="1:1",
                        image_size="1K",
                    ),
                )
            )

            for part in response.parts:
                if part.text is not None:
                    print(f"💬 Gemini 응답: {part.text}")
                elif image := part.as_image():
                    ts = int(time.time())
                    # PIL Image → bytes 변환
                    temp_path = f"temp_gemini_{ts}.png"
                    image.save(temp_path)          # 경로만 받는 Gemini 방식
                    with open(temp_path, "rb") as f:
                        image_bytes = f.read()
                    os.remove(temp_path)
                    return image_bytes

            print("⚠️ Gemini 응답에 이미지가 없습니다.")
            return None

        except Exception as e:
            print(f"❌ 이미지 생성 에러: {e}")
            return None

    def apply_smart_crop(self, image_bytes: bytes, aspect_ratio: float, mode: str):
        """image_crop 모듈의 image_crop() 함수를 호출해 크롭된 cv2 이미지를 반환"""
        img_array = np.frombuffer(image_bytes, np.uint8)
        cv_img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        h, w, _ = cv_img.shape
 
        # MediaPipe로 랜드마크 검출
        import mediapipe as mp
        from mediapipe.tasks import python as mp_python
        from mediapipe.tasks.python import vision
 
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, 'pose_landmarker_heavy.task')
        base_options = mp_python.BaseOptions(model_asset_path=model_path)
        options = vision.PoseLandmarkerOptions(base_options=base_options)
 
        with vision.PoseLandmarker.create_from_options(options) as landmarker:
            mp_image = mp.Image(
                image_format=mp.ImageFormat.SRGB,
                data=cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB)
            )
            detection_result = landmarker.detect(mp_image)
 
        if not detection_result.pose_landmarks:
            print("⚠️ 포즈를 찾지 못해 중앙 크롭을 수행합니다.")
            return self._center_crop(cv_img, aspect_ratio)
 
        landmarks = detection_result.pose_landmarks[0]
 
        # image_crop 모듈의 함수 호출
        crop_info = image_crop(landmarks, w, h, aspect_ratio=aspect_ratio, mode=mode)
        if crop_info is None:
            print("⚠️ 크롭 좌표 계산 실패, 중앙 크롭을 수행합니다.")
            return self._center_crop(cv_img, aspect_ratio)
 
        (x, y, cw, ch), angle = crop_info
        print(f"✂️ 크롭 적용 — mode: {mode}, angle: {angle:.1f}°")
        return cv_img[y:y+ch, x:x+cw]
 
    def _center_crop(self, img, aspect_ratio):
        """포즈 미감지 시 폴백용 중앙 크롭"""
        h, w, _ = img.shape
        if w / h > aspect_ratio:
            new_w = int(h * aspect_ratio)
            start_x = (w - new_w) // 2
            return img[:, start_x:start_x+new_w]
        new_h = int(w / aspect_ratio)
        start_y = (h - new_h) // 2
        return img[start_y:start_y+new_h, :]
 
    def upload_cv2_to_s3(self, cv_img, file_name: str) -> str | None:
        """크롭된 cv2 이미지를 PNG로 인코딩해 S3에 업로드"""
        try:
            _, buffer = cv2.imencode('.png', cv_img)
            image_bytes = buffer.tobytes()
            s3_path = f"generated_personas/{file_name}.png"
 
            self.s3.put_object(
                Bucket=self.bucket_name,
                Key=s3_path,
                Body=image_bytes,
                ContentType='image/png'
            )
 
            region = os.getenv("AWS_REGION", "ap-northeast-2")
            final_url = f"https://{self.bucket_name}.s3.{region}.amazonaws.com/{s3_path}"
            print(f"✅ S3 업로드 완료: {final_url}")
            return final_url
 
        except Exception as e:
            print(f"❌ S3 업로드 에러: {e}")
            return None

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
        "name": "차분한 도시 산책자",
        "color_palette": ["#F7E3E0", "#EBEBEB","#F7FFE5"],
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
        "answers": {"q1_environment": 1, "q2_style": 2, "q3_minimal_maximal": 1, "q4_mood": 1, "q5_contrast_type": 2, "q6_motion": 1, "q7_framing": 3},
        "q8_tone": [34, 73, 36, 72]
    }
    user_input_selection = 1  # 0: 1:1 Square, 1: 4:5 Portrait, 2: 9:16 Story
    asyncio.run(main(crop_type=user_input_selection))