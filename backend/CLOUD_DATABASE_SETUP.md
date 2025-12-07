# Cloud Database Setup Guide

Safari-for-Safety 프로젝트를 클라우드 데이터베이스와 연결하는 가이드입니다.

## 지원하는 클라우드 데이터베이스

- ✅ **Supabase** (무료 티어 제공, PostgreSQL 기반)
- ✅ **Neon** (무료 티어 제공, 서버리스 PostgreSQL)
- ✅ **AWS RDS** (PostgreSQL)
- ✅ **Google Cloud SQL** (PostgreSQL)
- ✅ **Azure Database for PostgreSQL**
- ✅ **ElephantSQL** (무료 티어 제공)

---

## 1. Supabase 설정 (추천)

### 장점
- 무료 티어: 500MB 데이터베이스
- 자동 백업
- 실시간 기능 지원
- REST API 자동 생성

### 설정 방법

1. **Supabase 계정 생성**
   - https://supabase.com 접속
   - 무료 계정 생성

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - Project name: `safari-for-safety`
   - Database Password: 강력한 비밀번호 설정
   - Region: `Northeast Asia (Seoul)` 선택

3. **연결 정보 확인**
   - Project Settings → Database
   - Connection string (URI) 복사

4. **.env 파일 업데이트**
   ```env
   # 기존 로컬 DB 설정 주석 처리
   # DB_HOST=localhost
   # DB_PORT=5432
   # DB_USER=postgres
   # DB_PASSWORD=1234
   # DB_NAME=safari_for_safety

   # Supabase 연결 문자열 추가
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   DB_SSL=true
   ```

5. **데이터베이스 테이블 생성 및 데이터 가져오기**
   ```bash
   cd backend
   node scripts/import-csv-to-db.js
   ```

---

## 2. Neon 설정

### 장점
- 서버리스 PostgreSQL
- 무료 티어: 3GB 데이터
- 자동 스케일링
- 빠른 콜드 스타트

### 설정 방법

1. **Neon 계정 생성**
   - https://neon.tech 접속
   - GitHub/Google 로그인

2. **새 프로젝트 생성**
   - "Create a project" 클릭
   - Project name: `safari-for-safety`
   - Region: `AWS Asia Pacific (Seoul)` 선택

3. **연결 문자열 복사**
   - Dashboard에서 Connection String 복사

4. **.env 파일 업데이트**
   ```env
   DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require
   DB_SSL=true
   ```

5. **데이터 가져오기**
   ```bash
   cd backend
   node scripts/import-csv-to-db.js
   ```

---

## 3. AWS RDS 설정

### 장점
- 엔터프라이즈급 안정성
- 자동 백업 및 복구
- 높은 확장성

### 설정 방법

1. **AWS 콘솔에서 RDS 생성**
   - Engine: PostgreSQL
   - Instance class: db.t3.micro (프리 티어)
   - Storage: 20GB
   - Public access: Yes

2. **보안 그룹 설정**
   - Inbound rules에서 PostgreSQL (5432) 포트 허용

3. **.env 파일 업데이트**
   ```env
   DATABASE_URL=postgresql://[username]:[password]@[endpoint].rds.amazonaws.com:5432/[dbname]
   DB_SSL=true
   ```

---

## 4. 연결 테스트

### Backend 서버 실행
```bash
cd backend
npm start
```

### Health Check API 호출
```bash
curl http://localhost:5000/api/health
```

응답 예시:
```json
{
  "status": "ok",
  "message": "Safari-for-Safety API is running",
  "database": "connected",
  "dataStored": {
    "roadkill": 4776,
    "animalTypes": 110,
    "weather": 5386
  }
}
```

---

## 5. 데이터 마이그레이션

### 로컬 DB → 클라우드 DB

1. **로컬 데이터 백업**
   ```bash
   pg_dump -U postgres safari_for_safety > backup.sql
   ```

2. **클라우드 DB로 복원**
   ```bash
   psql [YOUR_CLOUD_DATABASE_URL] < backup.sql
   ```

### 또는 CSV 파일로 직접 가져오기
```bash
cd backend
node scripts/import-csv-to-db.js
```

---

## 6. 프로덕션 배포 시 주의사항

### 환경 변수 보안
- `.env` 파일을 절대 Git에 커밋하지 마세요
- `.gitignore`에 `.env` 추가 확인

### SSL 연결
클라우드 DB는 SSL 필수:
```env
DB_SSL=true
```

### 연결 풀 크기 조정
```javascript
// database.js
max: 20  // 동시 연결 수 (클라우드 플랜에 따라 조정)
```

### 성능 최적화
- 인덱스 확인: `roadkill_incidents`, `weather_data`
- 쿼리 최적화: EXPLAIN ANALYZE 사용
- 캐싱 전략 고려 (Redis)

---

## 7. 비용 최적화

### 무료 티어 비교

| Provider | Storage | Connections | Backup |
|----------|---------|-------------|--------|
| Supabase | 500MB | Unlimited | 7 days |
| Neon | 3GB | Unlimited | Automatic |
| ElephantSQL | 20MB | 5 concurrent | None |
| AWS RDS (Free) | 20GB | Limited | 7 days |

### 권장사항
- 개발/테스트: **Supabase** 또는 **Neon**
- 프로덕션 (소규모): **Supabase**
- 프로덕션 (대규모): **AWS RDS** 또는 **Google Cloud SQL**

---

## 문제 해결

### 연결 실패
```
Error: connect ETIMEDOUT
```
- 방화벽/보안 그룹에서 IP 허용 확인
- SSL 설정 확인 (`DB_SSL=true`)

### SSL 인증 오류
```
Error: self signed certificate
```
- `ssl: { rejectUnauthorized: false }` 추가 확인

### 마이그레이션 실패
- PostgreSQL 버전 호환성 확인 (최소 12 이상)
- 테이블 이름 대소문자 확인
- 권한 확인 (`CREATE TABLE` 권한 필요)

---

## 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Neon 공식 문서](https://neon.tech/docs)
- [PostgreSQL 연결 풀링](https://node-postgres.com/features/pooling)
- [Node.js pg 라이브러리](https://node-postgres.com)
