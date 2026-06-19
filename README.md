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

<br>

---

## 📑 목차
- [📁 소스 코드](#-source-code)
  - [💻 Frontend](#-frontend)
  - [🧩 Backend](#-backend)
  - [🤖 AI](#-ai)
- [🚀 실행 및 배포 가이드](#-실행-및-배포-가이드)
  - [🧩 Backend / DB 구축 및 실행](#-backend-db-구축-및-실행)
  - [🤖 AI 서버 실행](#-ai-서버-실행)
  - [💻 Frontend 실행](#-frontend-실행)
  - [🐳 Docker Compose 실행](#-전체-docker-compose-실행)
  - [☁️ 배포](#️-배포)
- [🔑 테스트 계정](#-테스트-계정)
- [⚠️ Trouble Shooting](#️-trouble-shooting)

<br>

---

<br>

## 📁 Source Code

### 💻 Frontend

#### 🗂️ 프로젝트 구조

```
FE/
├── api/
│   └── [...path].ts                    # Vercel 배포 환경 API 프록시
├── public/
│   ├── fonts/                          # 서비스 전용 폰트
│   ├── images/                         # 정적 이미지 리소스
│   └── models/
│       └── face_landmarker.task        # 이미지 입력 검증용 MediaPipe 모델
├── src/
│   ├── App.tsx                         # 라우팅 및 전체 앱 진입 컴포넌트
│   ├── main.tsx                        # React 렌더링 진입점
│   ├── lib/
│   │   ├── api.ts                      # 공통 API 요청 유틸
│   │   ├── auth.ts                     # 인증 정보 저장/삭제 유틸
│   │   └── errorToastService.ts        # API 오류 토스트 처리
│   ├── features/
│   │   ├── auth/                       # 로그인, 회원가입, 비밀번호 찾기
│   │   ├── diagnosis/                  # 페르소나 진단 플로우
│   │   ├── persona/                    # 페르소나 목록, 상세, 저장 컨텐츠
│   │   ├── content/                    # 페르소나 기반 콘텐츠 생성/조회
│   │   ├── admin/                      # 관리자 콘솔
│   │   ├── home/                       # 홈 화면, 배너, 공지
│   │   ├── notice/                     # 공지사항 조회
│   │   ├── settings/                   # 설정 화면
│   │   └── support/                    # 도움말 화면
│   ├── shared/
│   │   ├── layout/                     # 공통 상단바, 하단 탭, 메뉴
│   │   ├── ui/                         # 공통 UI 컴포넌트
│   │   ├── icons/                      # 서비스 아이콘
│   │   └── lib/                        # 파일 보안 검증 등 공통 유틸
│   ├── styles/
│   │   └── globals.css                 # 전역 스타일
│   └── types/
│       └── figma.d.ts                  # Figma asset 타입 선언
├── Dockerfile                          # FE 컨테이너 실행 설정
├── vite.config.ts                      # Vite 개발 서버 및 proxy 설정
├── vercel.json                         # Vercel SPA routing/API proxy 설정
├── tailwind.config.js                  # Tailwind CSS 설정
└── package.json                        # 의존성 및 실행 스크립트
```

<br>

#### 🧩 주요 모듈 설명

##### 🔐 Auth 모듈

회원가입, 로그인, 비밀번호 찾기 화면을 제공하고 세션 스토리지 기반 인증 상태를 관리합니다.

| 파일/폴더 | 역할 |
|----------|------|
| `features/auth/pages/LoginPage.tsx` | 로그인 화면 |
| `features/auth/pages/SignupPage.tsx` | 회원가입 화면 |
| `features/auth/pages/ForgotPasswordPage.tsx` | 비밀번호 찾기 화면 |
| `features/auth/hooks/useAuthState.ts` | 로그인 상태 확인 훅 |
| `lib/auth.ts` | 인증 정보 저장 및 삭제 유틸 |

##### 🎭 Diagnosis 모듈

이미지, 음성, 취향 테스트 입력을 받아 페르소나 진단을 진행하고 결과 화면으로 연결합니다.

| 파일/폴더 | 역할 |
|----------|------|
| `features/diagnosis/pages/DiagnosisStartPage.tsx` | 진단 시작 화면 |
| `features/diagnosis/pages/ImageInputPage.tsx` | 이미지 업로드 및 얼굴 검증 |
| `features/diagnosis/pages/VoiceInputPage.tsx` | 음성 녹음 및 업로드 |
| `features/diagnosis/pages/PreferenceTestPage.tsx` | 취향 테스트 |
| `features/diagnosis/pages/AnalyzingPage.tsx` | AI 분석 진행 화면 |
| `features/diagnosis/pages/DiagnosisResultPage.tsx` | 페르소나 진단 결과 화면 |
| `features/diagnosis/lib/progressApi.ts` | SSE 기반 진행률 수신 |
| `features/diagnosis/lib/faceLandmarkCheck.ts` | MediaPipe 기반 얼굴 검증 |

##### 🖼️ Persona / Content 모듈

진단된 페르소나를 조회·저장하고, 페르소나 또는 레퍼런스를 기반으로 AI 콘텐츠를 생성합니다.

| 파일/폴더 | 역할 |
|----------|------|
| `features/persona/pages/PersonaListPage.tsx` | 저장된 페르소나 목록 |
| `features/persona/pages/PersonaDetailPage.tsx` | 페르소나 상세 |
| `features/persona/pages/PersonaSavedContentsPage.tsx` | 페르소나별 저장 콘텐츠 |
| `features/content/pages/ContentExplorePage.tsx` | 콘텐츠 생성 진입 및 레퍼런스 탐색 |
| `features/content/pages/ContentSelectPersonaPage.tsx` | 콘텐츠 생성용 페르소나 선택 |
| `features/content/pages/ContentGeneratingPage.tsx` | 콘텐츠 생성 진행 화면 |
| `features/content/pages/ContentResultPage.tsx` | 생성 콘텐츠 결과 화면 |
| `features/content/lib/contentApi.ts` | 콘텐츠 생성/조회/삭제 API |
| `features/content/lib/referenceApi.ts` | 레퍼런스 조회/좋아요 API |

##### 🛠️ Admin 모듈

관리자 권한으로 서비스 통계, 회원, 공지사항, 레퍼런스를 관리합니다.

| 파일/폴더 | 역할 |
|----------|------|
| `features/admin/pages/AdminConsolePage.tsx` | 관리자 콘솔 화면 |
| `features/admin/lib/dashboardApi.ts` | 대시보드 통계 API |
| `features/admin/lib/memberAdminApi.ts` | 회원 관리 API |
| `features/admin/lib/noticeApi.ts` | 공지사항 관리 API |
| `features/admin/lib/referenceAdminApi.ts` | 레퍼런스 관리 API |

##### 🧱 Shared / API 모듈

앱 전반에서 사용하는 공통 UI, 레이아웃, API 요청 로직을 관리합니다.

| 파일/폴더 | 역할 |
|----------|------|
| `shared/layout` | 상단바, 하단 탭, 햄버거 메뉴 |
| `shared/ui` | 버튼, 다이얼로그, 입력창 등 공통 UI |
| `shared/lib/fileSecurity.ts` | 업로드 파일 검증 |
| `lib/api.ts` | 공통 fetch wrapper 및 인증 헤더 처리 |
| `api/[...path].ts` | Vercel 배포 환경 API 프록시 |

---

<br>

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

<br>

-----
### 🤖 AI

#### 🗂️ 프로젝트 구조

```
AI/
├── core/
│   ├── app.py                   # FastAPI 진입점, 3개 엔드포인트 정의
│   ├── audio_analysis.py        # 음성 분석 (피치/에너지 추출 → 분위기 키워드)
│   ├── base_generator.py        # 이미지 생성 공통 베이스 클래스 (프롬프트/생성/크롭/업로드)
│   ├── image_crop.py            # MediaPipe 포즈 기반 스마트 크롭 좌표 계산
│   ├── image_generation.py      # 페르소나 진단 기반 프로필 이미지 생성 (1:1)
│   ├── persona_pipeline.py      # 음성+이미지+설문 통합 페르소나 진단 파이프라인
│   ├── trend_setter.py          # 트렌드 레퍼런스 기반 콘텐츠 생성 (4:5)
│   └── pose_landmarker_heavy.task   # MediaPipe Pose 모델 파일
└── tests/                       # PoC 단계 기술 검증 스크립트 (로컬 경로 직접 참조)
```

<br>

#### 🧩 주요 모듈 설명

##### 🎙️ Audio 분석 모듈 — `audio_analysis.py`

사용자 음성 파일에서 음향 특징을 추출하고, 이를 LLM에 전달해 청각적 인상 키워드로 변환합니다.

| 함수 | 역할 |
|------|------|
| `harmonic()` | pyAudioAnalysis 원본 로직을 기반으로 프레임별 harmonic ratio와 pitch(F0)를 직접 계산 |
| `analyze_audio()` | `ShortTermFeatures.feature_extraction`으로 50ms 윈도우 / 25ms 스텝 기준 단구간 특징 추출, 여기에 harmonic ratio·pitch·delta pitch를 추가하여 ZCR, Energy, Spectral Entropy, MFCC, Pitch 등 핵심 특징의 평균·표준편차를 JSON으로 반환 |
| `generate_voice_keywords()` | 분석된 수치 데이터를 GPT-5-mini(temperature 0.7)에 전달, 음성학/심리학 전문가 역할의 system prompt로 톤·발화 강약을 해석해 **긍정적 인상 키워드 3개** 생성 |

**핵심 로직**: 단순 라이브러리 호출이 아니라, pitch와 harmonic ratio를 프레임 단위로 직접 계산해 ShortTermFeatures 결과에 수동으로 병합하는 방식을 사용합니다.

<br>

##### 🖼️ Image Crop 모듈 — `image_crop.py`

MediaPipe Pose Landmarker로 검출한 신체 랜드마크를 기반으로, 규격별(프로필/포스트/스토리) 스마트 크롭 좌표를 계산합니다.

| 함수 | 역할 |
|------|------|
| `download_image_from_url()` | URL에서 이미지를 받아 OpenCV(BGR) 포맷으로 변환 |
| `run_pose_visualization()` | 포즈 검출 → 랜드마크 시각화 → 3가지 비율(1:1 / 4:5 / 9:16) 크롭 동시 수행 및 결과 저장 (단독 테스트/디버깅용) |
| `image_crop()` | **핵심 알고리즘.** 랜드마크 좌표로부터 크롭 영역을 계산 |

**`image_crop()` 동작 방식**:
- 크롭의 가로 중심은 머리·어깨 랜드마크(인덱스 0~12)만 사용 — 하반신이 비대칭으로 잡혀도 중심이 흔들리지 않도록 설계
- 모드별 줌 배율과 눈높이 배치 비율이 다름

  | mode | zoom_factor | eye_pos_ratio | 기준 |
  |------|:---:|:---:|------|
  | `Profile` (1:1) | 5 | 0.4 | 얼굴 랜드마크(0~10) 높이 |
  | `Post` (4:5) | 1.6 | 0.3 | 전신 높이 |
  | `Story` (9:16) | 2.0 | 0.25 | 전신 높이 |

- 어깨 중심과 코 위치 차이(`face_offset`)로 인물이 바라보는 방향을 추정해, 크롭 중심을 좌/우로 살짝 보정(0.4 또는 0.6)함으로써 여백의 균형을 맞춤
- 양 눈 랜드마크 각도로 기울기(`angle`)도 함께 반환

<br>

##### 🧱 Base Generator 모듈 — `base_generator.py`

`ImageGeneration`(프로필 생성)과 `ContentGeneration`(트렌드 생성)이 공유하는 공통 로직을 담은 베이스 클래스입니다.

| 메서드 | 역할 |
|--------|------|
| `__init__()` | OpenAI(GPT-5-mini), Gemini 클라이언트, S3 클라이언트, MediaPipe PoseLandmarker를 한 번에 초기화 |
| `_get_framing()` | 설문 `q7_framing` 값(1~5)을 클로즈업~광각 5단계 영문 프레이밍 문구로 매핑 |
| `_build_base_prompt()` | 설문 답변(`q1~q7`)과 톤 슬라이더(`q8_tone`: 채도/명도/대비/색온도)를 조합해 촬영 환경·스타일·조명·색감을 영문으로 서술하는 기본 프롬프트 생성 |
| `download_image_as_pil()` | 유저 이미지 URL → PIL Image 비동기 다운로드 |
| `_resize_for_gemini()` | Gemini 503 에러 방지를 위해 참조 이미지를 1024px 이하로 리사이즈 |
| `generate_persona_image()` | **Gemini(`gemini-3.1-flash-image-preview`)로 이미지 생성.** 얼굴 보존 프롬프트 + 본문 프롬프트 + 텍스트/워터마크 금지 네거티브 프롬프트를 결합, 503/timeout 발생 시 5초·15초·30초 간격으로 최대 3회 재시도 |
| `apply_smart_crop()` | 생성된 이미지에 MediaPipe Pose를 다시 적용해 `image_crop()` 호출, 포즈 미검출 시 `_center_crop()`으로 폴백 |
| `upload_cv2_to_s3()` | 크롭된 이미지를 PNG로 인코딩해 `generated_personas/` 경로에 S3 업로드 |

**설계 의도**: `_gemini_aspect_ratio` 클래스 변수만 서브클래스에서 오버라이드하면 프롬프트 생성 로직을 제외한 생성·크롭·업로드 파이프라인 전체를 그대로 재사용할 수 있도록 설계되어 있습니다.

<br>

##### 🎭 Persona Pipeline 모듈 — `persona_pipeline.py`

음성·이미지·설문 데이터를 통합 분석해 페르소나 리포트를 생성하는 **핵심 파이프라인**입니다. `/diagnose-persona` 엔드포인트의 실제 구현체입니다.

| 클래스 | 역할 |
|--------|------|
| `PersonaReport` (Pydantic Model) | LLM 출력 구조 정의 — `name`(페르소나명), `color_palette`(HEX 5개), `summary`, `traits`(3~5문장 성향 분석), `keywords`(5개, 서로 다른 5개 차원에서 1개씩) |
| `PersonaAnalyzer` | 음성 분석 결과 호출, 이미지+음성 종합 인상 분석, 최종 JSON 리포트 생성을 담당 |
| `ImageGenerator` | 리포트 기반 대표 이미지(bust shot 고정) 프롬프트 생성 및 Gemini 호출 — `base_generator`와 별도로 자체 구현된 클래스 |
| `PersonaPipeline` | 전체 진단 흐름을 조율하는 오케스트레이터, SSE 진행률 알림(`_notify`) 포함 |
| `CloudUploader` | 로컬 임시 파일을 S3에 업로드 (persona_pipeline 전용, `AWS_PATH` 환경변수로 경로 지정) |

**`run_e2e_test()` 처리 흐름** (진행률 알림 단계 포함):

```
1. 음성 다운로드 → 음성 분석 키워드 추출        (progress 15%)
2. 사용자 이미지 다운로드                        (progress 25%)
3. 이미지 + 음성 키워드 종합 인상 분석 (GPT-5-mini, Vision)   (progress 40%)
4. 설문 답변 → 선호 스타일 텍스트 변환
5. 최종 페르소나 리포트 생성 (PersonaReport 구조로 파싱)      (progress 60%)
6. 리포트 기반 이미지 생성 프롬프트 작성                      (progress 70%)
7. Gemini로 페르소나 이미지 생성 (얼굴 보존 적용)              (progress 85%)
8. S3 업로드 후 임시 파일 삭제                                (progress 100%)
```

**`PersonaAnalyzer.analyze_total_impression()`**: 외모에서 읽히는 인상과 음성 키워드가 일치하면 "신뢰감·일관성"으로, 차이가 있으면 "반전 매력·입체적 페르소나"로 해석하도록 프롬프트가 설계되어 있어, 두 데이터가 어떤 조합이든 항상 긍정적인 해석을 도출합니다.

<br>

##### 🖼️ Image Generation 모듈 — `image_generation.py`

`base_generator.BaseContentGenerator`를 상속해, 진단된 페르소나를 기반으로 **프로필용 이미지(1:1)**를 생성합니다. `/generate-content` 엔드포인트의 실제 구현체입니다.

| 클래스/메서드 | 역할 |
|------|------|
| `ImageGeneration` | `_gemini_aspect_ratio = "1:1"` 고정 |
| `generate_profile_prompt()` | 페르소나 리포트(`name`, `keywords`, `color_palette`)와 설문 기반 스타일을 결합해 GPT-5-mini로 최종 영문 이미지 생성 프롬프트 작성. 촬영 환경(아이폰 캐주얼 vs 소니 스튜디오)에 따라 카메라 디스크립션을 다르게 적용 |

<br>

##### 🔥 Trend Setter 모듈 — `trend_setter.py`

`base_generator.BaseContentGenerator`를 상속해, BE에서 전달받은 트렌드 컨셉과 사용자 페르소나를 결합한 이미지를 생성합니다. `/generate-trend-content` 엔드포인트의 실제 구현체입니다.

| 클래스/메서드 | 역할 |
|------|------|
| `ContentGeneration` | `_gemini_aspect_ratio = "4:5"` 고정 (인스타 포스트 기본 비율) |
| `generate_profile_prompt()` | BE가 전달한 트렌드 텍스트를 **기본 골자로 우선 반영**하면서, 사용자의 페르소나·취향·구도 선택을 결합하는 프롬프트를 GPT-5-mini로 작성. 얼굴 보존 지시문을 프롬프트 내에 명시적으로 재차 포함하도록 강제 |

`image_generation.py`와의 차이는 **트렌드 컨셉이라는 외부 입력이 프롬프트의 1순위 기준이 된다는 점**과, 출력 비율이 4:5라는 점입니다.

<br>

##### 🚪 FastAPI 진입점 — `app.py`

서버 시작 시 `PersonaPipeline`, `ImageGeneration`, `ContentGeneration` 인스턴스를 미리 생성해두어 요청마다 모델 재초기화 비용이 발생하지 않도록 합니다.

| Method | Endpoint | 요청 모델 | 설명 |
|--------|----------|-----------|------|
| POST | `/diagnose-persona` | `DiagnosisRequest` | 음성·이미지·설문 답변을 받아 `PersonaPipeline.run_e2e_test()` 호출, 페르소나 리포트와 대표 이미지 URL 반환 |
| POST | `/generate-content` | `ContentCreateRequest` | 진단 리포트를 받아 프로필용 이미지 생성 → 스마트 크롭 → S3 업로드 |
| POST | `/generate-trend-content` | `TrendContentRequest` | 트렌드 프롬프트 + 진단 리포트를 결합해 이미지 생성 → 스마트 크롭 → S3 업로드 |

**`/generate-content`, `/generate-trend-content` 공통 처리 흐름**:

```
1. 프롬프트 생성 (LLM)
2. user_image_url → PIL Image 다운로드
3. Gemini 이미지 생성 (얼굴 보존 + 네거티브 프롬프트, 503 시 최대 3회 재시도)
4. crop_type(0/1/2)에 따른 크롭 설정 결정
5. MediaPipe 포즈 기반 스마트 크롭
6. S3 업로드 후 URL 반환
```

**`crop_type` 매핑**:

| crop_type | ratio | mode | 용도 |
|:---:|:---:|------|------|
| 0 | 1.0 | Profile | 프로필(1:1) |
| 1 | 0.8 | Post | 피드(4:5) — 기본값 |
| 2 | 0.5625 | Story | 스토리(9:16) |

<br>

#### 📡 AI 서버 엔드포인트 상세 스펙

모든 엔드포인트는 비동기(`async def`)로 처리되며, 예외 발생 시 `500` 상태 코드와 함께 에러 메시지를 반환합니다.

##### `POST /diagnose-persona`

```jsonc
// Request
{
  "answers": { "q1_environment": 1, "q2_style": 2, "...": "..." },
  "q8_tone": [34, 73, 36, 72],       // [채도, 명도, 대비, 색온도] 0~100
  "images": "https://.../userData/images/sample.jpg",
  "voice": "https://.../userData/voices/sample.wav",
  "session_id": "optional-sse-session-id"
}

// Response
{
  "status": "success",
  "report": {
    "name": "맑은 자연 산책자",
    "color_palette": ["#F7E3E0", "#EBEBEB", "..."],
    "summary": "...",
    "traits": "...",
    "keywords": ["...", "...", "...", "...", "..."]
  },
  "image_url": "https://persona-capstone.s3.ap-northeast-2.amazonaws.com/..."
}
```

##### `POST /generate-content`

```jsonc
// Request
{
  "report": { /* PersonaReport와 동일 구조 */ },
  "answers": { "...": "..." },
  "q8_tone": [34, 73, 36, 72],
  "user_image_url": "https://...",
  "crop_type": 1   // 0:Profile / 1:Post / 2:Story
}

// Response
{
  "status": "success",
  "generated_image_url": "https://persona-capstone.s3.../generated_personas/persona_gen_....png",
  "used_prompt": "Camera framing: ... (생성에 사용된 최종 영문 프롬프트)"
}
```

##### `POST /generate-trend-content`

```jsonc
// Request
{
  "trend_prompt": "BE에서 전달하는 트렌드 컨셉 텍스트",
  "report": { /* PersonaReport와 동일 구조 */ },
  "answers": { "...": "..." },
  "q8_tone": [34, 23, 56, 34],
  "user_image_url": "https://...",
  "crop_type": 2
}

// Response
{
  "status": "success",
  "generated_image_url": "https://persona-capstone.s3.../generated_personas/trend_gen_....png",
  "used_prompt": "Camera framing: ..."
}
```

<br>

#### 🔄 AI 파이프라인 전체 흐름

```
[페르소나 진단]  POST /diagnose-persona
  음성(URL) ──┐
              ├─▶ audio_analysis.py ──▶ 음성 키워드 3개 (GPT-5-mini)
  이미지(URL) ─┤
              ├─▶ Vision 종합 인상 분석 (GPT-5-mini)
  설문 답변 ───┘
              ▼
   persona_pipeline.PersonaAnalyzer.analyze()
              ▼
   PersonaReport (name / color_palette / summary / traits / keywords)
              ▼
   ImageGenerator → Gemini 이미지 생성 (bust shot, 얼굴 보존) → S3 업로드
              ▼
   { report, image_url } 반환


[콘텐츠 생성]  POST /generate-content | /generate-trend-content
   PersonaReport + 설문 + (트렌드 텍스트, 선택) 
              ▼
   base_generator._build_base_prompt() → LLM 프롬프트 정제 (GPT-5-mini)
              ▼
   Gemini(gemini-3.1-flash-image-preview) 이미지 생성
   (얼굴 보존 프롬프트 + 네거티브 프롬프트, 503 시 최대 3회 재시도)
              ▼
   image_crop.py: MediaPipe Pose 기반 스마트 크롭 (1:1 / 4:5 / 9:16)
              ▼
   S3 업로드 → generated_image_url 반환
```

<br>

#### 🧰 AI 모듈에서 사용하는 외부 모델/서비스

| 구분 | 사용처 | 비고 |
|------|--------|------|
| GPT-5-mini (OpenAI) | 음성 키워드 추출, 종합 인상 분석, 페르소나 리포트 생성, 이미지 프롬프트 정제 | `ChatOpenAI`, temperature 0.7 |
| Gemini `gemini-3.1-flash-image-preview` | 최종 페르소나/콘텐츠 이미지 생성 | 얼굴 보존 + 텍스트/워터마크 금지 프롬프트 고정 적용, 503 에러 시 지수적 재시도 |
| pyAudioAnalysis | 음성 피치·에너지·하모닉 비율 등 단구간 특징 추출 | harmonic/pitch는 라이브러리 함수를 가져와 직접 프레임 단위로 재계산 |
| MediaPipe Pose Landmarker (`pose_landmarker_heavy.task`) | 인물 포즈 랜드마크 검출 → 스마트 크롭 좌표 계산 | 얼굴 랜드마크(0~10)는 Profile 모드, 전신 랜드마크는 Post/Story 모드에 사용 |
| AWS S3 (`boto3`) | 생성된 이미지 영구 저장 | `generated_personas/` 경로, `AWS_PATH` 환경변수로 진단용 경로 별도 지정 가능 |

<br>

<br><br>

---

# 🚀 실행 및 배포 가이드

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

### 💻 BE 로컬 실행

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

<br><br>


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

#### 🧪 AI 모듈 단독 테스트 (서버 연결 X)

> S3 · DB 등 공통 인프라 환경변수 설정은 **BE 환경변수 설정(.env) 파트 참고**

`AI/core` 의 각 핵심 모듈은 `if __name__ == "__main__":` 테스트 블록을 내장하고 있어, BE 서버나 AI FastAPI 서버(`app.py`)를 띄우지 않고도 모듈 단위로 동작을 검증할 수 있습니다.

##### 0. 가상환경 활성화

이미 위 "AI 서버 실행" 단계에서 가상환경을 만들었다면 활성화만 하면 됩니다. 아직 없다면 새로 생성합니다.

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

> 라이브러리가 이미 설치되어 있다면 생략 가능합니다. 처음 세팅하는 경우 위쪽 "라이브러리 설치" 항목의 `pip install` 명령들을 먼저 실행하세요.

##### 사전 준비

`AI/.env` 에 아래 값이 설정되어 있어야 합니다.

```env
OPENAI_API_KEY=...
AWS_ACCESS_KEY=...
AWS_SECRET_KEY=...
AWS_REGION=ap-northeast-2
AWS_BUCKET=...

# 모듈 단독 테스트용 (S3에 업로드된 샘플 이미지/음성 URL)
TEST_IMAGE_URL=https://.../userData/images/sample.jpg
TEST_AUDIO_URL=https://.../userData/voices/sample.wav
```

##### 모듈별 테스트 방법

| 모듈 | 실행 명령 | 확인 내용 |
|------|-----------|-----------|
| 음성 분석 | `python core/audio_analysis.py` | 음성 피치·에너지 분석 후 분위기 키워드 추출 (기본값은 로컬 `./data/raw/음성1.wav` 사용, 다른 파일로 테스트하려면 코드 내 `audio` 경로 수정) |
| 얼굴/포즈 분석 · 스마트 크롭 | `python core/image_crop.py` | `TEST_IMAGE_URL` 이미지로 포즈 랜드마크 추출 및 크롭 좌표 계산 |
| 페르소나 진단 파이프라인 | `python core/persona_pipeline.py` | 음성+이미지+설문 답변을 통합 분석해 리포트 생성 → `persona_result.json` 으로 저장, S3 업로드 결과 URL 콘솔 출력 |
| 기본 이미지 콘텐츠 생성 | `python core/image_generation.py` | 리포트 기반 프롬프트 생성 → Gemini 이미지 생성 → 스마트 크롭 → S3 업로드 전체 흐름 (파일 하단 `user_input_selection` 값으로 0:1:1 / 1:4:5 / 2:9:16 규격 전환) |
| 트렌드 기반 콘텐츠 생성 | `python core/trend_setter.py` | 트렌드 프롬프트 + 페르소나 리포트를 결합한 이미지 생성 (파일 내 `trend_concept` 문자열을 원하는 프롬프트로 교체해 테스트) |

각 명령은 `AI/core` 디렉토리에서 가상환경을 활성화한 뒤 실행합니다.

```bash
cd AI/core
python audio_analysis.py
```

##### FastAPI 서버만 단독 기동해서 확인하기

BE 없이 AI 서버 엔드포인트만 직접 호출해보고 싶다면:

```bash
cd AI/core
uvicorn app:app --reload --port 8000
```

Swagger UI(`http://localhost:8000/docs`)에서 `/diagnose-persona`, `/generate-content`, `/generate-trend-content` 를 직접 호출해 응답을 확인할 수 있습니다.

> ⚠️ `AI/tests` 폴더의 스크립트(`face_detection.py`, `pose_detection_test.py`, `semantic_segmenation_test.py`, `color_palette_test.py`, `pyaudio_analysis_test.py`, `face_swap.py`)는 모델 채택 전 기술 검증(PoC) 단계에서 작성된 코드로, 로컬 이미지 경로(`data/raw/...`)를 직접 참조합니다. 실제 서비스 흐름과 동일한 테스트는 `core/` 모듈을 사용하세요.

---

<br><br>

## 💻 Frontend 실행

FE는 React + Vite 기반입니다.

### 패키지 설치

```bash
cd FE
npm install
```

의존성 버전을 `package-lock.json`과 완전히 동일하게 맞춰 재현해야 하는 경우에는 아래 명령어를 사용할 수 있습니다.

```bash
npm ci
```

### 환경변수 설정

로컬 개발 시 `FE/.env.local` 파일을 생성합니다.

```bash
copy .env.example .env.local
```

macOS/Linux 환경에서는 다음 명령어를 사용합니다.

```bash
cp .env.example .env.local
```

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

Vercel 프로젝트 설정은 FE 폴더를 기준으로 합니다.

```text
Root Directory: FE
Build Command: npm run build
Output Directory: build
```

```bash
cd FE
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

AWS_ACCESS_KEY=AWS_ACCESS_KEY
AWS_SECRET_KEY=AWS_SECRET_KEY
AWS_REGION=ap-northeast-2
AWS_BUCKET=persona-capstone
AWS_PATH=ai-result

BE_BASE_URL=https://백엔드_배포_주소
```

## 🔄 배포 서버 관리 (pm2)

> EC2 인스턴스 자체의 Docker / Parameter Store 배포 절차는 **BE EC2 배포 파트 참고**. 여기서는 EC2에서 pm2로 상시 구동 중인 AI(FastAPI) 프로세스의 운영 방법만 다룹니다.

### 서버 접속

```bash
ssh -i "(키 경로)" ubuntu@(공개 IP)
cd AI
source venv/bin/activate
```

### 코드 갱신

```bash
git pull origin AI
```

### 코드 변경 후 동작 확인 (선택)

서버에 반영하기 전, 변경된 파이프라인이 정상 동작하는지 먼저 단독으로 실행해 확인합니다.

```bash
python3 persona_pipeline.py
```

### pm2로 서버 재시작

코드를 받아온 뒤에는 pm2로 등록된 프로세스를 재시작해야 변경 사항이 반영됩니다.

```bash
pm2 restart triangle-ai-api
```

> 최초 1회 등록 이후에는 `python3 app.py` 로 직접 실행할 필요 없이, pm2가 백그라운드에서 프로세스를 계속 관리합니다.

### 상태 확인

```bash
pm2 list     # 등록된 프로세스 목록 및 online/stopped 상태 확인
pm2 logs     # 실시간 로그 확인 — 재시작 후 에러 여부는 여기서 가장 먼저 확인
```

<br><br>

---


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



    ```
    # openai API Key (팀장에게 문의)
    OPENAI_API_KEY="여기에 실제 API 키를 입력"
    ```

