# Secrets 복원 가이드

비공개로 관리되는 환경변수(.env)와 키를 채워 넣어 프로젝트를 정상 실행하는 방법입니다. 코드에 비밀을 넣지 않고도 동작하도록 설계돼 있으니 아래 순서로 세팅하세요.

## 1) 백엔드 환경변수 (backend/.env)
예시 템플릿을 기반으로 실제 값을 채워 넣으세요.
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<DB비밀번호>
DB_NAME=safari_for_safety

JWT_SECRET=<길고_랜덤한_문자열>

PORT=5000
NODE_ENV=development
```
- DB_*: 각자 로컬/서버의 PostgreSQL 설정에 맞게 입력
- JWT_SECRET: 영숫자+특수문자 포함한 충분히 긴 랜덤 문자열

## 2) 프론트엔드 환경변수 (frontend/.env)
```
REACT_APP_MAPBOX_TOKEN=<Mapbox_access_token>
REACT_APP_API_URL=http://localhost:5000   # 백엔드 주소에 맞게 변경
```
- Mapbox 토큰: 개인/조직 계정에서 발급한 Access Token
- API URL: 로컬은 보통 localhost:5000, ngrok/포트포워딩 사용 시 해당 주소로 변경

## 3) 실행 순서(로컬 기준)
1) PostgreSQL 실행 및 `backend/.env` 채우기
2) 백엔드: `cd backend && npm install && node setup-database.js && npm start`
3) 프론트: `cd frontend && npm install && npm start`
4) 접속: http://localhost:3000 (같은 Wi‑Fi 다른 기기: http://<이PC IP>:3000)

## 4) 외부 접속 시 주의
- ngrok: `start-server.bat` 후 `start-ngrok.bat`; 나온 https URL을 프론트 API 주소로 임시 변경
- 포트포워딩: 공유기 3000/5000 포워딩 + 방화벽 허용(`setup-firewall.bat`) + 공인 IP 확인 후 주소 공유

## 5) 자주 나는 오류 체크리스트
- DB 연결 실패: .env 비밀번호/포트 오타, PostgreSQL 미실행 여부 확인
- 지도 안 뜸: `REACT_APP_MAPBOX_TOKEN` 누락/오타
- CORS/API 실패: 프론트 API URL이 현재 백엔드 주소와 다른 경우
- JWT 오류: 만료/잘못된 토큰 → 재로그인
