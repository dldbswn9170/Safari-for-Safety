@echo off
chcp 65001 >nul

:: 관리자 권한 확인
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️  관리자 권한이 필요합니다!
    echo.
    echo 이 파일을 마우스 오른쪽 클릭 → "관리자 권한으로 실행"을 선택하세요.
    pause
    exit /b 1
)

echo ========================================
echo 🔥 Safari-for-Safety 방화벽 설정
echo ========================================
echo.

echo [1/2] Backend 포트 5000 방화벽 규칙 추가 중...
netsh advfirewall firewall add rule name="Safari Backend Port 5000" dir=in action=allow protocol=TCP localport=5000 >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Backend 포트 5000 규칙 추가됨
) else (
    echo ⚠️  규칙이 이미 존재하거나 추가 실패
)

echo.
echo [2/2] Frontend 포트 3000 방화벽 규칙 추가 중...
netsh advfirewall firewall add rule name="Safari Frontend Port 3000" dir=in action=allow protocol=TCP localport=3000 >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Frontend 포트 3000 규칙 추가됨
) else (
    echo ⚠️  규칙이 이미 존재하거나 추가 실패
)

echo.
echo ========================================
echo ✅ 방화벽 설정 완료!
echo ========================================
echo.
echo 이제 다른 기기에서 접속할 수 있습니다:
echo.
echo 🌐 같은 네트워크 (WiFi):
echo    http://203.234.62.145:3000
echo.
echo 💡 외부 인터넷 접속은 공유기 포트포워딩이 필요합니다.
echo    자세한 내용: HOW_TO_SHARE.md 참조
echo ========================================
pause
