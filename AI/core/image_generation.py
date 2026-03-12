import os
import asyncio
import requests
from dotenv import load_dotenv
from openai import OpenAI
from langchain_openai import ChatOpenAI

import boto3
import base64

class ImageGeneration:
    def __init__(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        dotenv_path = os.path.join(parent_dir, '.env')
        load_dotenv(dotenv_path)

        self.api_key = os.getenv("OPENAI_API_KEY")
        self.api_url = "https://api.openai.com/v1/images/generations"
        self.client = OpenAI(api_key=self.api_key)

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
        """OpenAI API를 직접 호출하여 이미지 생성"""
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

        # prompt를 조합할 때 user_image_url을 사용
        enhanced_prompt = prompt
        if user_image_url:
            enhanced_prompt = f"Reference image: {user_image_url}. {prompt}"

        payload = {
            "model": "gpt-image-1", 
            "prompt": enhanced_prompt,
            "n": 1,
            "size": "1024x1024",
            "response_format": "b64_json"  #오류나면 얘 빼기
        }

        try:
            print(f"🎨 {payload['model']} 모델로 이미지 생성 요청 중...")
            response = requests.post(self.api_url, headers=headers, json=payload)
            data = response.json()
            if response.status_code == 200:
                # 만약 구조가 다르면 KeyError 대신 None을 리턴하도록 함
                b64_data = data["data"][0].get("b64_json")
                if b64_data:
                    print("✨ 이미지 데이터(Base64) 획득 성공!")
                    return b64_data
                else:
                    print(f"❌ 데이터를 찾을 수 없습니다. 응답 내용: {data}")
                    return None
            else:                # 400, 401, 500 등 에러 발생 시 출력
                print(f"❌ API 오류: {response.status_code} - {data}")
                return None
        except Exception as e:
            print(f"❌ 요청 중 에러 발생: {e}")
            return None
        
    def upload_to_s3(self, b64_data, file_name):
        """생성된 이미지 URL을 다운로드하여 S3에 직접 업로드 (put_object 방식)"""
        try:
            # 1. OpenAI 서버에서 이미지 다운로드
            image_data = base64.b64decode(b64_data)
            s3_path = f"generated_personas/{file_name}.png"

            # 3. S3 업로드
            self.s3.put_object(
                Bucket=self.bucket_name,
                Key=s3_path,
                Body=image_data, # 디코딩된 바이너리 데이터
                ContentType='image/png'
            )

            # 4. 최종 S3 URL 생성
            region = os.getenv("AWS_REGION", "ap-northeast-2")
            final_url = f"https://{self.bucket_name}.s3.{region}.amazonaws.com/{s3_path}"
            print(f"✅ S3 업로드 완료: {final_url}")
            return final_url

        except Exception as e:
            print(f"❌ S3 업로드 에러: {e}")
            return None
        

# --- 실행부 ---
async def main():
    generator = ImageGeneration()
    
    mock_report = {
        "name": "차분한 도시 산책자",
        "color_palette": ["#1A1A1A", "#E0E0E0"],
        "keywords": ["Urban", "Midnight", "Minimal"]
    }

    # 1. 프롬프트 생성
    final_prompt = await generator.generate_profile_prompt(
        mock_report, test_payload["answers"], test_payload["q8_tone"]
    )
    
    # 2. 이미지 생성 (이제 인자 개수가 2개로 일치해!)
    user_photo_url = os.getenv("TEST_IMAGE_URL")
    generated_url = generator.generate_persona_image(final_prompt, user_photo_url)

    # 3. S3 업로드 (결과가 있을 때만 실행)
    if generated_url:
        file_name = "user_test_result" 
        final_s3_url = generator.upload_to_s3(generated_url, file_name)
        return final_s3_url # 이 URL 백엔드로 넘겨주기
    
if __name__ == "__main__":
    test_payload = {
        "answers": {"q1_environment": 1, "q3_minimal_maximal": 1, "q4_mood": 2, "q5_contrast_type": 1, "q7_framing": 4},
        "q8_tone": [34, 23, 56, 34]
    }
    asyncio.run(main())