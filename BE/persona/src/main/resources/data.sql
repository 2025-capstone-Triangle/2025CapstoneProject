-- 1. ROLE_USER (일반 사용자) 2명 생성
-- 비밀번호 '1234'
INSERT INTO member (id, username, password, email, role, birth, sex, is_creator, created_at, updated_at, is_active)
VALUES
    (nextval('member_sequence'), 'user01', '{bcrypt}$2a$10$FTNkrY7VKsf3rt5d1dNwBeRPscViiolO7LT4a7VUgN/Y8jiUdadlC', 'user01@example.com', 'ROLE_USER', '2001-05-15', 'FEMALE', true, now(), now(), true),
    (nextval('member_sequence'), 'user02', '{bcrypt}$2a$10$FTNkrY7VKsf3rt5d1dNwBeRPscViiolO7LT4a7VUgN/Y8jiUdadlC', 'user02@example.com', 'ROLE_USER', '2000-11-20', 'FEMALE', false, now(), now(), true);

-- 2. ROLE_ADMIN (관리자) 2명 생성
-- 비밀번호 'admin'
INSERT INTO member (id, username, password, email, role, birth, sex, is_creator, created_at, updated_at, is_active)
VALUES
    (nextval('member_sequence'), 'admin', '{bcrypt}$2a$10$eQswQEePE9YBRlCvoGjzvucjQZ1JJYdhVwob.gfLJ5I.swOpReeDC', 'admin01@example.com', 'ROLE_ADMIN', '2002-03-10', 'FEMALE', true, now(), now(), true),
    (nextval('member_sequence'), 'admin1', '{bcrypt}$2a$10$eQswQEePE9YBRlCvoGjzvucjQZ1JJYdhVwob.gfLJ5I.swOpReeDC', 'admin02@persona.com', 'ROLE_ADMIN', '1995-01-01', 'MALE', false, now(), now(), true);