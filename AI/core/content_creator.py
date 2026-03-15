import os
import asyncio
import requests
import base64
import cv2
import numpy as np
import boto3
import time
from dotenv import load_dotenv
from openai import OpenAI
from langchain_openai import ChatOpenAI
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
        self.api_url = "https://api.openai.com/v1/images/generations"
        self.client = OpenAI(api_key=self.api_key)

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

        # MediaPipe Pose Landmarker 초기화 (스마트 크롭용)
        model_path = os.path.join(current_dir, 'pose_landmarker_heavy.task')
        base_options = python.BaseOptions(model_asset_path=model_path)
        options = vision.PoseLandmarkerOptions(base_options=base_options)
        self.landmarker = vision.PoseLandmarker.create_from_options(options)

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

    def generate_persona_image(self, prompt, user_image_url=None):
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

        enhanced_prompt = prompt
        if user_image_url:
            enhanced_prompt = (
            f"Please generate an image of the EXACT SAME PERSON shown in this reference image: '{user_image_url}' . "
            f"Maintain their facial features and identity perfectly. "
            f"Context: {prompt} "
            f"[Unique ID: {time.time()}]" # 매번 다른 결과를 강제하기 위한 랜덤 ID 추가
            )

        payload = {
            "model": "dall-e-3", # 모델 변경
            "prompt": enhanced_prompt,
            "n": 1,
            "size": "1024x1024",
            "response_format": "b64_json" 
        }

        try:
            print(f"🎨 {payload['model']} 모델로 이미지 생성 요청 중...")
            response = requests.post(self.api_url, headers=headers, json=payload)
            data = response.json()
            if response.status_code == 200:
                b64_data = data["data"][0].get("b64_json")
                if b64_data:
                    print("✨ 이미지 데이터(Base64) 획득 성공!")
                    return b64_data
            print(f"❌ API 오류: {response.status_code} - {data}")
            return None
        except Exception as e:
            print(f"❌ 요청 중 에러 발생: {e}")
            return None

    # --- [스마트 크롭 추가 로직] ---
    def apply_smart_crop(self, b64_data, aspect_ratio=0.8, mode="Post"):
        img_array = np.frombuffer(base64.b64decode(b64_data), np.uint8)
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
async def main(crop_type=1):
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
        mock_report, test_payload["answers"], test_payload["q8_tone"]
    )
    
    print("2. 이미지 생성 중...")
    user_photo_url = os.getenv("TEST_IMAGE_URL")
    b64_image = generator.generate_persona_image(final_prompt, user_photo_url)

    if b64_image:
        print("3. 스마트 크롭 적용 중...")
        cropped_cv_img = generator.apply_smart_crop(
            b64_image, 
            aspect_ratio=config["ratio"], 
            mode=config["mode"]
        )

        print("4. S3 업로드 중...")
        timestamp = int(time.time()) 
        unique_filename = f"user_test_{timestamp}" 
        
        final_s3_url = generator.upload_cv2_to_s3(cropped_cv_img, unique_filename)
        
        print(f"🔗 새로 생성된 이미지 주소: {final_s3_url}")
        return final_s3_url
    
if __name__ == "__main__":
    test_image_url = os.getenv("TEST_IMAGE_URL")

    test_payload = {
        "answers": {"q1_environment": 1, "q3_minimal_maximal": 1, "q4_mood": 2, "q5_contrast_type": 1, "q7_framing": 4},
        "q8_tone": [34, 23, 56, 34]
    }
    
    user_input_selection=2

    asyncio.run(main(crop_type=user_input_selection))