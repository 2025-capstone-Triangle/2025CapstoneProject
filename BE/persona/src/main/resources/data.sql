-- 1. ROLE_USER (일반 사용자) 2명 생성
-- 비밀번호 'user123'
INSERT INTO member (id, username, password, email, role, birth, sex, is_creator, created_at, updated_at, is_active,status)
VALUES
    (nextval('member_sequence'), 'user01', '{bcrypt}$2a$10$QQfcyom9v7jOr4/4OjnC/.UcP1k7TtAjEwNvj4D7yaPb26Q0NUstC', 'user01@example.com', 'ROLE_USER', '2001-05-15', 'FEMALE', true, now(), now(), true,'ACTIVE'),
    (nextval('member_sequence'), 'user02', '{bcrypt}$2a$10$QQfcyom9v7jOr4/4OjnC/.UcP1k7TtAjEwNvj4D7yaPb26Q0NUstC', 'user02@example.com', 'ROLE_USER', '2000-11-20', 'FEMALE', false, now(), now(), true,'ACTIVE');

-- 2. ROLE_ADMIN (관리자) 2명 생성
-- 비밀번호 'admin123'
INSERT INTO member (id, username, password, email, role, birth, sex, is_creator, created_at, updated_at, is_active, status)
VALUES
    (nextval('member_sequence'), 'admin', '{bcrypt}$2a$10$OemF88kjqHcEo4jvSGqbKOejC/xK4Ff00LwycraTQCPEv/80JeKpm', 'admin01@example.com', 'ROLE_ADMIN', '2002-03-10', 'FEMALE', true, now(), now(), true,'ACTIVE'),
    (nextval('member_sequence'), 'admin1', '{bcrypt}$$2a$10$OemF88kjqHcEo4jvSGqbKOejC/xK4Ff00LwycraTQCPEv/80JeKpm', 'admin02@persona.com', 'ROLE_ADMIN', '1995-01-01', 'MALE', false, now(), now(), true,'ACTIVE');

-- 10000번 멤버를 위한 취향 설정
INSERT INTO preference (id, q1_environment, q2_style, q3_minimal_maximal, q4_mood, q5_contrast_type, q6_motion, q7_framing)
VALUES (nextval('persona_preference_sequence'), 1, 2, 1, 1, 1, 2, 1);

-- 10001번 멤버를 위한 취향 설정
INSERT INTO preference (id, q1_environment, q2_style, q3_minimal_maximal, q4_mood, q5_contrast_type, q6_motion, q7_framing)
VALUES (nextval('persona_preference_sequence'), 2, 1, 2, 1, 2, 1, 2);

-- Preference의 ElementCollection (q8_tone) 데이터
INSERT INTO q8_tone (preference_id, q8_tone) VALUES (10000, 43), (10000, 43),(10000, 43),(10000, 43);
INSERT INTO q8_tone (preference_id, q8_tone) VALUES (10001, 24), (10001, 24),(10001, 24),(10001, 24);

-- 10000번 멤버의 두 번째 페르소나 취향 설정
INSERT INTO preference (id, q1_environment, q2_style, q3_minimal_maximal, q4_mood, q5_contrast_type, q6_motion, q7_framing)
VALUES (nextval('persona_preference_sequence'), 2, 1, 1, 2, 2, 1, 1);

-- Preference의 ElementCollection (q8_tone) 데이터 (뉴트럴/파스텔 톤 설정)
INSERT INTO q8_tone (preference_id, q8_tone) VALUES (10002, 67), (10002, 67),(10002, 67),(10002, 67);

-- 10000번 멤버의 페르소나
INSERT INTO persona (id, name, profile, member_id, preference_id, is_saved, code, summary, traits, thumbnail, created_at, updated_at,is_active)
VALUES (nextval('persona_sequence'), '미니멀리스트 탐험가', '단순함을 추구하면서도 새로운 환경을 즐기는 페르소나입니다.', 10000, 10000, true, 'aaaaaaaaaa', '심플한 라이프스타일 요약', '성실함, 창의적', 'https://example.com/thumb1.jpg', NOW(), NOW(),true);

-- 10001번 멤버의 페르소나
INSERT INTO persona (id, name, profile, member_id, preference_id, is_saved, code, summary, traits, thumbnail, created_at, updated_at,is_active)
VALUES (nextval('persona_sequence'), '맥시멀 아티스트', '다채로운 색감과 화려한 무드를 선호하는 예술가 타입입니다.', 10001, 10001, true, 'bbbbbbbbbb', '화려한 예술적 감각 요약', '감성적, 자유로움', 'https://example.com/thumb2.jpg', NOW(), NOW(),true);

-- 10000번 멤버의 '디지털 브랜딩 전문가' 페르소나
INSERT INTO persona (id, name, profile, member_id, preference_id, is_saved, code, summary, traits, thumbnail, created_at, updated_at,is_active)
VALUES (nextval('persona_sequence'), '트렌디 비주얼라이저', 'MZ세대의 디지털 아이덴티티를 시각화하고 온-오프라인의 경계를 허무는 브랜딩 전문가 페르소나입니다.', 10000, 10002, true, 'cccccccccc', '멀티모달 AI 기반의 시각적 정체성 탐구', '분석적, 트렌디함, 창의적', 'https://example.com/branding_thumb.png', NOW(), NOW(),true);

-- 10000번 페르소나의 키워드 및 색상
INSERT INTO persona_keywords (persona_id, keyword) VALUES (10000, 'Minimal'), (10000, 'Nature');
INSERT INTO persona_colors (persona_id, color) VALUES (10000, '#FFFFFF'), (10000, '#000000');

-- 10001번 페르소나의 키워드 및 색상
INSERT INTO persona_keywords (persona_id, keyword) VALUES (10001, 'Vivid'), (10001, 'Dynamic');
INSERT INTO persona_colors (persona_id, color) VALUES (10001, '#FF5733'), (10001, '#C70039');

-- 10002번 페르소나의 키워드
INSERT INTO persona_keywords (persona_id, keyword) VALUES (10002, 'Digital Identity'), (10002, 'MZ Generation'), (10002, 'Multi-modal AI'), (10002, 'Triangle Motif');

-- 10002번 페르소나의 핵심 색상 (브랜딩용 포인트 컬러)
INSERT INTO persona_colors (persona_id, color) VALUES (10002, '#6200EE'), (10002, '#03DAC6'), (10002, '#BB86FC');

-- 1. 미니멀 기하학 스타일 (삼각형 모티프 강조)
INSERT INTO reference (id, name, img, prompt, description, created_at, updated_at,is_active)
VALUES (nextval('reference_sequence'), '피자', 'https://persona-capstone.s3.ap-northeast-2.amazonaws.com/reference/pizza.png',
        'Abstract 3D composition of glowing triangles, minimalist layout, soft pastel gradients, glassmorphism style, high resolution',
        '기하학적 도형을 활용하여 깔끔하고 세련된 디지털 이미지를 구축할 때 적합한 레퍼런스입니다.', NOW(), NOW(),true);

-- 2. 사이버펑크 네온 스타일 (MZ 트렌드 반영)
INSERT INTO reference (id, name, img, prompt, description, created_at, updated_at,is_active)
VALUES (nextval('reference_sequence'), '벚꽃', 'https://persona-capstone.s3.ap-northeast-2.amazonaws.com/reference/spring.jpg',
        'Cyberpunk style portrait, holographic texture, vibrant neon purple and cyan lighting, glitch effect, futuristic digital identity',
        '강렬한 개성과 에너지를 표현하고 싶은 사용자를 위한 화려한 스타일 가이드입니다.', NOW(), NOW(),true);

-- 3. 따뜻한 3D 캐릭터 스타일 (친근한 브랜딩)
INSERT INTO reference (id, name, img, prompt, description, created_at, updated_at,is_active)
VALUES (nextval('reference_sequence'), '뭐였더라', 'https://persona-capstone.s3.ap-northeast-2.amazonaws.com/reference/KakaoTalk_20260416_145510176.png',
        'Cute 3D clay character, rounded shapes, soft studio lighting, friendly expression, matte texture, pastel background',
        '부드럽고 친근한 인상을 주는 캐릭터 기반 브랜딩을 위한 레퍼런스입니다.', NOW(), NOW(),true);

-- 4. 감성적인 아날로그 텍스처 (Y2K/레트로 트렌드)
INSERT INTO reference (id, name, img, prompt, description, created_at, updated_at)
VALUES (nextval('reference_sequence'), 'Y2K 레트로 비주얼', 'https://capstone-project-persona.s3.ap-northeast-2.amazonaws.com/reference/Gemini_Generated_Image_wnjxqiwnjxqiwnjx.png',
        '90s anime style, grainy film texture, lo-fi aesthetic, nostalgic colors, dreamy atmosphere, digital illustration',
        '최근 유행하는 레트로하고 감성적인 정체성을 시각화하는 데 최적화된 프롬프트 구성을 제공합니다.', NOW(), NOW());