@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 Safari-for-Safety 서버 시작
echo ========================================
echo.

echo [1/2] Backend 서버 시작 중...
cd /d "%~dp0backend"
start "Safari Backend Server" cmd /k "npm start"
echo ✅ Backend 시작됨 (http://localhost:5000)

timeout /t 5 /nobreak >nul

echo [2/2] Frontend 앱 시작 중...
cd /d "%~dp0frontend"
start "Safari Frontend App" cmd /k "npm start"
echo ✅ Frontend 시작됨 (http://localhost:3000)

echo.
echo ========================================
echo ✅ 모든 서버가 시작되었습니다!
echo ========================================
echo.
echo 📍 로컬 접속:
echo    - Frontend: http://localhost:3000
echo    - Backend:  http://localhost:5000
echo.
echo 🌐 네트워크 접속 (같은 WiFi):
echo    - Frontend: http://203.234.62.145:3000
echo    - Backend:  http://203.234.62.145:5000
echo.
echo 💡 서버를 중지하려면 열린 창들을 닫으세요.
echo ========================================
pause
