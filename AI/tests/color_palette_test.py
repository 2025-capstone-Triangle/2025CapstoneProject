# 선호, 이미지, 보이스 설명
from pyaudio_analysis_test import generate_voice_keywords 
# langchain
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

# 로컬 이미지를 전달하기 위한 임시 장치. 추후 S3에 사진 올리고 생성되는 링크로 사용 예정
import base64
import mimetypes

def get_base64_image_data(image_path):
    """로컬 이미지 파일을 Base64 데이터 URI 형식으로 변환합니다."""
    # 파일 확장자로부터 MIME 타입 추론
    mime_type, _ = mimetypes.guess_type(image_path)
    if mime_type is None:
        # MIME 타입 추론 실패 시 기본값 설정
        mime_type = 'image/jpeg' 
    
    with open(image_path, "rb") as image_file:
        # 파일을 읽어 Base64로 인코딩
        base64_data = base64.b64encode(image_file.read()).decode("utf-8")
    
    # 데이터 URI 형식: "data:image/jpeg;base64,..."
    return f"data:{mime_type};base64,{base64_data}"

# 컬러팔레트 생성
def generate_color_palette(voice, preference, image):
    # API key 불러오기
    load_dotenv()

    # 모델 기본 설정
    model = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash", # 추후 모델 교체 예정
        max_tokens=None,
        temperature=0.7,
        timeout=None,
        max_retries=2,
    )
    messages = [
    #프롬프트
    SystemMessage(content=
            "당신은 오디오 분석, 심리학, 시각 예술(색채 심리, 색채 조화론)을 통합하는 고도화된 AI 컬러 매핑 전문가입니다. 당신의 임무는 사용자로부터 제공된 복합적인 분석 데이터(이미지 포함)를 해석하여, 화자의 '핵심 무드(Core Mood)'를 가장 잘 대변하는 5가지에서 7가지 사이의 HEX 컬러 코드 조합 리스트를 생성하는 것입니다.\n"+
            "input은 음성 데이터: (음성 분석 텍스트) 선호 데이터 : (사용자 성격 및 선호 분석 텍스트), image_url : (이미지) 와 같이 전달됩니다.\n"+
            "[핵심 매핑 로직]\n"+
            "1.  키워드 정제 및 지표 변환:\n"+
            "     입력된 모든 키워드(성향, 음성 특징)와 이미지 시각 정보를 통합 분석하여 다음 3가지 핵심 색채 지표에 매핑되는 소수의 핵심 키워드로 단순화합니다.\n"+
            "     [이미지 분석 보강] 이미지의 주요 색상(Hue), 명암 대비(Contrast), 전반적인 분위기(Mood)를 분석하여 키워드(예: '차분한 블루', '강렬한 대비', '부드러운 조명')를 도출하고 기존 키워드와 결합하세요.\n"+
            "         Warmth/Trust (색온도): 이미지의 주요 색상(레드/오렌지/블루)과 음성 톤(MFCC)을 결합하여 색온도 범위 결정.\n"+
            "         Vibrancy/Dynamic (채도): 이미지의 채도 수준과 음성의 역동성(DELTA PITCH)을 결합하여 채도 범위 결정.\n"+
            "         Depth/Softness (명도): 이미지의 명암 대비와 음성 발성 크기(ENERGY)를 결합하여 명도 범위 결정.\n"+
            "2.  지표 추론:\n"+
            "     정제된 통합 키워드의 강도에 따라 명도(0-100), 채도(0-100), 색온도(Cool/Neutral/Warm) 범위를 추론하여 정량적으로 결정합니다.\n"+
            "3.  조화 로직 적용:\n"+
            "     추론된 지표 범위 내에서 단색, 유사색, 또는 보색 등 가장 적합한 색채 조화 이론을 적용하여 5~7가지 HEX 코드 후보 조합을 생성합니다. \n"+
            "[최종 출력 강제]\n"+
            "최종적으로, 당신은 오직 가장 조화롭다고 판단되는 5가지에서 7가지 컬러 코드가 포함된 JSON 리스트 형식만 출력해야 합니다. 어떠한 설명, 서론, 결론, 추가적인 텍스트도 포함하지 마십시오."),
    # input 데이터
    HumanMessage(
        content=[
            # 텍스트 데이터 (음성, MBTI, 키워드)
            {"type": "text", "text": "음성 데이터 : \n"+voice+"\n선호 데이터 : \n"+preference}, 
            # 이미지 데이터 (URL 사용)
            {"type": "image_url", "image_url": {"url": image}},
            ]
        )
    ]

    # LLM을 통한 답변 생성
    ai_msg = model.invoke(messages)
    # print(ai_msg.content)
    return ai_msg.content
    


if __name__ == "__main__":
    voice = generate_voice_keywords("./data/raw/음성2.wav")
    preference = "이 목소리의 인상은 ISFJ가 외부로 드러내는 특징이라기보다는, ISFJ가 자신의 내향성을 유지하면서도 타인에게 헌신하고 조화(Fe)를 달성하기 위해 후천적으로 발달시켰거나 선호하는 '표현의 무기'에 가깝습니다. 이 화자는 조용하고 차분한 외모나 태도와 달리, 대화에 들어가면 예상 밖의 섬세하고 생동감 있는 표현력으로 듣는 사람의 몰입을 유도하며, 자신의 책임감 있는 메시지를 정확하게 전달하는 '조용하지만 능숙한 설득가'의 인상을 강하게 풍깁니다."
    image = get_base64_image_data("./data/raw/image2.jpg")
    print(generate_color_palette(voice, preference, image))