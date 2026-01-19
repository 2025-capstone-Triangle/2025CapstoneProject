## 🛠️ 프로젝트 환경 설정 가이드

### 1\. 가상 환경 설정 (Virtual Environment Setup)

  * **Python 버전 확인:** Python 버전이 **3.11 미만**인지 확인하고 가상 환경을 생성
  * **가상 환경 생성 (Windows/Linux/macOS):**
    ```bash
    python -m venv .venv
    ```
  * **가상 환경 활성화 (Windows):**
    ```bash
    .venv\Scripts\activate
    ```
  * **가상 환경 활성화 (Linux/macOS):**
    ```bash
    source .venv/bin/activate
    ```
    > 터미널 프롬프트 앞에 `(.venv)`가 나타나면 활성화 완료

-----

### 2\. 필수 라이브러리 설치

활성화된 가상 환경에서 다음 라이브러리 그룹을 설치합니다.

#### A. `pyAudioAnalysis` 관련 라이브러리

음성 분석 및 처리를 위한 핵심 라이브러리입니다.

```bash
pip install pyAudioAnalysis
pip install numpy
pip install pydub
pip install scipy
pip install tqdm
pip install eyed3
```

#### B. `LangChain` 및 Google GenAI 관련 라이브러리

AI 모델 연동 및 환경 변수 관리를 위한 라이브러리입니다.

```bash
pip install python-dotenv


pip install -U langchain


pip install -U langchain-google-genai
```


#### C. `SemanticSegmentation` 관련 라이브러리

포즈 추적 및 구도 추천을 위한 라이브러리입니다.

```bash
pip install mediapipe
```

-----

### 3\. API 키 설정 (LangChain 연동)

Google Gemini API를 사용하기 위해 환경 변수 파일(`.env`)을 설정

1.  **`.env` 파일 생성:** 프로젝트의 **AI 폴더** 내에 `.env` 파일을 생성

2.  **API 키 문의 및 입력:** `.env` 파일 내에 다음 형식으로 **팀장에게 문의한 API Key**를 입력

    ```
    # Gemini API Key (팀장에게 문의)
    GEMINI_API_KEY="여기에 실제 API 키를 입력"
    ```