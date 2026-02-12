import os
import base64
import mimetypes
import httpx
import asyncio  # 비동기 실행을 위해 필요
from dotenv import load_dotenv
from io import BytesIO

# 1. 음성 분석 파일에서 함수 가져오기
from audio_analysis import generate_voice_keywords 

# 2. 랭체인 관련 모듈
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

class PersonaPipeline:
    def __init__(self):
        # 경로 설정 및 dotenv 로드 (복구됨!)
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        dotenv_path = os.path.join(parent_dir, '.env')
        load_dotenv(dotenv_path)

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError(f"API 키 로드 실패! 경로 확인: {dotenv_path}")

        self.llm = ChatOpenAI(
            model="gpt-4o-mini", # 현재는 4o-mini가 가장 안정적이야!
            api_key=api_key, 
            temperature=0.7,
        )
        self.parser = StrOutputParser()

    # URL에서 이미지를 가져와 바로 Base64로 만드는 함수
    async def get_base64_from_url(self, image_url):
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url)
            if response.status_code == 200:
                content_type = response.headers.get("Content-Type", "image/jpeg")
                encoded_string = base64.b64encode(response.content).decode('utf-8')
                return f"data:{content_type};base64,{encoded_string}"
            else:
                raise ValueError(f"이미지 다운로드 실패: {response.status_code}")

    # 음성 URL을 받아서 분석하는 함수 (임시 저장 로직 포함)
    async def get_voice_keywords_from_url(self, audio_url):
        async with httpx.AsyncClient() as client:
            response = await client.get(audio_url)
            if response.status_code == 200:
                # 임시 파일로 저장 (분석 함수가 경로를 요구할 경우)
                temp_filename = "temp_audio.wav"
                with open(temp_filename, "wb") as f:
                    f.write(response.content)
                
                # 기존 분석 함수 실행
                keywords = generate_voice_keywords(temp_filename)
                
                # 분석 후 임시 파일 삭제
                if os.path.exists(temp_filename):
                    os.remove(temp_filename)
                return keywords
            else:
                return "음성 분석 실패 (다운로드 오류)"

    # Step 4를 별도의 메서드로 분리
    def get_image_generation_prompt(self, identity_report, visual_analysis, user_pref):
        gen_prompt = ChatPromptTemplate.from_messages([
            ("system", """당신은 세계 최고의 AI 아티스트이자 인스타그램 크리에이티브 디렉터입니다.
            다음 지침을 결합하여 Stable Diffusion용 고퀄리티 영어 프롬프트를 작성하세요.
            
            [1. 인물 기반]: {visual_analysis} (이 특징을 가진 인물을 주인공으로 설정)
            [2. 스타일 가이드]: {user_pref}
            [3. 컬러 가이드]: {identity_report} 속의 HEX 코드를 의상이나 배경 소품에 자연스럽게 녹일 것.
            
            [출력 규칙]:
            - 단어 위주의 나열이 아닌, 화보를 묘사하는 생생한 문장으로 시작하세요.
            - 'Photorealistic, 8k, highly detailed, trendy Instagram aesthetic'을 포함하세요.
            - 모든 인물의 특성을 임의 생략 없이 전부 반영할 수 있도록 하세요.
            - 오직 영어 프롬프트만 출력하세요.
            - 인위적인 보정이나 뒤틀림이 없는 자연스러운 모습을 지향하세요.
            - 불필요한 텍스트나 로고가 포함되지 않도록 하세요.
            
            출력 형식은 반드시 아래 형식을 지켜주세요:
            {{
              "persona": "여기에 페르소나 요약",
              "prompt": "여기에 영문 프롬프트"
            }}
            """),
            ("human", "위 가이드라인을 통합한 최종 이미지 생성 프롬프트를 만들어줘.")
        ])
        
        # chain 실행 시 모든 변수를 한꺼번에 던져줍니다.
        chain = gen_prompt | self.llm | self.parser
        return chain.invoke({
            "identity_report": identity_report,
            "visual_analysis": visual_analysis,
            "user_pref": user_pref
        })

    async def run_e2e_test(self, audio_url, image_url, user_pref):
        print("🎙️ [Step 1] 음성 분석 중...")
        voice_kwd = await self.get_voice_keywords_from_url(audio_url)
        
        print("\n📸 [Step 2] 이미지 인상 분석 중...")
        img_base64 = await self.get_base64_from_url(image_url)
        visual_prompt = ChatPromptTemplate.from_messages([
            ("system", "당신은 긍정 심리학 기반의 이미지 메이킹 전문가입니다. 사용자의 외모적 특징을 아주 매력적이고 긍정적인 '크리에이터의 자질'로 승화시켜 3문장으로 분석하세요."),
            ("human", [{"type": "image_url", "image_url": {"url": img_base64}}])
        ])
        visual_analysis = (visual_prompt | self.llm | self.parser).invoke({})
        print(f"결과: {visual_analysis}")

        print("\n🌈 [Step 3] 통합 페르소나 리포트 및 컬러 추출 중...")
        identity_prompt = ChatPromptTemplate.from_messages([
            ("system", "제공된 음성, 외모, 선호 데이터를 통합하여 이 사람만의 독보적인 '디지털 페르소나'를 정의하고, 그에 어울리는 5가지 HEX 컬러 코드를 JSON 형식으로 출력하세요."),
            ("human", f"음성: {voice_kwd}\n외모: {visual_analysis}\n사용자 선호: {user_pref}")
        ])
        identity_report = (identity_prompt | self.llm | self.parser).invoke({})
        print(f"결과: {identity_report}")

        print("\n✨ [Step 4] 최종 이미지 생성용 프롬프트 도출 중...")
        # 위에서 만든 메소드 호출
        final_prompt = self.get_image_generation_prompt(identity_report, visual_analysis, user_pref)
        return final_prompt

# --- 실제 테스트 실행 ---
if __name__ == "__main__":
    pipeline = PersonaPipeline()
    
    #백엔드로부터 받는 링크
    test_audio = os.getenv("TEST_AUDIO_URL") 
    test_image = os.getenv("TEST_IMAGE_URL")
    
    preference = """
        - Scene: Indoor studio setting, quiet and static atmosphere
        - Aesthetic: Minimalist Noir, deep shadows, moody interior with indirect lighting
        - Lighting: High contrast (Chiaroscuro), low saturation, dim ambient light, elegant backlighting
        - Composition: Static upper-body or bust shot, focused portrait with minimal movement
        """
    
    # 비동기 함수 실행을 위한 코드
    result = asyncio.run(pipeline.run_e2e_test(test_audio, test_image, preference))
    print(result)
