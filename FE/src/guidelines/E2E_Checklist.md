# FE E2E 점검 체크리스트

## 1. 인증/권한
- 로그인 성공 시 `POST /api/v1/signin` 응답의 `accessToken` 저장 확인
- 일반 유저 로그인 후 홈 진입 확인
- 관리자(`roles`에 `ROLE_ADMIN`) 로그인 후 관리자 콘솔 진입 확인
- 로그아웃 시 `POST /api/v1/logout` 호출 후 홈으로 이동 확인

## 2. 홈 공지
- 홈 알림 버튼 클릭 시 공지 모달 오픈 확인
- `GET /api/v1/notice` 호출 성공 확인
- `GET /api/v1/notice/pinned` 호출 성공 및 고정 공지 우선 노출 확인

## 3. 관리자 공지
- 목록 조회: `GET /api/v1/admin/notice`
- 등록: `POST /api/v1/admin/notice` (`title`, `content`, `isPinned`, `isDraft`)
- 수정: `PATCH /api/v1/admin/notice/{id}`
- 삭제: `DELETE /api/v1/admin/notice/{id}`

## 4. 관리자 멤버
- 목록 조회: `GET /api/v1/admin/member`
- 차단/해제: `PATCH /api/v1/admin/member` (`id`, `status`, `reason`)
- 차단 탭에서 차단 사유/차단 시각 표시 확인

## 5. 관리자 레퍼런스
- 목록 조회: `GET /api/v1/admin/reference`
- 생성: `POST /api/v1/admin/reference` (multipart: `image`, `name`, `prompt`, `description`)
- 수정: `PATCH /api/v1/admin/reference/{id}` (multipart)
- 삭제: `DELETE /api/v1/admin/reference/{id}`

## 6. 설정 페이지
- 기본정보 수정: `PATCH /api/v1/member` (`birth`, `sex`, `is_creator`)
- 이메일 변경: `POST /api/v1/member/check` 후 `PATCH /api/v1/member/email`
- 비밀번호 변경: `POST /api/v1/member/check` 후 `PATCH /api/v1/member/password`
- 회원탈퇴: `DELETE /api/v1/member`
- 언어 토글, 공지 모달, 1:1 문의(mailto), 약관 모달 표시 확인

## 7. 페르소나 진단
- 입력(이미지/음성/선호결과) 완료 후 분석 시작 시 `POST /api/v1/persona` 호출 확인
- 저장하기 클릭 시 `PATCH /api/v1/persona/save-new` 호출 확인

## 8. 회귀 점검
- `npm run lint` 통과
- `npm run build` 통과
