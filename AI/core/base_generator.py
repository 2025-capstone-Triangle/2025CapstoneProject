import os
import io
import time
import cv2
import numpy as np
import boto3
import httpx
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from google import genai
from google.genai import types
from PIL import Image

from image_crop import image_crop


class BaseContentGenerator:
    """
    ImageGeneration과 ContentGeneration의 공통 로직을 담는 베이스 클래스.
    - Gemini 이미지 생성 aspect ratio는 서브클래스에서 _gemini_aspect_ratio로 오버라이드
    """
    _gemini_aspect_ratio: str = "1:1"

    def __init__(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        load_dotenv(os.path.join(parent_dir, '.env'))

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

        self.gemini_client = genai.Client()

        # MediaPipe Pose Landmarker 초기화 (스마트 크롭용)
        model_path = os.path.join(current_dir, 'pose_landmarker_heavy.task')
        base_options = mp_python.BaseOptions(model_asset_path=model_path)
        options = vision.PoseLandmarkerOptions(base_options=base_options)
        self.landmarker = vision.PoseLandmarker.create_from_options(options)

    def _get_framing(self, answers) -> str:
        """answers의 q7_framing 값을 Gemini 프롬프트에 직접 삽입할 framing 텍스트로 변환합니다."""
        framing_map = {
            1: "extreme close-up shot, face only",
            2: "bust shot, upper body and shoulders only",
            3: "half-body shot, waist up",
            4: "full-body shot, entire figure visible from head to toe",
            5: "wide cinematic shot, person full-body being speck in a landscape, harmonized with the vast background environment"
        }
        return framing_map.get(answers.get('q7_framing'))

    def _build_base_prompt(self, answers, tones):
        """설문 답변과 톤 슬라이더 값으로 이미지 생성용 기본 스타일 설명을 반환합니다."""
        framing_map = {
            1: "tightly framed extreme close-up focusing on expressive eyes and skin texture",
            2: "cinematic bust shot, focusing on upper body and jewelry",
            3: "half-body shot, natural pose with arms slightly in frame",
            4: "full-body shot, standing naturally, capturing the outfit and silhouette",
            5: "wide cinematic shot, person full-body being speck in a landscape, harmonized with the vast background environment"
        }

        if answers.get('q1_environment') == 1:
            env = (
                "Shot on iPhone 15 Pro (ProRAW). "
                "Casual outdoor setting — trendy street-side cafe terrace in Seongsu-dong or Hongdae, Seoul. "
                "Natural ambient sunlight filtering through a cafe awning or dappled through urban trees, "
                "warm mid-afternoon sun casting gentle directional shadows. "
                "Authentic candid Instagram lifestyle vibe, slight background bokeh from wide aperture mode."
            )
        else:
            env = (
                "Shot on Sony A7III with 85mm f/1.4 portrait lens. "
                "Minimalist indoor studio or aesthetically curated modern apartment interior in Seoul. "
                "Soft diffused natural window light from a large north-facing window, "
                "supplemented by a single white umbrella fill light to lift shadows. "
                "Clean seamless white or warm-toned background, professional editorial quality with soft catchlights in eyes."
            )

        style = "candid, natural everyday lifestyle look, unposed and effortless" if answers.get('q2_style') == 1 \
                else "editorial, carefully styled and directed pose, fashion-shoot aesthetic"

        density = "clean minimalist background, focus strictly on the subject" if answers.get('q3_minimal_maximal') == 1 \
                  else "richly detailed environment with plants, books, and sophisticated props"

        mood_str = (
            "bright airy high-key lighting — soft, fully diffused natural light with no harsh shadows, "
            "even illumination across skin and background, fresh and clean Instagram aesthetic, "
            "delicate lens flare or light leak at frame edge"
        ) if answers.get('q4_mood') == 1 else (
            "moody low-key cinematic lighting — single directional light source creating dramatic side shadows, "
            "deep contrast between lit and shadow sides of the face, atmospheric and intimate atmosphere, "
            "subtle ambient light wrapping around background"
        )
        contrast_str = "with deep shadows and striking highlights" if answers.get('q5_contrast_type') == 1 \
                       else "with soft, low-contrast, and dreamy transitions"

        motion = "still and composed pose, calm and poised body language" if answers.get('q6_motion') == 1 \
                 else "dynamic, caught-in-motion energy, natural movement and flowing hair or clothing"

        s_val, v_val, c_val, t_val = tones

        if s_val > 80: saturation = "vibrant, highly saturated colors, popping tones"
        elif s_val < 30: saturation = "muted, desaturated, almost pastel-like color palette"
        else: saturation = "natural color balance, realistic saturation"

        if v_val > 80: brightness = "overexposed bright aesthetic — blown-out highlights, shot toward backlight or bright overcast sky, sun-drenched feel"
        elif v_val < 30: brightness = "underexposed, dark and shadowy — dim indoor or dusk light, low ambient fill"
        else: brightness = "well-exposed, balanced natural daylight, skin tones rendered accurately"

        if c_val > 80: contrast = "extreme contrast, deep black shadows and bright highlights"
        elif c_val < 30: contrast = "soft, low contrast, hazy and dreamy look"
        else: contrast = "standard cinematic contrast"

        if t_val > 70: temp = "warm golden hour glow — late afternoon sun at ~4000K, amber and honey tones washing the scene"
        elif t_val < 30: temp = "cool blue hour atmosphere — overcast shade at ~7500K, crisp and icy tones"
        else: temp = "neutral midday daylight at ~5500K white balance, clean and true-to-life"

        return (
            f"{framing_map.get(answers.get('q7_framing'), 'portrait')}, {env}, {style}, {motion}. "
            f"{density}, {mood_str}, {contrast_str}. "
            f"{saturation}, {brightness}, {contrast}, {temp}. "
            f"Overall visual style matches these specific attributes: "
            f"Saturation level {s_val}/100, Brightness {v_val}/100, Contrast {c_val}/100."
        )

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
                        aspect_ratio=self._gemini_aspect_ratio,
                        image_size="1K",
                    ),
                )
            )

            for part in response.parts:
                if part.text is not None:
                    print(f"💬 Gemini 응답: {part.text}")
                elif image := part.as_image():
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

    def apply_smart_crop(self, image_bytes: bytes, aspect_ratio: float, mode: str):
        """image_crop 모듈의 image_crop() 함수를 호출해 크롭된 cv2 이미지를 반환"""
        img_array = np.frombuffer(image_bytes, np.uint8)
        cv_img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        h, w, _ = cv_img.shape

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB)
        )
        detection_result = self.landmarker.detect(mp_image)

        if not detection_result.pose_landmarks:
            print("⚠️ 포즈를 찾지 못해 중앙 크롭을 수행합니다.")
            return self._center_crop(cv_img, aspect_ratio)

        landmarks = detection_result.pose_landmarks[0]

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
