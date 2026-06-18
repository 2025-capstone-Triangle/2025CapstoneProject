-- ─────────────────────────────────────────────
-- Sequences
-- ─────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS member_sequence               START WITH 10000 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS member_block_sequence         START WITH 10000 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS persona_preference_sequence   START WITH 10000 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS persona_sequence              START WITH 10000 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS reference_sequence            START WITH 10000 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS content_sequence              START WITH 10000 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS content_like_sequence         START WITH 10000 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS reference_like_sequence       START WITH 10000 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS notice_sequence               START WITH 10000 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS content_log_sequence          START WITH 10000 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS persona_log_sequence          START WITH 10000 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS login_log_sequence            START WITH 10000 INCREMENT BY 1;

-- ─────────────────────────────────────────────
-- member
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS member (
    id          BIGINT      PRIMARY KEY DEFAULT nextval('member_sequence'),
    username    VARCHAR     NOT NULL,
    password    VARCHAR     NOT NULL,
    email       VARCHAR     NOT NULL UNIQUE,
    role        VARCHAR     NOT NULL,           -- ROLE_USER | ROLE_ADMIN
    birth       DATE,
    sex         VARCHAR     NOT NULL,           -- MALE | FEMALE | ETC
    is_creator  BOOLEAN     NOT NULL,
    status      VARCHAR     DEFAULT 'ACTIVE',   -- ACTIVE | BANNED
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP,
    is_active   BOOLEAN     DEFAULT TRUE
);

-- ─────────────────────────────────────────────
-- member_block
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS member_block (
    id          BIGINT  PRIMARY KEY DEFAULT nextval('member_block_sequence'),
    member_id   BIGINT  UNIQUE REFERENCES member(id),
    reason      VARCHAR,
    blocked_at  TIMESTAMP
);

-- ─────────────────────────────────────────────
-- preference  (페르소나 취향 설문 응답)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS preference (
    id                  BIGINT  PRIMARY KEY DEFAULT nextval('persona_preference_sequence'),
    q1_environment      BIGINT  NOT NULL,
    q2_style            BIGINT  NOT NULL,
    q3_minimal_maximal  BIGINT  NOT NULL,
    q4_mood             BIGINT  NOT NULL,
    q5_contrast_type    BIGINT  NOT NULL,
    q6_motion           BIGINT  NOT NULL,
    q7_framing          BIGINT  NOT NULL
);

CREATE TABLE IF NOT EXISTS q8_tone (
    preference_id   BIGINT  REFERENCES preference(id),
    q8_tone         BIGINT
);

-- ─────────────────────────────────────────────
-- persona
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS persona (
    id              BIGINT  PRIMARY KEY DEFAULT nextval('persona_sequence'),
    name            VARCHAR NOT NULL,
    profile         TEXT    NOT NULL,
    member_id       BIGINT  REFERENCES member(id),
    preference_id   BIGINT  UNIQUE REFERENCES preference(id),
    is_saved        BOOLEAN DEFAULT FALSE,
    code            VARCHAR,
    thumbnail       TEXT,
    summary         TEXT,
    traits          TEXT,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS persona_keywords (
    persona_id  BIGINT  REFERENCES persona(id),
    keyword     VARCHAR
);

CREATE TABLE IF NOT EXISTS persona_colors (
    persona_id  BIGINT  REFERENCES persona(id),
    color       VARCHAR
);

-- ─────────────────────────────────────────────
-- reference  (트렌드 레퍼런스 컨텐츠)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reference (
    id          BIGINT  PRIMARY KEY DEFAULT nextval('reference_sequence'),
    name        VARCHAR NOT NULL,
    img         VARCHAR NOT NULL,
    prompt      VARCHAR NOT NULL,
    description VARCHAR,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP,
    is_active   BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS reference_like (
    id              BIGINT  PRIMARY KEY DEFAULT nextval('reference_like_sequence'),
    reference_id    BIGINT  REFERENCES reference(id),
    member_id       BIGINT  REFERENCES member(id)
);

-- ─────────────────────────────────────────────
-- content  (AI 생성 이미지)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content (
    id              BIGINT  PRIMARY KEY DEFAULT nextval('content_sequence'),
    persona_id      BIGINT  NOT NULL REFERENCES persona(id),
    reference_id    BIGINT  REFERENCES reference(id),
    img             VARCHAR NOT NULL,
    type            VARCHAR NOT NULL,           -- SQUARE | FEED | STORY
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS content_like (
    id          BIGINT  PRIMARY KEY DEFAULT nextval('content_like_sequence'),
    content_id  BIGINT  REFERENCES content(id)
);

-- ─────────────────────────────────────────────
-- notice
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notice (
    id          BIGINT  PRIMARY KEY DEFAULT nextval('notice_sequence'),
    title       VARCHAR NOT NULL,
    content     TEXT    NOT NULL,
    is_pinned   BOOLEAN NOT NULL,
    is_draft    BOOLEAN NOT NULL,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP,
    is_active   BOOLEAN DEFAULT TRUE
);

-- ─────────────────────────────────────────────
-- logs
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS login_log (
    id          BIGINT  PRIMARY KEY DEFAULT nextval('login_log_sequence'),
    login_time  TIMESTAMP,
    member_id   BIGINT  NOT NULL REFERENCES member(id)
);

CREATE TABLE IF NOT EXISTS persona_log (
    id              BIGINT  PRIMARY KEY DEFAULT nextval('persona_log_sequence'),
    analysis_time   TIMESTAMP,
    member_id       BIGINT  REFERENCES member(id),
    persona_id      BIGINT  NOT NULL REFERENCES persona(id)
);

CREATE TABLE IF NOT EXISTS content_log (
    id              BIGINT  PRIMARY KEY DEFAULT nextval('content_log_sequence'),
    analysis_time   TIMESTAMP,
    member_id       BIGINT  NOT NULL REFERENCES member(id),
    reference_id    BIGINT  REFERENCES reference(id)
);

-- ─────────────────────────────────────────────
-- Dummy Data
-- ─────────────────────────────────────────────

-- member: 일반 사용자 2명 (비밀번호: user123)
INSERT INTO member (id, username, password, email, role, birth, sex, is_creator, created_at, updated_at, is_active, status)
VALUES
    (nextval('member_sequence'), 'user01', '{bcrypt}$2a$10$QQfcyom9v7jOr4/4OjnC/.UcP1k7TtAjEwNvj4D7yaPb26Q0NUstC', 'user01@example.com', 'ROLE_USER', '2001-05-15', 'FEMALE', true,  now(), now(), true, 'ACTIVE'),
    (nextval('member_sequence'), 'user02', '{bcrypt}$2a$10$QQfcyom9v7jOr4/4OjnC/.UcP1k7TtAjEwNvj4D7yaPb26Q0NUstC', 'user02@example.com', 'ROLE_USER', '2000-11-20', 'FEMALE', false, now(), now(), true, 'ACTIVE');

-- member: 관리자 2명 (비밀번호: admin123)
INSERT INTO member (id, username, password, email, role, birth, sex, is_creator, created_at, updated_at, is_active, status)
VALUES
    (nextval('member_sequence'), 'admin',  '{bcrypt}$2a$10$OemF88kjqHcEo4jvSGqbKOejC/xK4Ff00LwycraTQCPEv/80JeKpm',  'admin01@example.com', 'ROLE_ADMIN', '2002-03-10', 'FEMALE', true,  now(), now(), true, 'ACTIVE'),
    (nextval('member_sequence'), 'admin1', '{bcrypt}$$2a$10$OemF88kjqHcEo4jvSGqbKOejC/xK4Ff00LwycraTQCPEv/80JeKpm', 'admin02@persona.com', 'ROLE_ADMIN', '1995-01-01', 'MALE',   false, now(), now(), true, 'ACTIVE');

-- preference: 각 페르소나별 취향 설문 응답
INSERT INTO preference (id, q1_environment, q2_style, q3_minimal_maximal, q4_mood, q5_contrast_type, q6_motion, q7_framing)
VALUES
    (nextval('persona_preference_sequence'), 1, 2, 1, 1, 1, 2, 1),
    (nextval('persona_preference_sequence'), 2, 1, 2, 1, 2, 1, 2),
    (nextval('persona_preference_sequence'), 2, 1, 1, 2, 2, 1, 1);

-- q8_tone: 각 preference의 톤 응답
INSERT INTO q8_tone (preference_id, q8_tone) VALUES (10000, 43), (10000, 43), (10000, 43), (10000, 43);
INSERT INTO q8_tone (preference_id, q8_tone) VALUES (10001, 24), (10001, 24), (10001, 24), (10001, 24);
INSERT INTO q8_tone (preference_id, q8_tone) VALUES (10002, 67), (10002, 67), (10002, 67), (10002, 67);

-- persona
INSERT INTO persona (id, name, profile, member_id, preference_id, is_saved, code, summary, traits, thumbnail, created_at, updated_at, is_active)
VALUES
    (nextval('persona_sequence'), '미니멀리스트 탐험가',  '단순함을 추구하면서도 새로운 환경을 즐기는 페르소나입니다.',                                              10000, 10000, true, 'aaaaaaaaaa', '심플한 라이프스타일 요약',               '성실함, 창의적',           'https://example.com/thumb1.jpg',         NOW(), NOW(), true),
    (nextval('persona_sequence'), '맥시멀 아티스트',      '다채로운 색감과 화려한 무드를 선호하는 예술가 타입입니다.',                                                10001, 10001, true, 'bbbbbbbbbb', '화려한 예술적 감각 요약',               '감성적, 자유로움',         'https://example.com/thumb2.jpg',         NOW(), NOW(), true),
    (nextval('persona_sequence'), '트렌디 비주얼라이저',  'MZ세대의 디지털 아이덴티티를 시각화하고 온-오프라인의 경계를 허무는 브랜딩 전문가 페르소나입니다.',        10000, 10002, true, 'cccccccccc', '멀티모달 AI 기반의 시각적 정체성 탐구',  '분석적, 트렌디함, 창의적', 'https://example.com/branding_thumb.png', NOW(), NOW(), true);

-- persona_keywords
INSERT INTO persona_keywords (persona_id, keyword) VALUES
    (10000, 'Minimal'),          (10000, 'Nature'),
    (10001, 'Vivid'),            (10001, 'Dynamic'),
    (10002, 'Digital Identity'), (10002, 'MZ Generation'), (10002, 'Multi-modal AI'), (10002, 'Triangle Motif');

-- persona_colors
INSERT INTO persona_colors (persona_id, color) VALUES
    (10000, '#FFFFFF'), (10000, '#000000'),
    (10001, '#FF5733'), (10001, '#C70039'),
    (10002, '#6200EE'), (10002, '#03DAC6'), (10002, '#BB86FC');

-- reference
INSERT INTO reference (id, name, img, prompt, description, created_at, updated_at, is_active)
VALUES
    (nextval('reference_sequence'), '야구장 관중석',
     'https://persona-capstone.s3.ap-northeast-2.amazonaws.com/reference/pizza.png',
     'Abstract 3D composition of glowing triangles, minimalist layout, soft pastel gradients, glassmorphism style, high resolution',
     '야구장 중계 카메라에 잡히다.', NOW(), NOW(), true),

    (nextval('reference_sequence'), '벚꽃',
     'https://persona-capstone.s3.ap-northeast-2.amazonaws.com/reference/spring.jpg',
     'Cyberpunk style portrait, holographic texture, vibrant neon purple and cyan lighting, glitch effect, futuristic digital identity',
     '강렬한 개성과 에너지를 표현하고 싶은 사용자를 위한 화려한 스타일 가이드입니다.', NOW(), NOW(), true),

    (nextval('reference_sequence'), '뭐였더라',
     'https://persona-capstone.s3.ap-northeast-2.amazonaws.com/reference/KakaoTalk_20260416_145510176.png',
     'Cute 3D clay character, rounded shapes, soft studio lighting, friendly expression, matte texture, pastel background',
     '부드럽고 친근한 인상을 주는 캐릭터 기반 브랜딩을 위한 레퍼런스입니다.', NOW(), NOW(), true),

    (nextval('reference_sequence'), 'Y2K 레트로 비주얼',
     'https://capstone-project-persona.s3.ap-northeast-2.amazonaws.com/reference/Gemini_Generated_Image_wnjxqiwnjxqiwnjx.png',
     '90s anime style, grainy film texture, lo-fi aesthetic, nostalgic colors, dreamy atmosphere, digital illustration',
     '최근 유행하는 레트로하고 감성적인 정체성을 시각화하는 데 최적화된 프롬프트 구성을 제공합니다.', NOW(), NOW(), true);