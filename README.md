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

## 📈 erd
<img width="1630" height="1182" alt="Person_a (3)" src="https://github.com/user-attachments/assets/e901c6b2-32a4-448f-8f9d-b491cee982c6" />


---

## 📁 Source Code

### 💻 Frontend

### 🧩 Backend

#### 🗂️ 프로젝트 구조
 
```
persona/
├── src/main/java/com/a/persona/
│   ├── PersonaApplication.java          # 애플리케이션 진입점
│   ├── app/
│   │   ├── controller/                  # REST 컨트롤러 및 요청/응답 payload
│   │   │   ├── auth/                    # 인증 (회원가입, 로그인, 이메일 인증)
│   │   │   ├── member/                  # 회원 정보 관리
│   │   │   ├── persona/                 # 페르소나 진단 및 CRUD
│   │   │   ├── content/                 # AI 생성 컨텐츠 관리
│   │   │   ├── reference/               # 트렌드 레퍼런스 컨텐츠
│   │   │   ├── notice/                  # 공지사항
│   │   │   ├── progress/                # SSE 기반 AI 진행상황 스트리밍
│   │   │   └── admin/                   # 관리자 전용 (회원/공지/레퍼런스/대시보드)
│   │   └── model/
│   │       ├── auth/                    # 인증 서비스, JWT 토큰, 블랙리스트
│   │       ├── member/                  # 회원 엔티티 및 서비스
│   │       ├── persona/                 # 페르소나 엔티티, 생성 서비스, AI 대기열
│   │       ├── content/                 # 컨텐츠 엔티티, 생성 서비스
│   │       ├── reference/               # 레퍼런스 엔티티 및 서비스
│   │       ├── notice/                  # 공지사항 엔티티 및 서비스
│   │       ├── progress/                # SSE Emitter 레포지토리
│   │       ├── dashboard/               # 관리자 통계 서비스
│   │       ├── contentLog/              # 컨텐츠 생성 로그
│   │       ├── personaLog/              # 페르소나 진단 로그
│   │       ├── loginLog/                # 로그인 로그
│   │       └── common/
│   │           └── BaseEntity.java      # 공통 엔티티 (id, createdAt 등)
│   └── infra/
│       ├── auth/jwt/                    # JWT 생성/검증 필터, 쿠키
│       ├── config/                      # Security, Async, S3, QueryDSL, Feign, Redis 설정
│       ├── feign/                       # AI 서버 OpenFeign 클라이언트
│       ├── s3/                          # AWS S3 파일 업로드 매니저
│       ├── error/                       # 전역 예외 핸들러 및 커스텀 예외
│       ├── response/                    # 공통 API 응답 포맷 (CommonApiResponse)
│       ├── mail/                        # 이메일 템플릿 (Thymeleaf)
│       └── nanoid/                      # 페르소나 공유 코드 생성기
├── src/main/resources/
│   ├── application.properties           # 공통 설정 (프로파일: prod)
│   ├── application-local.properties     # 로컬 설정 (.env import 포함)
│   └── application-prod.properties      # 운영 설정
├── .env                                 # 환경변수 파일 (직접 생성 필요)
├── Dockerfile                           # Docker 이미지 빌드 정의
└── build.gradle                         # 의존성 및 빌드 설정
```
 
<br>

#### 🧩 주요 모듈 설명
 
##### 👤 Member / Auth 모듈
 
회원 가입·로그인·정보 수정 등 사용자 계정을 관리하고, JWT 기반 인증을 처리합니다.
 
| 클래스 | 역할 |
|--------|------|
| `AuthService` | 로그인/로그아웃, 토큰 발급 |
| `JwtTokenProvider` | JWT 생성·검증 |
| `JwtAuthenticationFilter` | 요청마다 토큰 검증 필터 |
| `RefreshTokenService` | Redis에 Refresh Token 저장·관리 |
| `MemberService` | 회원 조회·수정·탈퇴 |
| `MailService` | 이메일 인증 코드 발송 (Gmail SMTP) |
 
##### 🎭 Persona 모듈
 
사용자의 답변을 AI 서버로 전달해 페르소나를 진단하고, 결과를 저장·공유합니다.
 
| 클래스 | 역할 |
|--------|------|
| `PersonaController` | 페르소나 진단 요청 수신, 조회·수정·삭제 |
| `PersonaCreationService` | AI 서버에 비동기 진단 요청 후 결과 저장 |
| `AiWaitingQueueService` | AI 서버 동시 요청 수 제어 (대기열) |
| `ProgressService` | SSE로 FE에 진단 진행률 스트리밍 |
| `Persona` (Entity) | 페르소나 정보 (이름, 키워드, 컬러, 공유코드 등) |
 
##### 🖼️ Content / Reference 모듈
 
페르소나 또는 트렌드 레퍼런스를 기반으로 AI 이미지 컨텐츠를 생성하고 관리합니다.
 
| 클래스 | 역할 |
|--------|------|
| `ContentCreationService` | AI 서버에 비동기 이미지 생성 요청 후 S3 저장 |
| `ContentService` | 컨텐츠 조회·북마크·삭제 |
| `ReferenceService` | 트렌드 레퍼런스 조회·좋아요 |
| `ReferenceCreationService` | 레퍼런스 기반 컨텐츠 생성 |
| `Content` (Entity) | 생성된 이미지 (타입: SQUARE / FEED / STORY) |
| `AmazonS3Manager` | S3 파일 업로드 처리 |

 
<br>
#### 📡 주요 API 엔드포인트
 
모든 엔드포인트 기본 경로: `/api/v1`
 
##### 인증 (Auth)
 
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/signup` | 회원가입 |
| POST | `/signin` | 로그인 |
| POST | `/check` | 이메일·닉네임 중복 확인 |
| POST | `/check-email` | 이메일 인증 코드 발송 |
| POST | `/verify-code` | 이메일 인증 코드 검증 |
 
##### 회원 (Member)
 
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/member` | 내 정보 조회 |
| PATCH | `/member` | 회원 정보 수정 |
| PATCH | `/member/password` | 비밀번호 변경 |
| PATCH | `/member/email` | 이메일 변경 |
| DELETE | `/member` | 회원 탈퇴 |
 
##### 🎭 페르소나 (Persona)
 
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/persona` | 페르소나 진단 요청 (AI, 비동기) |
| GET | `/persona` | 내 페르소나 목록 조회 |
| PATCH | `/persona/save-new` | 진단 결과 저장 |
| PATCH | `/persona/save-share` | 공유받은 페르소나 저장 |
| PATCH | `/persona` | 페르소나 정보 수정 |
| DELETE | `/persona` | 페르소나 삭제 |
 
##### 🖼️ 컨텐츠 (Content)
 
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/content` | AI 이미지 컨텐츠 생성 (비동기) |
| GET | `/content` | 컨텐츠 목록 조회 |
| PATCH | `/content` | 컨텐츠 북마크 |
| DELETE | `/content/{id}` | 컨텐츠 삭제 |
 
##### 🔥 레퍼런스 (Reference)
 
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/reference` | 트렌드 레퍼런스 조회 |
| POST | `/reference` | 레퍼런스 기반 컨텐츠 생성 (비동기) |
| PATCH | `/reference` | 레퍼런스 북마크 |
 
##### 📡 진행상황 (Progress · SSE)
 
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/progress/{sessionId}` | AI 생성 진행률 실시간 수신 (SSE) |
 
##### 📢 공지사항 (Notice)
 
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/notice` | 공지사항 목록 조회 |
| GET | `/notice/pinned` | 고정 공지사항 조회 |
 

### 🤖 AI 


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

## 🧩 Backend, DB 구축 및 실행

### 📋 사전 요구사항

로컬에서 프로젝트를 실행하기 전, 아래 항목이 준비되어 있어야 합니다.

| 항목 | 비고 |
|------|------|
| Java 21 | |
| IDE | Spring Boot 실행 가능한 환경 |
| Supabase 계정 | DB 관리 |
| AWS 계정 | S3 스토리지 |
| Redis 계정 | 토큰 및 대기열 관리 |
| Docker 계정 | 서버 배포 |
| Gmail 계정 | 이메일 인증 발송 |
| AI 서버 엔드포인트 URL | |

<br>

### 🔑 환경변수 설정 (`.env`)

프로젝트 루트 디렉토리에 `.env` 파일을 생성합니다. 내용은 다음과 같습니다.

```env
APP_DOMAIN=
APP_DOMAIN_ONLY=

# ───────────────────────────────────────────
# Database
# ───────────────────────────────────────────
DATABASE_URL=jdbc:postgresql://...
DATABASE_USER=your_db_username
DATABASE_PASSWORD=your_db_password

# ───────────────────────────────────────────
# Redis
# ───────────────────────────────────────────
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password

# ───────────────────────────────────────────
# JWT
# ───────────────────────────────────────────
JWT_SECRET=your_jwt_secret_key_here

# ───────────────────────────────────────────
# Email (SMTP)
# ───────────────────────────────────────────
EMAIL_NAME=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# ───────────────────────────────────────────
# AWS
# ───────────────────────────────────────────
AWS_ACCESS_KEY=your_aws_access_key_id
AWS_SECRET_KEY=your_aws_secret_access_key

# ───────────────────────────────────────────
# AI Server
# ───────────────────────────────────────────
AI_SERVER=http://your-ai-server-endpoint
```

<br>

#### 1. Supabase (PostgreSQL)

1. [Supabase](https://supabase.com/) 로그인
2. **New Organization** 선택 → Free Plan으로 생성
3. 새 DB 생성 (⚠️ 설정한 DB Password를 반드시 기록해두세요)
4. 상단 **Connect** → **Direct** 선택
   - Connection Method : `Session Pooler`
   - Type : `JDBC`
5. Connection String 복사 후 아래와 같이 BE의 .env 파일에 입력

```env
DATABASE_URL=jdbc:postgresql://(주소):(port)/postgres
DATABASE_USER=postgres.(영문코드)
DATABASE_PASSWORD=(설정한 password)
```

<br>

#### 2. AWS S3

1. AWS 로그인 후 **S3** 탭으로 이동
2. **버킷 생성** 시작
   - 버킷 이름 : `persona-capstone`
   - 리전 : `ap-northeast-2`
   - ACL : 비활성화
   - 퍼블릭 액세스 차단 : **미선택**
   - 버킷 버전 관리 : 비활성화 (비용 무관하면 활성화)
   - 기본 암호화 : `SSE-S3` / 버킷 키 활성화
3. 생성한 버킷 → **권한** → **버킷 정책** → 편집 후 아래 내용 입력

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::persona-capstone/*"
        }
    ]
}
```

4. 버킷 내 폴더 구조 생성

```
root
├── generated_personas
├── reference
└── userData
    ├── images
    ├── profile
    └── voices
```

5. **AWS IAM** → 자격 증명 탭 → 액세스 키 만들기 (CSV 파일로 보관 권장) 아래와 같이 BE의 .env 파일에 입력

```env
AWS_ACCESS_KEY=(생성한 액세스 키 ID)
AWS_SECRET_KEY=(생성한 비밀 액세스 키)
```

<br>

#### 3. Redis

1. Redis 무료 DB 생성
2. **Connect to Database** → **Redis CLI** 탭에서 아래 형식의 커맨드 확인

```bash
redis-cli -u redis://default:(password)@(redis_host):(port)
```
3. 아래와 같이 BE의 .env 파일에 입력

```env
REDIS_HOST=(redis_host)
REDIS_PASSWORD=(password)
REDIS_PORT=(port)
```
<br>

#### 4. JWT Secret

40자 이상의 영문 대소문자 + 숫자 조합 문자열을 자유롭게 설정하세요.

```env
JWT_SECRET=your_jwt_secret_key_here
```


#### 5. Email (Gmail SMTP)

1. [Google 앱 비밀번호](https://myaccount.google.com/apppasswords) 접속 (2차 인증 필수)
2. 앱 이름 자유롭게 설정 후 생성 → 발급된 비밀번호 기록

```env
EMAIL_NAME=(로그인한 구글 계정 이메일)
EMAIL_PASSWORD=(발급된 앱 비밀번호)
```

<br>

#### 6. AI Server

AI 서버가 배포된 주소를 입력합니다.

```env
AI_SERVER=http://your-ai-server-endpoint
```

<br>

#### 7. APP_DOMAIN

BE 서버 실행 후 서버 주소를 입력합니다.

```env
APP_DOMAIN=(https:// 포함한 전체 주소)
APP_DOMAIN_ONLY=(https:// 제외한 주소)
```

<br>

### 💻 로컬 실행

#### IDE로 실행 (IntelliJ 기준)

1. 프로젝트 루트에 `.env` 파일 생성 (환경변수 설정 참고)
2. `Run` → `Edit Configurations` → `Active profiles` 에 `local` 입력
3. `application.properties` 에서 아래와 같이 수정

```properties
spring.profiles.active=local
```

4. `PersonaApplication.java` 우클릭 → **Run** 실행

#### 터미널로 실행

```bash
./gradlew bootRun --args='--spring.profiles.active=local'
```

> BE 서버는 `http://localhost:8080`에서 실행됩니다.
> 
> Supabase에 테이블과 더미 데이터가 정상 생성되었는지 확인하세요.
> 
> 📖 Swagger UI: http://localhost:8080/swagger-ui/index.html

<br>

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

BE는 Docker 이미지로 배포할 수 있습니다.
BE 폴더 내 터미널에서 아래 명령어를 순서대로 실행합니다.

```bash
docker login
./gradlew clean build -x test
docker build -t (DockerID)/(레포지토리명) .
docker push (DockerID)/(레포지토리명)
```

#### ☁️ EC2 배포

##### Parameter Store로 환경변수 관리 (무료 Secret Manager 대체)

1. AWS Parameter Store → 파라미터 생성
   - 이름 자유 설정
   - 유형 : **보안 문자열**
   - 데이터 형식 : `text`
   - 값 : `.env` 내용 전체 붙여넣기

##### EC2 인스턴스에서 실행

```bash
docker login
docker pull (DockerID)/(레포지토리명)

# Parameter Store에서 env 파일 가져오기
aws ssm get-parameter \
  --name "(파라미터스토어 이름)" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text > .env

# 컨테이너 실행
sudo docker run -d -p 8080:8080 \
  --env-file .env \
  --name (컨테이너명) \
  (DockerID)/(레포지토리명)
```

> 💡 FE 서버와의 원활한 통신을 위해 **HTTPS** 설정을 권장합니다.


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
>
> BE 서버를 로컬로 실행한 경우, supabase에 해당 데이터가 반영되어 있습니다.
>
> 그렇지 않은 경우 starter.sql 파일 내의 sql문을 사용하여 직접 추가해주세요.

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
