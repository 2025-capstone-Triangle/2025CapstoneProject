# Person:A

> 	퍼스널 브랜딩이 어려운 20대 여성 초보 크리에이터를 위한 생성형 AI 기반 SNS 페르소나 진단 및 업로드용 이미지 컨텐츠 생성 웹 서비스
>
> \- 이화여자대학교 캡스톤디자인창업프로젝트 7팀 我 -

## 📌 프로젝트 소개

<div>
  <h3>퍼스널 브랜딩이 어려운 20대 여성 초보 크리에이터를 위한 생성형 AI 기반 SNS 페르소나 진단 및 업로드용 이미지 컨텐츠 생성 웹 서비스</h3>
  <p>
    Person:我는 얼굴 사진, 목소리, 선호 설문 데이터를 통합 분석해 나만의 온라인 페르소나를 진단하고, 그 결과를 인스타그램에 바로 올릴 수 있는 이미지 콘텐츠로 자동 생성해주는 웹 서비스입니다.

"내 분위기가 뭔지는 알겠는데 어떻게 표현해야 할지 모르겠어"

"매번 피드 분위기가 달라서 고민이야"

"프롬프트 없이 나만의 사진을 만들고 싶어"

이런 고민을 가진 초보 크리에이터를 위해, 진단 → 해석 → 생성 → 활용의 전 과정을 하나의 흐름으로 연결합니다.
  </p>
</div>

## 🧑‍💻 팀원 소개

<div align="center">

<table>
  <tbody>
    <tr>
      <td align="center"><b>강민서</b></td>
      <td align="center"><b>김서현</b></td>
      <td align="center"><b>이소이</b></td>
    </tr>
    <tr>
      <td align="center"><a href="https://github.com/childstone"><img src="https://github.com/childstone.png" width="100px;" alt="강민서"/></a></td>
      <td align="center"><a href="https://github.com/Kseeo"><img src="https://github.com/Kseeo.png" width="100px;" alt="김서현"/></a></td>
      <td align="center"><a href="https://github.com/islena0331"><img src="https://github.com/islena0331.png" width="100px;" alt="이소이"/></a></td>
    </tr>
    <tr>
      <td align="center"><sub><b>Team leader / Backend</b></sub></td>
      <td align="center"><sub><b>AI</b></sub></td>
      <td align="center"><sub><b>Frontend</b></sub></td>
    </tr>
    <tr>
      <td align="center"><a href="https://github.com/childstone"><sub><b>@childstone</b></sub></a></td>
      <td align="center"><a href="https://github.com/Kseeo"><sub><b>@Kseeo</b></sub></a></td>
      <td align="center"><a href="https://github.com/islena0331"><sub><b>@islena0331</b></sub></a></td>
    </tr>
  </tbody>
</table>
</div>

## ✨ 주요 기능
 
### 1. 페르소나 종합 리포트
세 가지 데이터를 통합 분석해 나만의 온라인 페르소나를 도출합니다.
 
- 🎙️ **음성 분석** — 목소리의 피치, 에너지, 발화 강약 등을 분석해 분위기 키워드 추출
- 🖼️ **얼굴 이미지 분석** — MediaPipe 랜드마크 기반으로 시각적 인상과 스타일 해석
- 📋 **선호 설문** — 색감, 무드, 구도, 분위기 등 8가지 취향 데이터 수집
결과는 **페르소나명 · 컬러 팔레트 · 핵심 키워드 · 스타일 해설**을 담은 종합 리포트로 제공됩니다.
 
### 2. AI 이미지 콘텐츠 생성
리포트에서 도출된 페르소나를 바탕으로 SNS 업로드용 이미지를 자동 생성합니다.
 
- 🤳 얼굴 동일성을 유지한 채 페르소나 컨셉이 반영된 고품질 이미지 생성
- 📐 프로필(1:1) · 피드(4:5) · 스토리(9:16) 세 가지 규격 자동 후처리
- 🔥 트렌드 레퍼런스와 내 페르소나를 결합한 확장형 콘텐츠 생성 지원
 

## 🛠️ 기술 스택
 
| 구분 | 기술 |
|------|------|
| Frontend | <img src="https://img.shields.io/badge/React-00DBFF?style=for-the-badge&logo=react&logoColor=white" /> <img src="https://img.shields.io/badge/Vite-8957ED?style=for-the-badge&logo=vite&logoColor=white" /> <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" /> |
| Backend | <img src="https://img.shields.io/badge/SpringBoot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" /> <img src="https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white" /> <img src="https://img.shields.io/badge/Spring_JWT-6DB33F?style=for-the-badge&logo=spring&logoColor=white" /> <img src="https://img.shields.io/badge/Spring_Data_JPA-6DB33F?style=for-the-badge&logo=spring&logoColor=white" /> <img src="https://img.shields.io/badge/QueryDSL-0096C7?style=for-the-badge&logo=querydsl&logoColor=white" /> |
| AI Server | <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" /> <img src="https://img.shields.io/badge/pyAudioAnalysis-FF6B6B?style=for-the-badge&logo=python&logoColor=white" /> <img src="https://img.shields.io/badge/MediaPipe-0097A7?style=for-the-badge&logo=google&logoColor=white" /> <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" /> <img src="https://img.shields.io/badge/OpenAI_GPT-412991?style=for-the-badge&logo=openai&logoColor=white" /> <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" /> |
| DB / Storage | <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" /> <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" /> <img src="https://img.shields.io/badge/Amazon_S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white" /> |
| Infra | <img src="https://img.shields.io/badge/Amazon_EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white" /> <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" /> |

---

## 🧩 Source Code

- FE
- BE
- AI


---

## 🚀 실행 및 배포 가이드

아래 내용은 FE, BE, AI 모듈이 모두 병합된 최종 결과물을 기준으로 작성되었습니다.

```text
.
├── FE/              # React + Vite
├── BE/persona/      # Spring Boot
├── AI/core/         # FastAPI
└── docker-compose.yml
```

### 실행 환경

- Node.js 20 이상
- Java 21
- Python 3.10 권장
- Docker, Docker Compose
- PostgreSQL 16
- Redis 7
- OpenAI API Key
- Google Gemini API Key
- AWS S3 접근 키
- Gmail SMTP 앱 비밀번호

### 전체 실행 순서

```text
1. PostgreSQL, Redis 실행
2. AI 서버 실행
3. BE 서버 실행
4. FE 서버 실행
5. http://localhost:3000 접속
```

서비스 연결 구조는 다음과 같습니다.

```text
FE(localhost:3000)
  -> BE(localhost:8080)
      -> AI(localhost:8000)
      -> PostgreSQL(localhost:5432)
      -> Redis(localhost:6379)
      -> AWS S3
```

## 🗄️ DB / Redis 실행

루트 디렉터리에서 실행합니다.

```bash
docker compose up -d db redis
```

기본 설정은 다음과 같습니다.

```text
POSTGRES_DB=persona
POSTGRES_USER=persona
POSTGRES_PASSWORD=persona
POSTGRES_PORT=5432
REDIS_PORT=6379
```

> 현재 BE 설정은 `spring.jpa.hibernate.ddl-auto=validate`입니다. 빈 DB에서는 테이블이 없으면 실행이 실패할 수 있으므로 초기 실행 전 DB 스키마가 준비되어 있어야 합니다.

## 🧩 Backend 실행

### 환경변수 설정

`BE/persona/.env` 파일을 생성합니다.

로컬 실행 기준:

```env
DATABASE_URL=jdbc:postgresql://localhost:5432/persona
DATABASE_USER=persona
DATABASE_PASSWORD=persona

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=충분히_긴_JWT_SECRET_값

EMAIL_NAME=이메일주소@gmail.com
EMAIL_PASSWORD=Gmail_앱_비밀번호

AWS_ACCESS_KEY=AWS_ACCESS_KEY
AWS_SECRET_KEY=AWS_SECRET_KEY

AI_SERVER=http://localhost:8000
```

Docker Compose로 BE까지 실행하는 경우:

```env
DATABASE_URL=jdbc:postgresql://db:5432/persona
DATABASE_USER=persona
DATABASE_PASSWORD=persona

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=충분히_긴_JWT_SECRET_값

EMAIL_NAME=이메일주소@gmail.com
EMAIL_PASSWORD=Gmail_앱_비밀번호

AWS_ACCESS_KEY=AWS_ACCESS_KEY
AWS_SECRET_KEY=AWS_SECRET_KEY

AI_SERVER=http://host.docker.internal:8000
```

### 로컬 실행

```bash
cd BE/persona
```

Windows:

```bash
gradlew.bat bootRun --args="--spring.profiles.active=local"
```

macOS/Linux:

```bash
./gradlew bootRun --args='--spring.profiles.active=local'
```

BE 서버는 `http://localhost:8080`에서 실행됩니다.

Swagger 문서는 아래 주소에서 확인할 수 있습니다.

```text
http://localhost:8080/swagger-ui/index.html
```

### Docker 실행

BE Dockerfile은 `build/libs/*.jar` 파일을 복사하는 방식이므로, Docker Compose 실행 전에 JAR 파일을 먼저 생성합니다.

```bash
cd BE/persona
```

Windows:

```bash
gradlew.bat clean bootJar
```

macOS/Linux:

```bash
./gradlew clean bootJar
```

루트 디렉터리로 돌아와 실행합니다.

```bash
cd ../..
docker compose up -d api
```

## 🤖 AI 서버 실행

AI 서버는 FastAPI 기반이며 기본 포트는 `8000`입니다.

### 가상환경 생성

```bash
cd AI/core
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

### 라이브러리 설치

현재 AI 모듈에는 `requirements.txt`가 없으므로 아래 패키지를 직접 설치합니다.

```bash
pip install fastapi uvicorn pydantic python-dotenv
pip install openai langchain-openai langchain-core google-genai
pip install pyAudioAnalysis numpy pydub scipy tqdm eyed3
pip install mediapipe opencv-python pillow httpx boto3
```

음성 처리 과정에서 오디오 변환이 필요한 경우 FFmpeg가 필요할 수 있습니다.

### 환경변수 설정

`AI/core/.env` 파일을 생성합니다.

```env
OPENAI_API_KEY=OPENAI_API_KEY
GOOGLE_API_KEY=GOOGLE_GEMINI_API_KEY

AWS_ACCESS_KEY=AWS_ACCESS_KEY
AWS_SECRET_KEY=AWS_SECRET_KEY
AWS_REGION=ap-northeast-2
AWS_BUCKET=persona-capstone
AWS_PATH=ai-result

BE_BASE_URL=http://localhost:8080
```

### 서버 실행

```bash
python app.py
```

또는

```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

AI 서버 주요 엔드포인트는 다음과 같습니다.

```text
POST /diagnose-persona
POST /generate-content
POST /generate-trend-content
```

## 💻 Frontend 실행

FE는 React + Vite 기반입니다.

### 패키지 설치

```bash
cd FE
npm install
```

### 환경변수 설정

로컬 개발 시 `FE/.env.local` 파일을 생성합니다.

로컬 BE 서버를 사용하는 경우:

```env
VITE_API_PROXY_TARGET=http://localhost:8080
```

배포된 BE 서버를 사용하는 경우:

```env
VITE_API_PROXY_TARGET=http://54.180.115.6:8080
```

FE 코드는 `/api/v1/...` 형태로 API를 호출합니다. 로컬에서는 Vite proxy가 `/api` 요청을 BE 서버로 전달합니다.

### 로컬 실행

```bash
npm run dev
```

FE 서버는 `http://localhost:3000`에서 실행됩니다.

### 빌드 및 린트

```bash
npm run build
npm run lint
```

빌드 결과물은 `FE/build` 폴더에 생성됩니다.

## 🐳 전체 Docker Compose 실행

루트 디렉터리의 `docker-compose.yml`은 다음 서비스를 포함합니다.

- `api`: Spring Boot BE
- `fe`: React/Vite FE
- `db`: PostgreSQL
- `redis`: Redis

AI 서버는 현재 `docker-compose.yml`에 포함되어 있지 않으므로 별도로 실행해야 합니다.

```bash
cd AI/core
uvicorn app:app --host 0.0.0.0 --port 8000
```

BE JAR 파일을 생성한 뒤 루트 디렉터리에서 실행합니다.

```bash
docker compose up --build
```

실행 후 접속 주소는 다음과 같습니다.

```text
FE: http://localhost:3000
BE: http://localhost:8080
DB: localhost:5432
Redis: localhost:6379
AI: http://localhost:8000
```

## ☁️ 배포

### FE 배포

FE는 Vercel 배포를 기준으로 설정되어 있습니다.

```bash
npm run build
```

출력 디렉터리는 `build`입니다.

현재 `FE/vercel.json`에서는 `/api/*` 요청을 배포된 BE 서버로 프록시합니다.

```text
https://2025-capstone-project.vercel.app/api/v1/reference
  -> http://54.180.115.6:8080/api/v1/reference
```

### BE 배포

BE는 Spring Boot JAR 또는 Docker 이미지로 배포할 수 있습니다.

```bash
cd BE/persona
./gradlew clean bootJar
java -jar build/libs/persona-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

운영 환경에서는 다음 환경변수가 필요합니다.

```env
APP_DOMAIN=https://백엔드_배포_주소
APP_DOMAIN_ONLY=백엔드_도메인

DATABASE_URL=jdbc:postgresql://DB_HOST:5432/persona
DATABASE_USER=DB_USER
DATABASE_PASSWORD=DB_PASSWORD

REDIS_HOST=REDIS_HOST
REDIS_PORT=6379
REDIS_PASSWORD=REDIS_PASSWORD

JWT_SECRET=충분히_긴_JWT_SECRET_값

EMAIL_NAME=이메일주소@gmail.com
EMAIL_PASSWORD=Gmail_앱_비밀번호

AWS_ACCESS_KEY=AWS_ACCESS_KEY
AWS_SECRET_KEY=AWS_SECRET_KEY

AI_SERVER=https://AI_서버_배포_주소
```

### AI 배포

AI 서버는 FastAPI 서버이므로 `uvicorn` 기반으로 배포합니다.

```bash
cd AI/core
uvicorn app:app --host 0.0.0.0 --port 8000
```

운영 환경에서는 다음 환경변수가 필요합니다.

```env
OPENAI_API_KEY=OPENAI_API_KEY
GOOGLE_API_KEY=GOOGLE_GEMINI_API_KEY

AWS_ACCESS_KEY=AWS_ACCESS_KEY
AWS_SECRET_KEY=AWS_SECRET_KEY
AWS_REGION=ap-northeast-2
AWS_BUCKET=persona-capstone
AWS_PATH=ai-result

BE_BASE_URL=https://백엔드_배포_주소
```

## 🔑 테스트 계정

초기 데이터 `BE/persona/src/main/resources/data.sql` 기준 테스트 계정은 다음과 같습니다.

일반 사용자:

```text
ID: user01
PW: user123

ID: user02
PW: user123
```

관리자:

```text
ID: admin
PW: admin123

ID: admin1
PW: admin123
```

> 현재 설정에서는 `spring.sql.init.mode=never`이므로 `data.sql`이 자동 실행되지 않습니다. 테스트 계정을 사용하려면 해당 SQL 데이터가 DB에 반영되어 있어야 합니다.

## 🧪 주요 API

BE 주요 API prefix는 `/api/v1`입니다.

```text
POST   /api/v1/signin
POST   /api/v1/signup
POST   /api/v1/check
POST   /api/v1/check-email
POST   /api/v1/verify-code

GET    /api/v1/member
POST   /api/v1/member/check
DELETE /api/v1/member

GET    /api/v1/persona
POST   /api/v1/persona
DELETE /api/v1/persona

GET    /api/v1/content
POST   /api/v1/content
DELETE /api/v1/content/{id}

GET    /api/v1/reference
POST   /api/v1/reference

GET    /api/v1/notice
GET    /api/v1/notice/pinned

GET    /api/v1/progress/{sessionId}
POST   /api/v1/progress
```

AI 서버 API:

```text
POST /diagnose-persona
POST /generate-content
POST /generate-trend-content
```

## ⚠️ Trouble Shooting

### FE에서 API 호출이 실패하는 경우

`FE/.env.local`에 API proxy target이 설정되어 있는지 확인합니다.

```env
VITE_API_PROXY_TARGET=http://localhost:8080
```

배포된 BE 서버를 사용하는 경우:

```env
VITE_API_PROXY_TARGET=http://54.180.115.6:8080
```

환경변수를 수정한 뒤 FE 개발 서버를 재시작합니다.

```bash
npm run dev
```

### Vercel 배포 환경에서 `/api` 요청이 404가 나는 경우

`FE/vercel.json`에 `/api/:path*` rewrite가 있는지 확인합니다.

```json
{
  "source": "/api/:path*",
  "destination": "http://54.180.115.6:8080/api/:path*"
}
```

### BE 실행 시 DB 오류가 나는 경우

PostgreSQL이 실행 중인지 확인합니다.

```bash
docker compose up -d db
```

`.env`의 DB 주소를 확인합니다.

로컬 실행:

```env
DATABASE_URL=jdbc:postgresql://localhost:5432/persona
```

Docker 실행:

```env
DATABASE_URL=jdbc:postgresql://db:5432/persona
```

또한 현재 JPA 설정이 `ddl-auto=validate`이므로 DB 테이블이 미리 생성되어 있어야 합니다.

### BE에서 AI 서버 호출이 실패하는 경우

AI 서버가 실행 중인지 확인합니다.

```text
http://localhost:8000
```

BE `.env`의 `AI_SERVER` 값을 확인합니다.

로컬 실행:

```env
AI_SERVER=http://localhost:8000
```

Docker 실행:

```env
AI_SERVER=http://host.docker.internal:8000
```

### 이미지 생성 또는 업로드가 실패하는 경우

다음 환경변수를 확인합니다.

```env
OPENAI_API_KEY
GOOGLE_API_KEY
AWS_ACCESS_KEY
AWS_SECRET_KEY
AWS_BUCKET
AWS_REGION
```

S3 버킷 권한과 리전이 올바른지도 확인합니다.
