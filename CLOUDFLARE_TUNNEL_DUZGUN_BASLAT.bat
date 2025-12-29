@echo off
echo ========================================
echo Cloudflare Tunnel Duzgun Baslatma
echo ========================================
echo.
echo Uygulamanizin localhost:3000'de calistigindan emin olun!
echo.
echo Test ediliyor...
curl http://localhost:3000 -s -o nul
if %errorlevel% neq 0 (
    echo HATA: localhost:3000'de uygulama calismiyor!
    echo Lutfen once 'npm run dev' ile uygulamayi baslatin.
    pause
    exit /b 1
)
echo OK: Uygulama localhost:3000'de calisiyor.
echo.
echo Tunnel baslatiliyor...
echo.
echo URL ekranda gorunecek, lutfen bekleyin...
echo.

REM Quick tunnel baslat (otomatik URL verir)
cloudflared tunnel --url http://localhost:3000

pause














