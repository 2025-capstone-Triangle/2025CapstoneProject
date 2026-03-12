import os
import asyncio
import requests
import base64
import cv2
import numpy as np
import boto3
from dotenv import load_dotenv
from openai import OpenAI
from langchain_openai import ChatOpenAI
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

class ContentCreator:
    def __init__(self):
        # 1. 환경 변수 및 설정 로드
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        dotenv_path = os.path.join(parent_dir, '.env')
        load_dotenv(dotenv_path)

        self.api_key = os.getenv("OPENAI_API_KEY")
        self.api_url = "https://api.openai.com/v1/images/generations"
        
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

        # 2. MediaPipe Pose Landmarker 초기화
        model_path = os.path.join(current_dir, 'pose_landmarker_heavy.task')
        base_options = python.BaseOptions(model_asset_path=model_path)
        options = vision.PoseLandmarkerOptions(base_options=base_options)
        self.landmarker = vision.PoseLandmarker.create_from_options(options)

    # --- [프롬프트 생성 로직] ---
    def _build_base_prompt(self, answers, tones):
        framing_map = {1: "extreme close-up", 2: "bust shot", 3: "half-body shot", 4: "full-body shot", 5: "wide cinematic shot"}
        framing = framing_map.get(answers.get('q7_framing'), "portrait")
        env = "outdoors" if answers.get('q1_environment') == 1 else "indoors"
        density = "minimalist and clean" if answers.get('q3_minimal_maximal') == 1 else "maximalist with rich details"
        mood = "bright and airy" if answers.get('q4_mood') == 1 else "moody and calm"
        temp = "warm golden hour lighting" if tones[3] > 50 else "cool cinematic blue lighting"
        
        return f"A {framing} of the person, {env}, {density}, {mood}, {temp}."

    async def generate_profile_prompt(self, report, answers, tones):
        base_elements = self._build_base_prompt(answers, tones)
        prompt_refine_msg = f"""
        당신은 상업 사진 작가입니다. 다음 데이터를 바탕으로 인스타그램 감성 사진 생성을 위한 영문 프롬프트를 작성하세요.
        [데이터]: {base_elements}, 무드: {report['name']}, 컬러: {', '.join(report['color_palette'])}
        [지침]: Extreme Identity Consistency 유지, Shot on iPhone 15 Pro, cinematic lighting 포함. 영어로만 출력하세요.
        """
        res = await self.llm.ainvoke(prompt_refine_msg)
        return res.content.strip()

    # --- [이미지 생성 로직] ---
    def generate_persona_image(self, prompt, user_image_url=None):
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        enhanced_prompt = f"Reference image: {user_image_url}. {prompt}" if user_image_url else prompt
        
        payload = {
            "model": "gpt-image-1", 
            "prompt": enhanced_prompt,
            "n": 1,
            "size": "1024x1024",
            "response_format": "b64_json"
        }

        try:
            response = requests.post(self.api_url, headers=headers, json=payload)
            data = response.json()
            if response.status_code == 200:
                return data["data"][0].get("b64_json")
            return None
        except Exception as e:
            print(f"❌ 이미지 생성 에러: {e}")
            return None

    # --- [스마트 크롭 로직 (OpenCV & MediaPipe)] ---
    def apply_smart_crop(self, b64_data, aspect_ratio=0.8, mode="Post"):
        # 1. Base64 -> CV2 이미지
        img_array = np.frombuffer(base64.b64decode(b64_data), np.uint8)
        cv_img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        h, w, _ = cv_img.shape

        # 2. MediaPipe 분석
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB))
        detection_result = self.landmarker.detect(mp_image)

        if not detection_result.pose_landmarks:
            print("⚠️ 포즈를 찾지 못해 중앙 크롭을 수행합니다.")
            return self._center_crop(cv_img, aspect_ratio)

        # 3. 좌표 계산
        landmarks = detection_result.pose_landmarks[0]
        crop_coords = self._calculate_crop_coords(landmarks, w, h, aspect_ratio, mode)
        
        if crop_coords:
            (x, y, cw, ch) = crop_coords
            cropped_img = cv_img[y:y+ch, x:x+cw]
            return cropped_img
        return cv_img

    def _calculate_crop_coords(self, landmarks, w, h, aspect_ratio, mode):
        x_coords = [lm.x for lm in landmarks]
        y_coords = [lm.y for lm in landmarks]
        person_center_x = (min(x_coords) + max(x_coords)) / 2
        person_h_rel = max(y_coords) - min(y_coords)
        eye_y_rel = (landmarks[1].y + landmarks[5].y) / 2

        # 모드별 설정
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
        else:
            new_h = int(w / aspect_ratio)
            start_y = (h - new_h) // 2
            return img[start_y:start_y+new_h, :]

    # --- [S3 업로드 로직] ---
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
            return f"https://{self.bucket_name}.s3.{region}.amazonaws.com/{s3_path}"
        except Exception as e:
            print(f"❌ S3 업로드 실패: {e}")
            return None

# --- [메인 실행 흐름] ---
async def main():
    print("1. 스타트!")
    creator = ContentCreator()
    
    # 1. 사용자 데이터 (예시)
    mock_report = {"name": "Urban Dreamer", "color_palette": ["#FF5733", "#C70039"], "keywords": ["Modern", "Vibrant"]}
    answers = {"q1_environment": 1, "q3_minimal_maximal": 1, "q4_mood": 2, "q7_framing": 4}
    tones = [0, 0, 0, 60]
    
    # 2. 프롬프트 및 이미지 생성
    print("2. 프롬프트 생성 중...")
    prompt = await creator.generate_profile_prompt(mock_report, answers, tones)

    print("3. 이미지 생성 요청 중 (OpenAI)...")
    b64_image = creator.generate_persona_image(prompt, os.getenv("TEST_IMAGE_URL"))

    if b64_image:
        print("4. 스마트 크롭 시작 (MediaPipe)...")
        # 3. 스마트 크롭 (사용자가 'Post' 4:5 비율 선택했다고 가정)
        cropped_cv_img = creator.apply_smart_crop(b64_image, aspect_ratio=0.8, mode="Post")
        
        # 4. S3 업로드
        print("5. S3 업로드 중...")
        final_url = creator.upload_cv2_to_s3(cropped_cv_img, "final_persona_result")
        print(f"🚀 최종 결과물 URL: {final_url}")


if __name__ == "__main__":
    asyncio.run(main())
    