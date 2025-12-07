@echo off
chcp 65001 >nul
echo ========================================
echo 🌐 Safari-for-Safety 외부 접속 설정
echo ========================================
echo.

echo 💡 이 스크립트는 외부 인터넷(다른 WiFi/LTE)에서
echo    접속할 수 있게 해줍니다.
echo.

echo [1/2] Backend 서버 확인 중...
timeout /t 2 /nobreak >nul

curl -s http://localhost:5000/api/health >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Backend 서버 실행 중
) else (
    echo ❌ Backend 서버가 실행되지 않았습니다!
    echo.
    echo start-server.bat를 먼저 실행하세요.
    pause
    exit /b 1
)

echo.
echo [2/2] ngrok 터널 시작 중...
echo.
echo ========================================
echo 🚀 ngrok이 실행됩니다!
echo ========================================
echo.
echo 📝 나타나는 URL을 복사해서 공유하세요:
echo    예: https://xxxx-xx-xx.ngrok-free.app
echo.
echo ⚠️  이 창을 닫으면 외부 접속이 중단됩니다.
echo ========================================
echo.

cd /d "%~dp0backend"
ngrok.exe http 5000
