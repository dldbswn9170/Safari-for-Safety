# 🌐 Safari-for-Safety 서버 공유하기

컴퓨터를 켜놓고 다른 사람들이 접속할 수 있게 하는 방법

---

## ✅ 현재 상태

### 서버 정보
- **내부 IP**: 203.234.62.145
- **Backend 서버**: http://203.234.62.145:5000
- **Frontend 앱**: http://203.234.62.145:3000

### 실행 중인 서비스
✅ Backend (포트 5000) - 실행 중
✅ Frontend (포트 3000) - 실행 중
✅ PostgreSQL 데이터베이스 - 연결됨

---

## 📱 접속 방법

### 같은 네트워크 (같은 WiFi)에서 접속
다른 사람이 같은 WiFi에 연결된 경우:

1. **모바일/다른 PC에서 브라우저 열기**
2. **주소창에 입력**:
   ```
   http://203.234.62.145:3000
   ```

### 외부 인터넷에서 접속 (다른 WiFi/LTE)
외부에서 접속하려면 **공유기 포트포워딩** 또는 **ngrok** 필요

---

## 🔧 외부 접속 설정하기

### 옵션 1: ngrok 사용 (5분 설정)

1. **터미널 새로 열기**
2. **ngrok 실행**:
   ```bash
   cd C:\Users\rmran\Documents\GitHub\Safari-for-Safety\backend
   ngrok.exe http 5000
   ```

3. **URL 확인**:
   ```
   Forwarding: https://xxxx-xx-xx.ngrok-free.app -> http://localhost:5000
   ```

4. **이 URL을 공유하면 됩니다!**
   - Backend API: `https://xxxx-xx-xx.ngrok-free.app`
   - 사용자들에게 이 주소 전달

5. **Frontend에서 이 URL 사용하도록 설정**:

   `frontend/.env` 파일에 추가:
   ```env
   REACT_APP_API_URL=https://xxxx-xx-xx.ngrok-free.app
   ```

   Frontend 재시작:
   ```bash
   cd C:\Users\rmran\Documents\GitHub\Safari-for-Safety\frontend
   npm start
   ```

---

### 옵션 2: 공유기 포트포워딩 (영구 설정)

#### 1단계: 공유기 관리 페이지 접속
- 브라우저에서 `192.168.0.1` 또는 `192.168.1.1` 입력
- 공유기 관리자 계정으로 로그인

#### 2단계: 포트포워딩 설정
**포트포워딩** 또는 **가상 서버** 메뉴 찾기:

| 항목 | 값 |
|------|-----|
| 서비스 이름 | Safari-Backend |
| 내부 IP | 203.234.62.145 |
| 외부 포트 | 5000 |
| 내부 포트 | 5000 |
| 프로토콜 | TCP |

Frontend도 추가:
| 항목 | 값 |
|------|-----|
| 서비스 이름 | Safari-Frontend |
| 내부 IP | 203.234.62.145 |
| 외부 포트 | 3000 |
| 내부 포트 | 3000 |
| 프로토콜 | TCP |

#### 3단계: 공인 IP 확인
```bash
curl ifconfig.me
```
→ 나온 IP 주소가 공인 IP (예: 123.456.789.012)

#### 4단계: 외부에서 접속
```
http://[공인IP]:3000
```

---

## 🛡️ 방화벽 설정 (Windows)

외부 접속이 안 되면 방화벽 규칙 추가:

```bash
# PowerShell을 관리자 권한으로 실행
netsh advfirewall firewall add rule name="Safari Backend" dir=in action=allow protocol=TCP localport=5000
netsh advfirewall firewall add rule name="Safari Frontend" dir=in action=allow protocol=TCP localport=3000
```

---

## 🚀 서버 자동 시작 설정

컴퓨터 부팅 시 자동으로 서버 실행:

### PM2 사용 (추천)

1. **PM2 설치**:
   ```bash
   npm install -g pm2-windows-startup pm2
   pm2-startup install
   ```

2. **서버 등록**:
   ```bash
   # Backend
   cd C:\Users\rmran\Documents\GitHub\Safari-for-Safety\backend
   pm2 start Server.js --name safari-backend

   # Frontend (프로덕션 빌드)
   cd C:\Users\rmran\Documents\GitHub\Safari-for-Safety\frontend
   npm run build
   pm2 serve build 3000 --name safari-frontend
   ```

3. **자동 시작 설정**:
   ```bash
   pm2 save
   ```

4. **PM2 관리 명령어**:
   ```bash
   pm2 list          # 실행 중인 앱 확인
   pm2 logs          # 로그 보기
   pm2 restart all   # 모든 앱 재시작
   pm2 stop all      # 모든 앱 중지
   ```

---

## 📊 서버 상태 확인

### 서버가 실행 중인지 확인
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

---

## 🔒 보안 팁

### 1. 강력한 JWT Secret 사용
`backend/.env`:
```env
JWT_SECRET=매우_긴_랜덤_문자열_여기에_입력
```

### 2. 데이터베이스 비밀번호 변경
```env
DB_PASSWORD=강력한_비밀번호
```

### 3. CORS 설정
특정 도메인만 접속 허용:
```javascript
// Server.js
app.use(cors({
  origin: ['http://허용할도메인.com']
}));
```

---

## 📝 사용자에게 공유할 내용

### ngrok 사용 시
```
Safari-for-Safety 서버에 접속하세요!

🌐 주소: https://xxxx-xx-xx.ngrok-free.app
```

### 포트포워딩 사용 시
```
Safari-for-Safety 서버에 접속하세요!

🌐 주소: http://[공인IP]:3000

⚠️ 서버 컴퓨터가 켜져있을 때만 접속 가능합니다.
```

---

## ⚡ 빠른 시작 스크립트

### start-server.bat 만들기
```bat
@echo off
echo Safari-for-Safety 서버 시작 중...

cd C:\Users\rmran\Documents\GitHub\Safari-for-Safety\backend
start "Backend" cmd /k "npm start"

timeout /t 5

cd C:\Users\rmran\Documents\GitHub\Safari-for-Safety\frontend
start "Frontend" cmd /k "npm start"

echo 서버가 시작되었습니다!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
pause
```

이 파일을 더블클릭하면 서버 자동 시작!

---

## 🆘 문제 해결

### "포트가 이미 사용 중"
```bash
# 포트 사용 프로세스 종료
taskkill //F //PID [PID번호]
```

### "외부에서 접속 안됨"
1. ✅ 방화벽 규칙 확인
2. ✅ 공유기 포트포워딩 확인
3. ✅ 서버가 실행 중인지 확인
4. ✅ 공인 IP 주소 확인

### "데이터베이스 연결 실패"
```bash
# PostgreSQL 서비스 재시작
net stop postgresql-x64-16
net start postgresql-x64-16
```

---

## 💡 팁

### 컴퓨터 절전 모드 방지
서버로 사용할 때는 절전 모드 끄기:
1. **설정** → **시스템** → **전원 및 절전**
2. **절전 모드**: **안 함**
3. **화면 끄기**: **15분** (선택)

### 네트워크 상태 모니터링
```bash
# 실시간 네트워크 연결 확인
netstat -an 5
```

### 로그 저장
```bash
# Backend 로그
cd C:\Users\rmran\Documents\GitHub\Safari-for-Safety\backend
npm start > server.log 2>&1
```
