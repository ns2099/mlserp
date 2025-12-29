@echo off
echo ========================================
echo Cloudflare Quick Tunnel Baslatiliyor...
echo ========================================
echo.
echo Bu yontem otomatik olarak bir URL olusturur.
echo Uygulamanizin localhost:3000'de calistigindan emin olun!
echo.
echo Tunnel baslatiliyor...
echo.

REM Quick tunnel baslat (otomatik URL verir)
cloudflared tunnel --url http://localhost:3000

pause














