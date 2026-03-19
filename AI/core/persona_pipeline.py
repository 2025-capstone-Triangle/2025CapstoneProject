import os
import asyncio  # 비동기 실행을 위해 필요
from dotenv import load_dotenv
import base64
import httpx
import time

import json
import urllib.request

# 음성 분석 파일에서 함수 가져오기
from audio_analysis import generate_voice_keywords 

# 랭체인 관련 모듈
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser # JSON 출력을 위해 변경

from openai import OpenAI

from pydantic import BaseModel, Field

# 클라우드 업로드 관련
import boto3
from botocore.exceptions import NoCredentialsError

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
    async def analyze_total_impression(self, img_base64, voice_kwd):
        print("📸 시각 + 청각 데이터 기반 종합 이미지 분석 중...")
        try:
            # 시스템 메시지에 '음성과의 조화'를 분석하라는 지침 추가
            system_msg = (
                "당신은 긍정 심리학 기반의 이미지 메이킹 전문가이자 퍼스널 브랜딩 컨설턴트입니다.\n"
                f"현재 사용자의 목소리 분석 키워드는 다음과 같습니다: [{voice_kwd}]\n\n"
                "제공된 이미지(외모, 패션, 스타일)와 위 음성 키워드를 종합적으로 분석하여 "
                "사용자의 전체적인 인상을 매력적이고 긍정적인 어투로 3문장 이내로 요약하세요.\n"
                "1. 외모와 목소리가 결이 같다면 '높은 신뢰감과 일관성'을 강조하세요.\n"
                "2. 외모와 목소리에 차이가 있다면 '예상치 못한 반전 매력'이나 '입체적인 페르소나'로 칭찬하세요."
            )

            visual_prompt = ChatPromptTemplate.from_messages([
                ("system", system_msg),
                ("human", [
                    {
                        "type": "image_url", 
                        "image_url": {"url": img_base64}
                    },
                    {
                        "type": "text",
                        "text": "이 사진의 주인공과 앞서 언급한 목소리 키워드의 조화를 분석해줘."
                    }
                ])
            ])

            chain = visual_prompt | self.llm
            response = await chain.ainvoke({}) 
            
            total_analysis = response.content
            print(f"✨ 종합 분석 완료: {total_analysis}")
            return total_analysis

        except Exception as e:
            print(f"종합 분석 중 에러 발생: {e}")
            return "시각적 세련됨과 목소리의 깊이가 어우러져 독보적인 분위기를 가진 크리에이터입니다."

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
        prompt_msg = f"다음의 사항을 반영하세요: {report['summary']}, Style: {report['traits']}, 다음의 색상을 사용하되, 직접적인 옷 색이 아닌 사진의 전반적인 톤, 분위기로 녹여내세요: {report['color_palette']}. 다음 유저의 프로필 이미지 생성 프롬프트를 작성하세요. 20대 초반의 한국인, 깔끔한 두상 이미지."        
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

    def _build_base_prompt(self, answers, tones):
        saturation = "vibrant and colorful" if tones[0] > 50 else "muted and desaturated colors"
        brightness = "high-key lighting, bright" if tones[1] > 50 else "low-key lighting, dim"
        contrast_val = "striking high contrast" if tones[2] > 50 else "soft and subtle contrast"
        temperature = "warm golden hour light" if tones[3] > 50 else "cool cinematic blue light"

        framing_map = {
            1: "extreme close-up focusing on facial features", 
            2: "bust shot, upper body", 
            3: "half-body shot", 
            4: "full-body shot, standing figure", 
            5: "wide cinematic shot with person as a focal point"
        }
        # answers가 dict인지 str인지에 따라 대응 (안전하게 get 사용)
        framing = framing_map.get(answers.get('q7_framing'), "portrait")
        env = "outdoors" if answers.get('q1_environment') == 1 else "indoors"
        density = "minimalist and clean" if answers.get('q3_minimal_maximal') == 1 else "maximalist with rich details"
        mood = "bright and airy" if answers.get('q4_mood') == 1 else "moody and calm"
        contrast = "high contrast" if answers.get('q5_contrast_type') == 1 else "soft and low contrast"
        # tones[3]는 보통 온도/조명 톤이라고 가정
        temp = "warm golden hour lighting" if (tones and len(tones) > 3 and tones[3] > 50) else "cool cinematic blue lighting"
        
        return (f"A {framing} of the person, {env}, {density} style. "
                f"The image mood is {saturation}, {brightness}, {contrast_val}, with {temperature}.")
    
    async def run_e2e_test(self, audio_url, image_url, answers, tones):
        # 0. 음성 분석 & 외모 분석
        voice_kwd = await self.analyzer.get_voice_keywords_from_url(audio_url)
        img_base64 = await self.analyzer.get_base64_from_url(image_url)
        total_impression = await self.analyzer.analyze_total_impression(img_base64, voice_kwd)

        # 1. 설문 답변(answers)을 텍스트 형태의 '선호(user_pref)'로 변환
        user_pref_description = self._build_base_prompt(answers, tones)
        print(f"📝 사용자 선호 요약: {user_pref_description}")

        # 2. 페르소나 리포트 생성
        persona_report = await self.analyzer.analyze(voice_kwd, total_impression, user_pref_description)

        # 3. 이미지 생성을 위한 텍스트 프롬프트 도출
        final_image_prompt = await self.generator.generate_profile_prompt(persona_report, total_impression)

        # 3. DALL-E 3로 실제 이미지 생성
        image_result_url = self.generator.generate_persona_image(final_image_prompt)

        
        return {
            "report": persona_report,
            "image_url": image_result_url
        }

# 5. 클라우드 업로더
class CloudUploader:
    def __init__(self):
        # .env에 설정된 정보
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        dotenv_path = os.path.join(parent_dir, '.env')
        load_dotenv(dotenv_path)

        # 환경 변수에서 설정값 가져오기
        self.aws_access = os.getenv("AWS_ACCESS_KEY")
        self.aws_secret = os.getenv("AWS_SECRET_KEY")
        self.region = os.getenv("AWS_REGION", "ap-northeast-2") # 기본값 서울
        self.bucket_name = os.getenv("AWS_BUCKET")
        self.base_path = os.getenv("AWS_PATH", "") # 백엔드가 정해준 path

        # S3 클라이언트 초기화 (region_name 추가)
        self.s3 = boto3.client(
            's3',
            aws_access_key_id=self.aws_access,
            aws_secret_access_key=self.aws_secret,
            region_name=self.region
        )

    def upload_to_s3(self, local_file_path, file_name):
        """
        local_file_path: 내 컴퓨터에 저장된 파일 경로
        file_name: S3에 저장될 때 쓸 파일 이름
        """
        # 1. S3 내부 경로(Key) 생성
        # path 슬래시(/) 처리
        clean_path = self.base_path.strip("/")
        if clean_path:
            s3_key = f"{clean_path}/{file_name}"
        else:
            s3_key = file_name

        try:
            print(f"📤 S3 업로드 중: {s3_key}...")
            
            # 2. 파일 업로드
            self.s3.upload_file(
                local_file_path, 
                self.bucket_name, 
                s3_key,
                ExtraArgs={'ContentType': "image/png"} 
            )

            # 3. 최종 URL 생성 (리전 정보를 포함한 표준 포맷)
            url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{s3_key}"
            
            print(f"✅ 업로드 완료! URL: {url}")
            return url

        except NoCredentialsError:
            print("❌ AWS 자격 증명을 찾을 수 없습니다. .env 파일을 확인하세요.")
            return None
        except Exception as e:
            print(f"❌ S3 업로드 실패: {e}")
            return None
        

# --- 실제 테스트 실행 ---
if __name__ == "__main__":
    pipeline = PersonaPipeline()
    uploader = CloudUploader()
    
    #백엔드로부터 받는 링크
    test_audio = os.getenv("TEST_AUDIO_URL") 
    test_image = os.getenv("TEST_IMAGE_URL")
    
    test_answers = {
        "q1_environment": 1,        # 1: Outdoors
        "q3_minimal_maximal": 1,     # 1: Minimalist
        "q4_mood": 2,               # 2: Moody/Calm
        "q5_contrast_type": 1,      # 1: High Contrast
        "q7_framing": 4             # 4: Full-body
    }
    test_tones = [34, 23, 56, 34]

    # 비동기 함수 실행을 위한 코드
    result = asyncio.run(pipeline.run_e2e_test(test_audio, test_image, test_answers, test_tones))

    # 1. 파일 저장 변수 선언
    report_data = result['report']
    dalle_url = result['image_url'] # DALL-E가 준 임시 URL

    # 2. S3 업로드 프로세스 (로컬 저장은 '임시'로만)
    final_s3_url = None
    if dalle_url:
        try:
            # 타임스탬프로 유니크한 파일명 만들기
            ts = int(time.time())
            unique_name = f"persona_{ts}.png" 
            temp_name = f"temp_{ts}.png"
            
            urllib.request.urlretrieve(dalle_url, temp_name)
            
            # S3에 고유한 이름으로 업로드
            final_s3_url = uploader.upload_to_s3(temp_name, unique_name)
            
            if os.path.exists(temp_name):
                os.remove(temp_name)
        except Exception as e:
            print(f"❌ S3 업로드 과정 중 오류: {e}")

    # 3. 최종 결과 합치기 (백엔드에 줄 완성본)
    final_response = {
        "persona_report": report_data,
        "image_url": final_s3_url
    }

    # 4. JSON 파일로 저장 (결과 기록용)
    with open("persona_result.json", "w", encoding="utf-8") as f:
        json.dump(final_response, f, ensure_ascii=False, indent=4)
    
    print("✅ 최종 리포트가 'persona_result.json'으로 저장되었습니다.")
    print(f"🔗 최종 S3 링크: {final_s3_url}")
