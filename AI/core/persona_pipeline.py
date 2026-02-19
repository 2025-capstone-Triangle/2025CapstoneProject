import os
import asyncio  # 비동기 실행을 위해 필요
from dotenv import load_dotenv
import base64
import httpx

# 음성 분석 파일에서 함수 가져오기
from audio_analysis import generate_voice_keywords 

# 랭체인 관련 모듈
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser # JSON 출력을 위해 변경

from openai import OpenAI

from pydantic import BaseModel, Field

# 1. 출력 구조 정의 (랭체인 가이드에 따라 더 정확한 결과를 위해)
class PersonaReport(BaseModel):
    name: str = Field(description="페르소나 명칭(형용사+명사)")
    color_palette: list = Field(description="HEX 코드 5개")
    summary: str = Field(description="핵심 정체성 한 줄 요약")
    traits: str = Field(description="성향 및 미적 추구 방향 분석")
    keywords: list = Field(description="페르소나를 상징하는 키워드 5개")


# 2. persona 분석 클래스
class PersonaAnalyzer:
    def __init__(self, api_key):
        self.llm = ChatOpenAI(
            model="gpt-5-mini",
            api_key=api_key, 
            temperature=0.7,
        )
        self.parser = JsonOutputParser(pydantic_object=PersonaReport)


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
    
    # 전반적인 이미지를 분석하는 함수
    async def analyze_visual_impression(self, img_base64):
        print("📸 긍정 심리학 기반 이미지 분석 중...")
        try:
            visual_prompt = ChatPromptTemplate.from_messages([
                ("system", "당신은 긍정 심리학 기반의 이미지 메이킹 전문가입니다. 사용자의 외모적 특징을 아주 매력적이고 긍정적인 '크리에이터의 자질'로 승화시켜 3문장으로 분석하세요. 사용자의 사진 스타일, 패션 등을 포함합니다."),
                ("human", [
                    {
                        "type": "image_url", 
                        "image_url": {"url": img_base64}  # 전송받은 base64 이미지
                    }
                ])
            ])
            chain = visual_prompt | self.llm
            response = await chain.ainvoke({}) 
            
            visual_analysis = response.content
            print(f"✨ 시각 분석 완료: {visual_analysis}")
            return visual_analysis

        except Exception as e:
            print(f"시각 분석 중 에러 발생: {e}")
            return "매력적이고 현대적인 분위기를 가진 크리에이터입니다." # 에러 시 기본 문구

    async def analyze(self, voice_kwd, visual_analysis, user_pref):
        print("\n🌈 통합 페르소나 리포트 생성 중...")

        # 1. 포맷 지침 가져오기
        format_instructions = self.parser.get_format_instructions()

        # 2. 메시지 내용을 미리 '완성된 문자열'로 만들기 (템플릿 변수 사용 X)
        system_content = f"""당신은 퍼스널 브랜딩 전문가입니다. 
        딱 필요한 정보만 '최소한'으로 요약해서 JSON으로 출력하세요. 
        절대 다른 항목(전략, 가이드라인 등)을 추가하지 마세요.

        {format_instructions}"""

        human_content = f"음성 키워드: {voice_kwd}\n시각 분석: {visual_analysis}\n사용자 선호: {user_pref}"

        # 3. ChatPromptTemplate 대신 직접 Message 객체로 전달 (가장 안전)
        from langchain_core.messages import SystemMessage, HumanMessage
        messages = [
            SystemMessage(content=system_content),
            HumanMessage(content=human_content)
        ]

        # 4. 체인 실행 (input 변수 없이 바로 호출)
        chain = self.llm | self.parser
        return await chain.ainvoke(messages)

# 3. 페르소나 대표 이미지 생성 클래스
class ImageGenerator:
    def __init__(self, api_key):
        self.client = OpenAI(api_key=api_key)
        self.llm = ChatOpenAI(
        model="gpt-5-mini",
        api_key=api_key, 
        temperature=0.7,
        )

    async def generate_profile_prompt(self, report, vil_analysis):
        # 프롬프트 생성 과정을 사용자에게 보여주지 않고 로직으로만 처리
        prompt_msg = f"Persona: {report['summary']}, Style: {report['traits']}, Colors: {report['color_palette']}. Create a high-quality Instagram profile prompt in English."        
        res = await self.llm.ainvoke(prompt_msg)
        return res.content.strip()

    def generate_persona_image(self, prompt): 
        try:
            print("🎨 DALL-E 이미지를 생성하고 있습니다...")
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

# 4. 통합 분석 파이프라인
class PersonaPipeline:
    def __init__(self):
        # 경로 설정 및 dotenv 로드
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        dotenv_path = os.path.join(parent_dir, '.env')
        load_dotenv(dotenv_path)

        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError(f"API 키 로드 실패! 경로 확인: {dotenv_path}")
        
        # 하위 클래스 인스턴스화
        self.analyzer = PersonaAnalyzer(self.api_key)
        self.generator = ImageGenerator(self.api_key)

    async def run_e2e_test(self, audio_url, image_url, user_pref):
        # 0. 음성 분석 & 외모 분석
        voice_kwd = await self.analyzer.get_voice_keywords_from_url(audio_url)
        img_base64 = await self.analyzer.get_base64_from_url(image_url)
        visual_analysis = await self.analyzer.analyze_visual_impression(img_base64)

        # 1. 페르소나 리포트 생성
        persona_report = await self.analyzer.analyze(voice_kwd, visual_analysis, user_pref)
        
        # 2. 이미지 생성을 위한 텍스트 프롬프트 도출
        final_image_prompt = await self.generator.generate_profile_prompt(persona_report, visual_analysis)
        
        # 3. DALL-E 3로 실제 이미지 생성
        image_result_url = self.generator.generate_persona_image(final_image_prompt)

        
        return {
            "report": persona_report,
            "image_url": image_result_url
        }


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
