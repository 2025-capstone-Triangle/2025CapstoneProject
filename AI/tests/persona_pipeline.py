import os
from dotenv import load_dotenv
import base64
import mimetypes

# 1. 음성 분석 파일에서 함수 가져오기
from pyaudio_analysis_test import generate_voice_keywords 

# 2. 랭체인 관련 모듈
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

def get_base64_image_data(image_path):
    mime_type, _ = mimetypes.guess_type(image_path)
    if mime_type is None: mime_type = 'image/jpeg'
    with open(image_path, "rb") as f:
        return f"data:{mime_type};base64,{base64.b64encode(f.read()).decode('utf-8')}"

class PersonaPipeline:
    def __init__(self):

        current_dir = os.path.dirname(os.path.abspath(__file__)) # tests 폴더
        parent_dir = os.path.dirname(current_dir)                # AI 폴더 (상위)
        dotenv_path = os.path.join(parent_dir, '.env')

        # 명시적으로 경로를 지정해서 로드
        load_dotenv(dotenv_path)
        api_key = os.getenv("OPENAI_API_KEY")
        
        if not api_key:
            raise ValueError(f"API 키 로드 실패! 시도한 경로: {dotenv_path}")

        self.llm = ChatOpenAI(
            model="gpt-5-mini", 
            api_key=api_key, 
            temperature=0.7,
        )
        self.parser = StrOutputParser()

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

    def run_e2e_test(self, audio_path, image_path, user_pref):
        print("🎙️ [Step 1] 음성 분석 중...")
        voice_kwd = generate_voice_keywords(audio_path)
        
        print("\n📸 [Step 2] 이미지 인상 분석 중...")
        img_base64 = get_base64_image_data(image_path)
        visual_prompt = ChatPromptTemplate.from_messages([
            ("system", "당신은 긍정 심리학 기반의 이미지 메이킹 전문가입니다. 사용자의 외모적 특징을 아주 매력적이고 긍정적인 '크리에이터의 자질'로 승화시켜 3문장으로 분석하세요."),
            ("human", [{"type": "image_url", "image_url": {"url": img_base64}}])
        ])
        visual_analysis = (visual_prompt | self.llm | self.parser).invoke({})
        print(f"결과: {visual_analysis}")

        print("\n🌈 [Step 3] 통합 페르소나 리포트 및 컬러 추출 중...")
        identity_prompt = ChatPromptTemplate.from_messages([
            ("system", "제공된 음성, 외모, 선호 데이터를 통합하여 이 사람만의 독보적인 '디지털 페르소나'를 정의하고, 그에 어울리는 5가지 HEX 컬러 코드를 JSON 형식으로 출력하세요."),
            ("human", f"음성 분석: {voice_kwd}\n외모 분석: {visual_analysis}\n사용자 선호: {user_pref}")
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

    # 1. 현재 실행 중인 파일(persona_pipeline.py)의 절대 경로
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 2. base_dir(tests 폴더)에서 한 단계 위로 가서 data/perA 폴더로 연결!
    audio_file = os.path.abspath(os.path.join(base_dir, "..", "data", "perA", "음성2.wav"))
    image_file = os.path.abspath(os.path.join(base_dir, "..", "data", "perA", "image2.jpg"))

    print(f"DEBUG: 찾는 오디오 경로 -> {audio_file}")
    print(f"DEBUG: 찾는 이미지 경로 -> {image_file}")


    preference = """
        - Scene: Indoor studio setting, quiet and static atmosphere
        - Aesthetic: Minimalist Noir, deep shadows, moody interior with indirect lighting
        - Lighting: High contrast (Chiaroscuro), low saturation, dim ambient light, elegant backlighting
        - Composition: Static upper-body or bust shot, focused portrait with minimal movement
        """

    if os.path.exists(audio_file) and os.path.exists(image_file):
        final_result = pipeline.run_e2e_test(audio_file, image_file, preference)
        
        print("\n" + "="*50)
        print("🔥 최종 Stable Diffusion 프롬프트:")
        print(final_result)
        print("="*50)
    else:
        print("❌ 에러: 파일을 찾을 수 없습니다. 경로를 다시 확인해주세요.")