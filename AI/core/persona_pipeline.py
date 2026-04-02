import os
import io
import asyncio
import json
import time
from dotenv import load_dotenv
import httpx

# 음성 분석 파일에서 함수 가져오기
from audio_analysis import generate_voice_keywords

# 랭체인 관련 모듈
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.output_parsers import JsonOutputParser

# gemini SDK
from google import genai
from google.genai import types
from PIL import Image
from pydantic import BaseModel, Field

# 클라우드 업로드 관련
import boto3
from botocore.exceptions import NoCredentialsError

# 1. 출력 구조 정의
class PersonaReport(BaseModel):
    name: str = Field(description="페르소나 명칭(형용사+명사)")
    color_palette: list = Field(description="HEX 코드 5개(전반적인 q8 색감에 맞추어 선택할 것)")
    summary: str = Field(description="핵심 정체성 한 줄 요약")
    traits: str = Field(description="성향 및 미적 추구 방향 상세한 분석")
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

    async def get_image_bytes_from_url(self, image_url):
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url)
            if response.status_code == 200:
                return response.content, response.headers.get("Content-Type", "image/jpeg")
            else:
                raise ValueError(f"이미지 다운로드 실패: {response.status_code}")

    async def get_voice_keywords_from_url(self, audio_url):
        async with httpx.AsyncClient() as client:
            response = await client.get(audio_url)
            if response.status_code == 200:
                temp_filename = "temp_audio.wav"
                with open(temp_filename, "wb") as f:
                    f.write(response.content)
                keywords = generate_voice_keywords(temp_filename)
                if os.path.exists(temp_filename):
                    os.remove(temp_filename)
                return keywords
            else:
                return "음성 분석 실패 (다운로드 오류)"

    async def analyze_total_impression(self, img_bytes, voice_kwd):
        print("📸 시각 + 청각 데이터 기반 종합 이미지 분석 중...")
        try:
            img_base64 = "data:image/jpeg;base64," + __import__('base64').b64encode(img_bytes[0]).decode()
            system_msg = (
                "당신은 긍정 심리학 기반의 이미지 메이킹 전문가이자 퍼스널 브랜딩 컨설턴트입니다.\n"
                f"현재 사용자의 목소리 분석 키워드는 다음과 같습니다: [{voice_kwd}]\n\n"
                "제공된 이미지(외모, 패션, 스타일)와 위 음성 키워드를 종합적으로 분석하여 "
                "사용자의 전체적인 인상을 매력적이고 긍정적인 어투로 3문장 이내로 요약하세요.\n"
                "1. 외모와 목소리가 결이 같다면 '높은 신뢰감과 일관성'을 강조하세요.\n"
                "2. 외모와 목소리에 차이가 있다면 '예상치 못한 반전 매력'이나 '입체적인 페르소나'로 칭찬하세요."
            )
            messages = [
                SystemMessage(content=system_msg),
                HumanMessage(content=[
                    {"type": "image_url", "image_url": {"url": img_base64}},
                    {"type": "text", "text": "이 사진의 주인공과 앞서 언급한 목소리 키워드의 조화를 분석해줘."}
                ])
            ]
            response = await self.llm.ainvoke(messages)
            total_analysis = response.content
            print(f"✨ 종합 분석 완료: {total_analysis}")
            return total_analysis

        except Exception as e:
            print(f"종합 분석 중 에러 발생: {e}")
            return "시각적 세련됨과 목소리의 깊이가 어우러져 독보적인 분위기를 가진 크리에이터입니다."

    async def analyze(self, voice_kwd, visual_analysis, user_pref):
        print("\n🌈 통합 페르소나 리포트 생성 중...")

        format_instructions = self.parser.get_format_instructions()

        system_content = f"""당신은 퍼스널 브랜딩 전문가입니다. 
        딱 필요한 항목만 JSON으로 출력하세요. 
        절대 다른 항목(전략, 가이드라인 등)을 추가하지 마세요.

        {format_instructions}"""

        human_content = f"음성 키워드: {voice_kwd}\n시각 분석: {visual_analysis}\n사용자 선호: {user_pref}"

        messages = [
            SystemMessage(content=system_content),
            HumanMessage(content=human_content)
        ]
        chain = self.llm | self.parser
        return await chain.ainvoke(messages)


# 3. 페르소나 대표 이미지 생성 클래스 (Gemini로 교체)
class ImageGenerator:
    def __init__(self, openai_api_key):
        self.llm = ChatOpenAI(
            model="gpt-5-mini",
            api_key=openai_api_key,
            temperature=0.7,
        )
        # Gemini 클라이언트 (GOOGLE_API_KEY 환경변수 자동 참조)
        self.gemini_client = genai.Client()

    async def generate_profile_prompt(self, report, user_pref):
        prompt_msg = (
            "다음 조건을 반영한 인물 프로필 이미지 생성용 영어 프롬프트를 작성하세요.\n\n"
            f"[페르소나 정체성]\n"
            f"- 핵심 요약: {report['summary']}\n"
            f"- 스타일 성향: {report['traits']}\n"
            f"- 색상 팔레트: {report['color_palette']}\n\n"
            f"[분위기 & 스타일 참고] (mood·tone·lighting·환경 설정을 반영할 것)\n"
            f"{user_pref}\n\n"
            "### 반드시 지켜야 할 규칙 ###\n"
            "1. 구도: 반드시 얼굴+어깨만 나오는 bust shot 또는 head shot. 전신·반신·광각은 절대 사용하지 말 것.\n"
            "2. 분위기·조명: 위 '분위기 & 스타일 참고'에 명시된 채도, 명도, 조명, 환경(실내/실외), 분위기 설정을 반드시 반영할 것.\n"
            "3. 색감: 위 색상 팔레트의 HEX 컬러들이 배경·조명·피부 톤·소품에 자연스럽게 녹아들도록 할 것. 옷 색으로 직접 표현하지 말 것.\n"
            "4. 스타일: 20대 한국인 인플루언서가 SNS에 올릴 법한 자연스럽고 세련된 인물 사진. 인위적이거나 과도하게 보정된 느낌 없이, 실제 사진처럼 자연스러워야 함.\n"
            "5. 얼굴: 입력된 인물의 얼굴을 유지할 것.\n"
        )
        res = await self.llm.ainvoke(prompt_msg)
        return res.content.strip()

    async def download_image_as_pil(self, image_url: str) -> Image.Image:
        """URL에서 이미지를 다운로드해 PIL Image로 반환"""
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url)
            if response.status_code == 200:
                return Image.open(io.BytesIO(response.content))
            else:
                raise ValueError(f"유저 이미지 다운로드 실패: {response.status_code}")

    def generate_persona_image(self, prompt: str, user_pil_image: Image.Image) -> str | None:
        """
        Gemini로 유저 얼굴을 유지한 채 새 이미지를 생성하고,
        로컬에 임시 저장 후 경로를 반환합니다.
        """
        try:
            print("🎨 Gemini로 페르소나 이미지를 생성하고 있습니다...")
            response = self.gemini_client.models.generate_content(
                model="gemini-3.1-flash-image-preview",
                contents=[
                    prompt,
                    user_pil_image,
                ],
                config=types.GenerateContentConfig(
                    response_modalities=['TEXT', 'IMAGE'],
                    image_config=types.ImageConfig(
                        aspect_ratio="1:1",
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
                    print(f"✅ Gemini 이미지 임시 저장: {temp_path}")
                    return temp_path  # S3 업로드용 로컬 경로 반환

            print("⚠️ Gemini 응답에 이미지가 없습니다.")
            return None

        except Exception as e:
            print(f"이미지 생성 에러: {e}")
            return None


# 4. 통합 분석 파이프라인
class PersonaPipeline:
    def __init__(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        dotenv_path = os.path.join(parent_dir, '.env')
        load_dotenv(dotenv_path)

        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError(f"API 키 로드 실패! 경로 확인: {dotenv_path}")

        self.analyzer = PersonaAnalyzer(self.api_key)
        self.generator = ImageGenerator(self.api_key)

    def _build_base_prompt(self, answers, tones):
        framing_map = {
            1: "tightly framed extreme close-up focusing on expressive eyes and skin texture",
            2: "cinematic bust shot, focusing on upper body and jewelry",
            3: "half-body shot, natural pose with arms slightly in frame",
            4: "full-body shot, standing naturally, capturing the outfit and silhouette",
            5: "wide cinematic shot, person harmonized with the vast background environment"
        }

        env = "at a trendy outdoor cafe in Seoul or a sun-drenched street" if answers.get('q1_environment') == 1 \
              else "inside a minimalist, aesthetically pleasing studio or a modern interior with soft window light"

        density = "clean minimalist background, focus strictly on the subject" if answers.get('q3_minimal_maximal') == 1 \
                  else "richly detailed environment with plants, books, and sophisticated props"

        mood_str = "bright, airy, and high-key lighting with a fresh feel" if answers.get('q4_mood') == 1 \
                   else "moody, calm, and slightly dark cinematic atmosphere"
        contrast_str = "with deep shadows and striking highlights" if answers.get('q5_contrast_type') == 1 \
                       else "with soft, low-contrast, and dreamy transitions"

        s_val, v_val, c_val, t_val = tones

        if s_val > 80: saturation = "vibrant, highly saturated colors, popping tones"
        elif s_val < 30: saturation = "muted, desaturated, almost pastel-like color palette"
        else: saturation = "natural color balance, realistic saturation"

        if v_val > 80: brightness = "bright, overexposed aesthetic, high-key lighting"
        elif v_val < 30: brightness = "underexposed, low-key lighting, dark and mysterious"
        else: brightness = "well-lit, balanced exposure"

        if c_val > 80: contrast = "extreme contrast, deep black shadows and bright highlights"
        elif c_val < 30: contrast = "soft, low contrast, hazy and dreamy look"
        else: contrast = "standard cinematic contrast"

        if t_val > 70: temp = "warm golden hour glow, amber and orange tint"
        elif t_val < 30: temp = "cool blue hour tint, icy and crisp atmosphere"
        else: temp = "neutral daylight white balance"

        return (
            f"{framing_map.get(answers.get('q7_framing'), 'portrait')}, {env}, {saturation}, {brightness}, {contrast}, {temp}. "
            f"{density}, {mood_str}, {contrast_str}, {temp}. "
            f"Overall visual style matches these specific attributes: "
            f"Saturation level {s_val}/100, Brightness {v_val}/100, Contrast {c_val}/100."
        )

    async def run_e2e_test(self, audio_url, image_url, answers, tones):
        # 0. 음성 분석 & 외모 분석
        voice_kwd = await self.analyzer.get_voice_keywords_from_url(audio_url)
        img_base64 = await self.analyzer.get_image_bytes_from_url(image_url)
        total_impression = await self.analyzer.analyze_total_impression(img_base64, voice_kwd)

        # 1. 설문 답변 → 선호 텍스트로 변환
        user_pref_description = self._build_base_prompt(answers, tones)

        # 2. 페르소나 리포트 생성
        persona_report = await self.analyzer.analyze(voice_kwd, total_impression, user_pref_description)

        # 3. 이미지 생성 프롬프트 도출
        final_image_prompt = await self.generator.generate_profile_prompt(persona_report, user_pref_description)

        # 4. 유저 이미지 PIL로 다운로드
        print("⬇️ 유저 얼굴 이미지 다운로드 중...")
        user_pil_image = await self.generator.download_image_as_pil(image_url)

        # 5. Gemini로 이미지 생성 → 로컬 임시 경로 반환
        temp_image_path = self.generator.generate_persona_image(final_image_prompt, user_pil_image)

        # ✅ 6. S3 업로드를 여기서 처리 (__main__ 밖으로 이동)
        final_s3_url = None
        if temp_image_path and os.path.exists(temp_image_path):
            try:
                uploader = CloudUploader()
                ts = int(time.time())
                unique_name = f"persona_{ts}.png"
                final_s3_url = uploader.upload_to_s3(temp_image_path, unique_name)
                os.remove(temp_image_path)
            except Exception as e:
                print(f"❌ S3 업로드 오류: {e}")

        return {
            "report": persona_report,
            "image_url": final_s3_url  # ✅ app.py의 result.get('image_url')과 키 일치
        }

# 5. 클라우드 업로더
class CloudUploader:
    def __init__(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        dotenv_path = os.path.join(parent_dir, '.env')
        load_dotenv(dotenv_path)

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

    def upload_to_s3(self, local_file_path, file_name):
        clean_path = self.base_path.strip("/")
        s3_key = f"{clean_path}/{file_name}" if clean_path else file_name

        try:
            print(f"📤 S3 업로드 중: {s3_key}...")
            self.s3.upload_file(
                local_file_path,
                self.bucket_name,
                s3_key,
                ExtraArgs={'ContentType': "image/png"}
            )
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

    test_audio = os.getenv("TEST_AUDIO_URL")
    test_image = os.getenv("TEST_IMAGE_URL")

    test_answers = {"q1_environment": 1, "q2_style": 2, "q3_minimal_maximal": 1, "q4_mood": 1, "q5_contrast_type": 2, "q6_motion": 1, "q7_framing": 3}
    test_tones = [34, 73, 36, 72]

    result = asyncio.run(pipeline.run_e2e_test(test_audio, test_image, test_answers, test_tones))

    # ✅ 'temp_image_path' → 'image_url'로 변경 (S3 업로드는 run_e2e_test 내부에서 완료됨)
    final_response = {
        "persona_report": result['report'],
        "image_url": result['image_url']  # ✅ 키 이름 변경
    }

    with open("persona_result.json", "w", encoding="utf-8") as f:
        json.dump(final_response, f, ensure_ascii=False, indent=4)

    print("✅ 최종 리포트가 'persona_result.json'으로 저장되었습니다.")
    print(f"🔗 최종 S3 링크: {result['image_url']}")  # ✅ 키 이름 변경