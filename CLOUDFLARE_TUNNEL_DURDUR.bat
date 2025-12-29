@echo off
echo ========================================
echo Cloudflare Tunnel Durduruluyor...
echo ========================================
echo.

REM Tunnel'i durdur
taskkill /F /IM cloudflared.exe 2>nul

if %errorlevel% == 0 (
    echo Tunnel basariyla durduruldu.
) else (
    echo Tunnel zaten calismiyor veya bulunamadi.
)

pause














