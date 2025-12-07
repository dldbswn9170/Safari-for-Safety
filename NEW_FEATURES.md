# 🎉 Safari-for-Safety 새로운 기능 추가 완료!

BK 폴더의 로그인 및 신고 기능이 Safari-for-Safety에 성공적으로 통합되었습니다.

---

## ✨ 추가된 기능

### 1️⃣ 사용자 인증 (로그인/회원가입)
- ✅ 회원가입 기능
- ✅ 로그인 기능
- ✅ JWT 토큰 기반 인증
- ✅ 비밀번호 암호화 (bcrypt)

### 2️⃣ 로드킬 신고 기능
- ✅ 로그인한 사용자만 신고 가능
- ✅ 신고 내용: 동물 종류, 위치, 날짜, 설명, 사진 URL
- ✅ 내 신고 목록 조회
- ✅ 신고 삭제 (본인만 가능)
- ✅ 신고 상태 관리 (pending/approved/rejected)

---

## 🗄️ 데이터베이스 구조

### users 테이블
```sql
- id (자동 증가)
- username (사용자명, 3-50자)
- email (이메일, 유니크)
- password (암호화된 비밀번호)
- created_at (가입일)
- updated_at (수정일)
```

### roadkill_reports 테이블
```sql
- id (자동 증가)
- user_id (신고한 사용자)
- animal_type (동물 종류)
- location_address (위치 주소)
- latitude (위도)
- longitude (경도)
- incident_date (사고 날짜)
- incident_time (사고 시간)
- description (설명)
- photo_url (사진 URL)
- status (상태: pending/approved/rejected)
- created_at (신고일)
- updated_at (수정일)
```

---

## 📡 API 엔드포인트

### 인증 API (Authentication)

#### 회원가입
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "사용자명",
  "email": "email@example.com",
  "password": "비밀번호123"
}
```

**응답:**
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다",
  "user": {
    "id": 1,
    "username": "사용자명",
    "email": "email@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 로그인
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "email@example.com",
  "password": "비밀번호123"
}
```

**응답:**
```json
{
  "success": true,
  "message": "로그인 성공",
  "user": {
    "id": 1,
    "username": "사용자명",
    "email": "email@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 내 정보 조회
```bash
GET /api/auth/me
Authorization: Bearer {token}
```

---

### 신고 API (Reports)

#### 신고 목록 조회 (누구나 가능)
```bash
GET /api/reports
GET /api/reports?status=approved
GET /api/reports?limit=50&offset=0
```

**응답:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "username": "사용자명",
      "animal_type": "고양이",
      "location_address": "서울시 강남구",
      "latitude": "37.50000000",
      "longitude": "127.00000000",
      "incident_date": "2025-12-06",
      "description": "신고 설명",
      "status": "approved",
      "created_at": "2025-12-06T10:00:00.000Z"
    }
  ]
}
```

#### 신고 상세 조회
```bash
GET /api/reports/:id
```

#### 신고 작성 (로그인 필요)
```bash
POST /api/reports
Authorization: Bearer {token}
Content-Type: application/json

{
  "animal_type": "고양이",
  "location_address": "서울시 강남구",
  "latitude": 37.5,
  "longitude": 127.0,
  "incident_date": "2025-12-06",
  "incident_time": "14:30:00",
  "description": "로드킬 목격 설명",
  "photo_url": "https://example.com/photo.jpg"
}
```

#### 내 신고 목록 조회 (로그인 필요)
```bash
GET /api/reports/user/my-reports
Authorization: Bearer {token}
```

#### 신고 상태 변경 (로그인 필요)
```bash
PATCH /api/reports/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "approved"
}
```

#### 신고 삭제 (본인만 가능)
```bash
DELETE /api/reports/:id
Authorization: Bearer {token}
```

---

## 🔒 보안 기능

### 1. JWT 토큰 인증
- 7일 유효기간
- Authorization 헤더로 전송: `Bearer {token}`

### 2. 비밀번호 암호화
- bcrypt로 해싱 (10 rounds)
- 데이터베이스에 평문 저장 안됨

### 3. 입력 검증
- express-validator로 모든 입력 검증
- SQL Injection 방지 (parameterized queries)

---

## 💾 데이터 저장 방식

### ✅ PostgreSQL DB에 저장/출력
모든 사용자 데이터와 신고 데이터는 **PostgreSQL 데이터베이스**에 저장됩니다.

**테이블:**
- `users` - 사용자 정보
- `roadkill_reports` - 사용자 신고 데이터
- `roadkill_incidents` - CSV에서 가져온 기존 데이터 (4,776건)
- `animal_type_stats` - 동물 종류 통계 (110건)
- `weather_data` - 날씨 데이터 (5,386건)

### ❌ CSV 파일 사용 안함
기존 BK에서는 CSV 파일을 메모리에 로드했지만, 현재는 **모든 데이터가 DB에서 관리**됩니다.

---

## 🌐 호스팅 방식

### ✅ 포트포워딩 방식
컴퓨터만 켜놓으면 자동으로 서버가 실행됩니다.

**접속 주소:**
- 로컬: `http://localhost:3000`
- 같은 WiFi: `http://203.234.62.145:3000`
- 외부 인터넷: `http://203.234.62.145:3000` (공유기 포트포워딩 설정 필요)

**필요한 포트:**
- Frontend: 3000
- Backend: 5000
- PostgreSQL: 5432

### ❌ ngrok 사용 안함
ngrok 대신 **공유기 포트포워딩**으로 외부 접속을 허용합니다.

---

## 📂 추가된 파일

### Backend
```
backend/
├── middleware/
│   └── auth.js                    # JWT 인증 미들웨어
├── routes/
│   ├── auth.js                    # 로그인/회원가입 라우트
│   └── reports.js                 # 신고 기능 라우트
├── migrations/
│   └── create-auth-tables.sql     # users, roadkill_reports 테이블 생성
└── Server.js                      # auth, reports routes 연결됨
```

### Documentation
```
Safari-for-Safety/
├── NEW_FEATURES.md                # 이 문서
└── (기존 문서들...)
```

---

## 🧪 테스트 결과

### ✅ 회원가입
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test1234"}'
```
**결과:** ✅ 성공 - 토큰 발급됨

### ✅ 로그인
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}'
```
**결과:** ✅ 성공 - 토큰 발급됨

### ✅ 신고 작성
```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"animal_type":"고양이","location_address":"서울시 강남구","latitude":37.5,"longitude":127.0,"incident_date":"2025-12-06"}'
```
**결과:** ✅ 성공 - DB에 저장됨

### ✅ 신고 목록 조회
```bash
curl http://localhost:5000/api/reports
```
**결과:** ✅ 성공 - 2건 조회됨

---

## 🎯 사용 방법

### 1단계: 서버 시작
```bash
start-server.bat
```

### 2단계: 회원가입
브라우저나 앱에서 회원가입 API 호출

### 3단계: 로그인
로그인 후 받은 토큰 저장

### 4단계: 신고하기
토큰과 함께 신고 API 호출

### 5단계: 신고 목록 보기
누구나 신고 목록 조회 가능

---

## 🔄 기존 기능과의 호환성

### ✅ 기존 기능 그대로 유지
- 로드킬 데이터 조회 (`/api/roadkill`)
- 통계 API (`/api/statistics`)
- 지역별 데이터 (`/api/regions`)

### ✅ 새로운 기능 추가
- 사용자 인증 (`/api/auth`)
- 사용자 신고 (`/api/reports`)

**기존 기능은 전혀 건드리지 않았습니다!**

---

## 📊 현재 데이터베이스 현황

```
✅ PostgreSQL 연결 성공
✅ 데이터 현황:
  - roadkill_incidents: 4,776건 (CSV 데이터)
  - animal_type_stats: 110건
  - weather_data: 5,386건
  - users: 3명 (테스트 계정 포함)
  - roadkill_reports: 2건 (사용자 신고)
```

---

## 🚀 다음 단계 제안

### Frontend 연동
현재 Backend API만 완성되었습니다. Frontend에서 다음 기능을 추가할 수 있습니다:

1. **로그인/회원가입 UI**
   - 로그인 폼
   - 회원가입 폼
   - 토큰 저장 (localStorage)

2. **신고 작성 UI**
   - 지도에서 위치 선택
   - 동물 종류 입력
   - 사진 업로드
   - 설명 작성

3. **내 신고 목록**
   - 내가 작성한 신고 목록
   - 신고 수정/삭제

4. **신고 지도 표시**
   - 기존 로드킬 데이터 + 사용자 신고 데이터
   - 다른 색상/아이콘으로 구분

---

## ✅ 완료 체크리스트

- [x] bcryptjs, jsonwebtoken, express-validator 설치
- [x] auth middleware 생성
- [x] users, roadkill_reports 테이블 생성
- [x] auth routes 추가 (로그인/회원가입)
- [x] reports routes 추가 (신고 기능)
- [x] Server.js에 routes 연결
- [x] 데이터베이스 마이그레이션 실행
- [x] 기능 테스트 완료

**모든 기능이 정상 작동합니다!** 🎉

---

## 📞 API 테스트 예시

### Postman 또는 curl로 테스트
```bash
# 1. 회원가입
curl -X POST http://203.234.62.145:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"myname","email":"my@email.com","password":"mypass123"}'

# 2. 로그인
curl -X POST http://203.234.62.145:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"my@email.com","password":"mypass123"}'

# 3. 신고 작성 (위에서 받은 token 사용)
curl -X POST http://203.234.62.145:5000/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "animal_type": "고라니",
    "location_address": "경기도 성남시",
    "latitude": 37.4201,
    "longitude": 127.1262,
    "incident_date": "2025-12-06",
    "description": "도로에서 발견"
  }'

# 4. 모든 신고 목록 보기
curl http://203.234.62.145:5000/api/reports

# 5. 내 신고 목록 보기
curl http://203.234.62.145:5000/api/reports/user/my-reports \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

**완료! 이제 Safari-for-Safety는 로그인 및 신고 기능을 갖춘 완전한 시스템입니다!** 🚀
