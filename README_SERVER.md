# 🚀 Safari-for-Safety 서버 운영 가이드

컴퓨터를 서버로 사용해서 다른 사람들이 접속할 수 있게 하는 방법

---

## ✅ 현재 서버 상태

### 서버 실행 중!
- ✅ Backend: http://localhost:5000
- ✅ Frontend: http://localhost:3000
- ✅ Database: PostgreSQL 연결됨

### 서버 주소
- **로컬**: http://localhost:3000
- **같은 WiFi**: http://203.234.62.145:3000

---

## 🎯 빠른 시작

### 1️⃣ 서버 시작하기
```
start-server.bat 파일을 더블클릭!
```
→ 자동으로 Backend와 Frontend가 실행됩니다.

### 2️⃣ 방화벽 설정 (최초 1회만)
```
setup-firewall.bat 파일을 마우스 오른쪽 클릭 → "관리자 권한으로 실행"
```
→ 다른 기기에서 접속할 수 있게 됩니다.

### 3️⃣ 다른 사람에게 공유
**같은 WiFi에 연결된 경우**:
```
http://203.234.62.145:3000
```
이 주소를 알려주세요!

---

## 📱 접속 방법

### 같은 네트워크 (WiFi)
1. 친구가 같은 WiFi에 연결
2. 브라우저에서 `http://203.234.62.145:3000` 접속
3. 완료! 🎉

### 외부 인터넷 (다른 WiFi/LTE)
두 가지 방법:

#### 방법 A: ngrok (5분 설정)
```bash
cd backend
ngrok.exe http 5000
```
→ 나온 URL (https://xxxx.ngrok-free.app)을 공유

#### 방법 B: 공유기 포트포워딩
1. 공유기 관리 페이지 접속 (192.168.0.1)
2. 포트포워딩 설정:
   - 포트 3000, 5000 → 내 컴퓨터 (203.234.62.145)
3. 공인 IP 확인: `curl ifconfig.me`
4. 공인 IP:3000 으로 접속!

---

## 🛠️ 관리 명령어

### 서버 상태 확인
```bash
# Backend 확인
curl http://localhost:5000/api/health

# Frontend 확인
curl http://localhost:3000
```

### 포트 사용 확인
```bash
netstat -ano | findstr ":5000"
netstat -ano | findstr ":3000"
```

### 서버 재시작
1. 실행 중인 cmd 창들 닫기
2. `start-server.bat` 다시 실행

---

## 💡 유용한 팁

### 1. 컴퓨터 절전 모드 끄기
서버로 사용할 때는:
- **설정** → **시스템** → **전원 및 절전**
- **절전 모드**: **안 함**으로 설정

### 2. 자동 시작 설정
컴퓨터 부팅 시 자동 실행:
1. `start-server.bat` 파일 복사
2. `Win + R` → `shell:startup` 입력
3. 복사한 파일 붙여넣기

### 3. 네트워크 상태 확인
```bash
ipconfig
```
→ IP 주소가 바뀌었는지 확인

---

## 🔒 보안 설정

### 강력한 비밀번호 설정
`backend/.env` 파일:
```env
JWT_SECRET=매우_긴_랜덤_문자열_여기에_입력
DB_PASSWORD=강력한_비밀번호
```

### HTTPS 사용 (선택)
- ngrok 사용 시 자동으로 HTTPS 제공
- 포트포워딩 사용 시 Let's Encrypt 인증서 설치 필요

---

## 📊 모니터링

### 실시간 로그 확인
Backend와 Frontend 창에서 실시간으로 확인 가능

### 접속자 확인
```bash
netstat -an | findstr "ESTABLISHED"
```

---

## 🆘 문제 해결

### "포트가 이미 사용 중"
```bash
# 포트 사용 프로세스 확인
netstat -ano | findstr ":5000"

# 프로세스 종료
taskkill //F //PID [PID번호]
```

### "외부에서 접속 안됨"
1. ✅ 서버가 실행 중인지 확인
2. ✅ 방화벽 규칙이 추가되었는지 확인
3. ✅ 같은 WiFi에 연결되어 있는지 확인
4. ✅ IP 주소가 맞는지 확인 (ipconfig로 재확인)

### "데이터베이스 연결 실패"
```bash
# PostgreSQL 서비스 재시작
net stop postgresql-x64-16
net start postgresql-x64-16
```

---

## 📂 주요 파일

- **start-server.bat** - 서버 시작 스크립트
- **setup-firewall.bat** - 방화벽 설정 스크립트
- **HOW_TO_SHARE.md** - 상세 공유 가이드
- **HOST_SERVER_GUIDE.md** - 호스팅 완벽 가이드

---

## 📞 더 많은 정보

자세한 설정 방법은 다음 파일들을 참고하세요:
- [HOW_TO_SHARE.md](./HOW_TO_SHARE.md) - 공유 방법 상세 가이드
- [HOST_SERVER_GUIDE.md](./HOST_SERVER_GUIDE.md) - 호스팅 완벽 가이드
- [CLOUD_DATABASE_SETUP.md](./backend/CLOUD_DATABASE_SETUP.md) - 클라우드 DB 설정

---

## ✨ 현재 설정 요약

| 항목 | 값 |
|------|-----|
| Backend 포트 | 5000 |
| Frontend 포트 | 3000 |
| 내부 IP | 203.234.62.145 |
| 데이터베이스 | PostgreSQL (로컬) |
| 데이터 | 4,776개 로드킬 데이터 |

**서버 접속 URL**: http://203.234.62.145:3000

이제 컴퓨터를 켜놓고 위 주소를 공유하면 다른 사람들이 접속할 수 있습니다! 🚀
