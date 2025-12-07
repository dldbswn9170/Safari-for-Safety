# Safari for Safety - Backend API

한국의 로드킬 데이터를 분석하고 신고를 접수하는 백엔드 API 서버입니다.

## 기능

- 🔐 사용자 인증 (JWT 기반 회원가입/로그인)
- 🚨 로드킬 신고 접수 시스템
- 📊 로드킬 통계 데이터 API
- 🗄️ PostgreSQL 데이터베이스 연동
- 🌤️ 날씨 데이터와 로드킬 상관관계 분석

## 기술 스택

- Node.js + Express
- PostgreSQL
- JWT (JSON Web Tokens)
- bcryptjs (비밀번호 암호화)
- csv-parser (CSV 데이터 로딩)

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. PostgreSQL 설치 및 실행
PostgreSQL이 설치되어 있어야 합니다.
- Windows: https://www.postgresql.org/download/windows/
- 설치 후 PostgreSQL 서비스가 실행 중인지 확인하세요

### 3. 환경 변수 설정
`.env` 파일을 수정하여 데이터베이스 정보를 입력하세요:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here  # PostgreSQL 비밀번호 입력
DB_NAME=safari_for_safety

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

PORT=5000
NODE_ENV=development
```

### 4. 데이터베이스 초기화
```bash
node setup-database.js
```

이 명령어는 자동으로:
- `safari_for_safety` 데이터베이스 생성
- 필요한 테이블 생성 (users, roadkill_reports)
- 인덱스 및 트리거 설정

### 5. 서버 실행
```bash
npm start
```

서버가 `http://localhost:5000`에서 실행됩니다.

## API 엔드포인트

### 인증 (Authentication)

#### 회원가입
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123"
}
```

#### 로그인
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 내 정보 조회 (인증 필요)
```
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

### 로드킬 신고 (Roadkill Reports)

#### 전체 신고 조회
```
GET /api/reports?status=approved&limit=100&offset=0
```

#### 신고 상세 조회
```
GET /api/reports/:id
```

#### 신고 등록 (인증 필요)
```
POST /api/reports
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "animal_type": "고라니",
  "location_address": "서울시 강남구 테헤란로 123",
  "latitude": 37.123456,
  "longitude": 127.123456,
  "incident_date": "2024-01-15",
  "incident_time": "14:30",
  "description": "도로 옆에서 발견"
}
```

#### 내 신고 목록 조회 (인증 필요)
```
GET /api/reports/user/my-reports
Authorization: Bearer YOUR_JWT_TOKEN
```

#### 신고 상태 업데이트 (인증 필요)
```
PATCH /api/reports/:id/status
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "approved"  // pending, approved, rejected
}
```

#### 신고 삭제 (인증 필요)
```
DELETE /api/reports/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### 로드킬 데이터 (기존 데이터)

#### 전체 로드킬 데이터
```
GET /api/roadkill
```

#### 지역별 로드킬 데이터
```
GET /api/roadkill/region/:region
예: GET /api/roadkill/region/경기
```

#### 지역별 통계
```
GET /api/statistics/by-region
```

#### 날짜별 통계
```
GET /api/statistics/by-date?startDate=2020-01-01&endDate=2022-12-31
```

#### 동물 종류 통계
```
GET /api/statistics/animals
```

### 서버 상태 확인
```
GET /api/health
```

## 데이터베이스 스키마

### users 테이블
```sql
- id: SERIAL PRIMARY KEY
- username: VARCHAR(50) UNIQUE
- email: VARCHAR(100) UNIQUE
- password: VARCHAR(255) (암호화됨)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### roadkill_reports 테이블
```sql
- id: SERIAL PRIMARY KEY
- user_id: INTEGER (users 참조)
- animal_type: VARCHAR(50)
- location_address: TEXT
- latitude: DECIMAL(10, 8)
- longitude: DECIMAL(11, 8)
- incident_date: DATE
- incident_time: TIME
- description: TEXT
- photo_url: TEXT
- status: VARCHAR(20) (pending/approved/rejected)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 외부 접속 설정

### 로컬 네트워크에서 접속
서버는 `0.0.0.0`으로 바인딩되어 같은 네트워크의 다른 기기에서 접속 가능합니다.

### 인터넷을 통한 외부 접속 (localtunnel)
```bash
npx localtunnel --port 5000
```

생성된 URL을 통해 전 세계 어디서든 API에 접속할 수 있습니다.

## 문제 해결

### PostgreSQL 연결 오류
- PostgreSQL 서비스가 실행 중인지 확인
- `.env` 파일의 DB_PASSWORD가 올바른지 확인
- 방화벽이 5432 포트를 차단하지 않는지 확인

### 포트 충돌
- `.env` 파일에서 PORT 변수를 변경하세요

## 라이선스
MIT
