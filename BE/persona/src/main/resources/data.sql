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

-- 1. Persona 기본 정보 삽입 (member_id 10000, 10001 사용)
INSERT INTO persona (id, name, profile, member_id, is_saved, created_at, updated_at, is_active, code, thumbnail)
VALUES
    (nextval('persona_sequence'), '새벽의 예술가', 'https://s3.persona.com/profiles/artist_01.jpg', 10000, true, now(), now(), true, 'aaaaaaaaaa','a'),
    (nextval('persona_sequence'), '냉철한 분석가', 'https://s3.persona.com/profiles/analyst_02.jpg', 10000, false, now(), now(), true, 'bbbbbbbbbb','b'),
    (nextval('persona_sequence'), '햇살 머금은 모험가', 'https://s3.persona.com/profiles/adventurer_03.jpg', 10001, true, now(), now(), true, 'cccccccccc','c'),
    (nextval('persona_sequence'), '도심 속 미니멀리스트', 'https://s3.persona.com/profiles/minimal_04.jpg', 10001, true, now(), now(), true, 'dddddddddd','d');

-- 2. Persona 키워드 삽입 (위에서 생성된 ID 10000, 10001, 10002, 10003 가정)
INSERT INTO persona_keywords (persona_id, keyword)
VALUES
    (10000, '감성적인'), (10000, '창의적'), (10000, '몽환적'),
    (10001, '논리적'), (10001, '효율성'), (10001, '정확한'),
    (10002, '에너제틱'), (10002, '자유로운'), (10002, '낙천적'),
    (10003, '단순한'), (10003, '정적인'), (10003, '세련된');

-- 3. Persona 컬러 삽입
INSERT INTO persona_colors (persona_id, color)
VALUES
    (10000, '#4A148C'), (10000, '#7B1FA2'), -- 보라 계열
    (10001, '#263238'), (10001, '#546E7A'), -- 다크 그레이 계열
    (10002, '#FFB300'), (10002, '#F4511E'), -- 오렌지/옐로우 계열
    (10003, '#F5F5F5'), (10003, '#9E9E9E'); -- 화이트/그레이 계열

-- 1. 무채색의 도시적인 남성 페르소나
INSERT INTO reference (id, name, img, prompt, description, is_active, created_at, updated_at)
VALUES (nextval('reference_sequence'), 'Urban Monochrome', 'https://s3.persona.com/refs/urban_01.jpg',
        'A sophisticated man in a charcoal grey suit, standing in a foggy Seoul city background, cinematic lighting, 8k resolution, monochrome style', '도시적인 무드의 인스타그램 피드 컨텐츠입니다.',
        true, NOW(), NOW());

-- 2. 미니멀한 화이트톤의 여성 페르소나
INSERT INTO reference (id, name, img, prompt, description, is_active, created_at, updated_at)
VALUES (nextval('reference_sequence'), 'Minimal White', 'https://s3.persona.com/refs/minimal_02.jpg',
        'A calm woman wearing an ivory silk blouse, minimalist modern interior background, soft natural sunlight, clean and elegant atmosphere','도시적인 무드의 인스타그램 피드 컨텐츠입니다.',
        true, NOW(), NOW());

-- 3. 사이버펑크 스타일의 네온 페르소나
INSERT INTO reference (id, name, img, prompt, description, is_active, created_at, updated_at)
VALUES (nextval('reference_sequence'), 'Neon Midnight', 'https://s3.persona.com/refs/neon_03.jpg',
        'A futuristic persona with neon blue accents, dark techwear outfit, rainy night street in Tokyo with vibrant reflections, highly detailed','도시적인 무드의 인스타그램 피드 컨텐츠입니다.',
        true, NOW(), NOW());

-- 4. 자연친화적인 얼스톤(Earth-tone) 페르소나
INSERT INTO reference (id, name, img, prompt, is_active, created_at, updated_at)
VALUES (nextval('reference_sequence'), 'Natural Earth', 'https://s3.persona.com/refs/nature_04.jpg',
        'A person in beige linen clothing, warm sunset light through forest trees, organic and peaceful vibe, film grain texture',
        true, NOW(), NOW());

INSERT INTO content (id, persona_id, reference_id, img, type, is_active, created_at, updated_at)
VALUES (nextval('content_sequence'), 10000, null, 'https://s3.persona.com/outputs/user01_urban_feed.jpg',
        'FEED',  true, NOW(), NOW());


-- 1. Urban Monochrome 페르소나의 인스타 피드형 컨텐츠 (4:5)
INSERT INTO content (id, persona_id, reference_id, img, type, is_active, created_at, updated_at)
VALUES (nextval('content_sequence'), 10000, 10000, 'https://s3.persona.com/outputs/user01_urban_feed.jpg',
        'FEED', true, NOW(), NOW());

-- 2. Urban Monochrome 페르소나의 스토리 컨텐츠 (9:16)
INSERT INTO content (id, persona_id, reference_id, img, type, is_active, created_at, updated_at)
VALUES (nextval('content_sequence'), 10000, 10000, 'https://s3.persona.com/outputs/user01_urban_story.jpg',
        'STORY', true, NOW(), NOW());

-- 3. Minimal White 페르소나의 기본 정사각형 컨텐츠 (1:1)
INSERT INTO content (id, persona_id, reference_id, img, type,  is_active, created_at, updated_at)
VALUES (nextval('content_sequence'), 10001, 10001, 'https://s3.persona.com/outputs/user02_minimal_sq.jpg',
        'SQUARE', true, NOW(), NOW());

