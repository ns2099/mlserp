@echo off
echo ========================================
echo Cloudflare Tunnel Baslatiliyor...
echo ========================================
echo.
echo Uygulamanizin localhost:3000'de calistigindan emin olun!
echo.
pause

REM Config dosyasi ile tunnel'i baslat
cloudflared tunnel --config "%USERPROFILE%\.cloudflared\config.yml" run

pause

