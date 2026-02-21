import os
import asyncio
from dotenv import load_dotenv
import boto3
from openai import OpenAI
from langchain_openai import ChatOpenAI

class ImageGeneration:
    def __init__(self):
        # 1. 환경 변수 로드
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        dotenv_path = os.path.join(parent_dir, '.env')
        load_dotenv(dotenv_path)

        self.api_key = os.getenv("OPENAI_API_KEY")
        
        # 2. 클라이언트 초기화
        self.client = OpenAI(api_key=self.api_key)
        self.llm = ChatOpenAI(
            model="gpt-5-mini",
            api_key=self.api_key, 
            temperature=0.7
        )

        # 3. AWS 설정
        self.aws_access = os.getenv("AWS_ACCESS_KEY")
        self.aws_secret = os.getenv("AWS_SECRET_KEY")
        self.region = os.getenv("AWS_REGION", "ap-northeast-2")
        self.bucket_name = os.getenv("AWS_BUCKET")
        self.base_path = os.getenv("AWS_PATH", "")

        self.s3 = boto3.client(
            's3',
            aws_access_key_id=self.aws_access,
            aws_secret_access_key=self.aws_secret,
            region_name=self.region
        )

    # 유형별 base prompt 정의
    def _build_base_prompt(self, answers, tones):
        """기존 로직 유지: JSON 데이터를 텍스트 조각으로 변환"""
        framing_map = {1: "close-up", 2: "bust shot", 3: "half-body shot", 4: "full-body shot", 5: "wide shot"}
        framing = framing_map.get(answers.get('q7_framing'), "portrait")

        env = "outdoors" if answers.get('q1_environment') == 1 else "indoors"
        density = "minimalist and clean background" if answers.get('q3_minimal_maximal') == 1 else "maximalist with rich details"
        mood = "bright and airy" if answers.get('q4_mood') == 1 else "moody and calm"
        contrast = "high contrast" if answers.get('q5_contrast_type') == 1 else "soft and low contrast"
        temp = "warm golden hour lighting" if tones[3] > 50 else "cool cinematic blue lighting"
        
        return f"A {framing} of a trendy 20-year-old Korean creator, {env}, {density}, {mood}, {contrast}, {temp}."

    async def generate_profile_prompt(self, report, answers, tones):
        """기존 로직 유지: 리포트와 베이스 프롬프트 결합"""
        base_elements = self._build_base_prompt(answers, tones)
        
        prompt_refine_msg = f"""
        당신은 AI 이미지 생성 전문가입니다. 아래의 요소들을 결합하여 DALL-E 3용 영어 프롬프트를 하나만 작성하세요.
        
        [필수 반영 요소]
        - 기본 구도 및 무드: {base_elements}
        - 페르소나 명칭: {report['name']}
        - 핵심 요약: {report['summary']}
        - 컬러 팔레트: {', '.join(report['color_palette'])}
        - 키워드: {', '.join(report['keywords'])}
        
        [제약사항]
        - 출력은 오직 영어 프롬프트 3 문장 이내로만 하세요.
        - 실사(Photorealistic) 느낌의 20대 한국인 인스타그램 감성으로 작성하세요.
        """
        res = await self.llm.ainvoke(prompt_refine_msg)
        return res.content.strip()

    def generate_persona_image(self, prompt): 
        """DALL-E 3를 호출하여 이미지 URL 생성"""
        try:
            print(f"🎨 생성될 최종 프롬프트: {prompt}")
            response = self.client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            return response.data[0].url
        except Exception as e:
            print(f"이미지 생성 에러: {e}")
            return None

# --- 실행부 (테스트 코드) ---
async def main():
    generator = ImageGeneration()
    
    # 임시 페르소나 리포트 (원래는 Analyzer에서 받아올 데이터)
    mock_report = {
        "name": "차분한 도시 산책자",
        "summary": "세련된 도시의 밤을 즐기는 미니멀리스트",
        "color_palette": ["#1A1A1A", "#2C3E50", "#E0E0E0"],
        "keywords": ["Urban", "Midnight", "Minimal", "Chic", "Deep"]
    }

    # 1. 프롬프트 생성 (비동기)
    final_prompt = await generator.generate_profile_prompt(
        mock_report, 
        test_payload["answers"], 
        test_payload["q8_tone"]
    )
    
    # 2. 이미지 생성 (동기 - OpenAI 라이브러리 기본값)
    image_url = generator.generate_persona_image(final_prompt)
    print(f"\n✨ 최종 이미지 URL: {image_url}")

if __name__ == "__main__":
    test_payload = {
        "answers": {
            "q1_environment": 1, "q2_style": 2, "q3_minimal_maximal": 1,
            "q4_mood": 2, "q5_contrast_type": 1, "q6_motion": 2, "q7_framing": 4
        },
        "q8_tone": [34, 23, 56, 34]
    }
    asyncio.run(main())