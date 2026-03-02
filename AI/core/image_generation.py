import os
import asyncio
import base64
from dotenv import load_dotenv
import boto3
from openai import OpenAI
from langchain_openai import ChatOpenAI

class ImageGeneration:
    def __init__(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        dotenv_path = os.path.join(parent_dir, '.env')
        load_dotenv(dotenv_path)

        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key)
        
        # 프롬프트 정제용 LLM (GPT-5 기반)
        self.llm = ChatOpenAI(
            model="gpt-5-mini",
            api_key=self.api_key, 
            temperature=0.7
        )

    def _build_base_prompt(self, answers, tones):
        # 구도 매핑 보강
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
        
        return f"A {framing} of the person in the provided image, {env}, {density}, {mood}, {contrast}, {temp}."

    async def generate_profile_prompt(self, report, answers, tones):
        base_elements = self._build_base_prompt(answers, tones)
        
        # 인스타 감성을 위한 기술적 키워드 추가 (Shot on iPhone, Cinematic lighting 등)
        prompt_refine_msg = f"""
        당신은 상업 사진 작가이자 AI 프롬프트 엔지니어입니다. 
        입력된 인물의 얼굴과 신체 특징을 '복제' 수준으로 유지하며 인스타그램 감성 사진을 생성하기 위한 지시문을 작성하세요.

        [분석 데이터]
        - 대상 인물: 제공된 input_image 속 인물
        - 구도 및 조명: {base_elements}
        - 인스타 무드: {report['name']}, {', '.join(report['keywords'])}
        - 톤앤매너: {', '.join(report['color_palette'])}

        [지침]
        1. "Replicate the exact facial structure" : 얼굴형, 눈의 기울기, 입술 두께를 사진과 똑같이 유지하세요.
        2. "Consistent Identity" : AI가 인물을 재해석하지 못하게 하고, 사진 속 인물을 그대로 다른 장소에 데려다 놓은 것처럼 묘사하세요.
        3. "Shot on high-end mirrorless" : 인스타 감성을 위해 f/1.8 조리개값과 자연스러운 필름 그레인을 추가하세요.
        4. 'Photorealistic, Shot on iPhone 15 Pro, 4k, cinematic social media aesthetic' 키워드를 포함하세요.
        5. 영어로 10문장 이내로 강하게 작성하세요.
        """
        res = await self.llm.ainvoke(prompt_refine_msg)
        return res.content.strip()

    def generate_persona_image_gpt5(self, prompt, user_image_url):
        """GPT-5의 새로운 이미지 생성 도구를 사용해 Identity 유지 생성"""
        try:
            print(f"🎨 GPT-5 생성 시작 (Identity Reference 모드)")
            
            # GPT-5 responses api 호출
            response = self.client.responses.create(
                model="gpt-5",
                input=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "input_text", 
                                "text": f"Generate a high-end Instagram lifestyle photo. Core Requirement: The person's facial identity must be 100% identical to the reference image. Detailed Prompt: {prompt}"
                            },
                            {"type": "input_image", "image_url": user_image_url}
                        ]
                    }
                ],
                tools=[{"type": "image_generation", "action": "generate"}],
            )

            # 결과 데이터(base64) 추출
            image_call = next(output for output in response.output if output.type == "image_generation_call")
            image_base64 = image_call.result
            
            # 파일로 저장 (테스트용)
            output_filename = "generated_persona.png"
            with open(output_filename, "wb") as f:
                f.write(base64.b64decode(image_base64))
            
            print(f"✨ 이미지 생성 완료: {output_filename}")
            return output_filename # 파일 경로 반환

        except Exception as e:
            print(f"GPT-5 이미지 생성 에러: {e}")
            return None

# --- 실행부 (통합 테스트) ---
async def main():
    generator = ImageGeneration()
    
    mock_report = {
        "name": "차분한 도시 산책자",
        "summary": "세련된 도시의 밤을 즐기는 미니멀리스트",        "color_palette": ["#1A1A1A", "#E0E0E0"],
        "keywords": ["Urban", "Midnight", "Minimal"]
    }

    # 1. 프롬프트 생성
    final_prompt = await generator.generate_profile_prompt(
        mock_report, test_payload["answers"], test_payload["q8_tone"]
    )
    
    # 2. GPT-5 이미지 생성 (사용자 원본 이미지 URL 필요)
    user_photo_url = os.getenv("TEST_IMAGE_URL")
    image_file = generator.generate_persona_image_gpt5(final_prompt, user_photo_url)
    
if __name__ == "__main__":
    test_payload = {
        "answers": {"q1_environment": 1, "q3_minimal_maximal": 1, "q4_mood": 2, "q5_contrast_type": 1, "q7_framing": 4},
        "q8_tone": [34, 23, 56, 34]
    }
    asyncio.run(main())