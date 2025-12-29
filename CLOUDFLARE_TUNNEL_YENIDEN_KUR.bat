@echo off
echo ========================================
echo Cloudflare Tunnel Yeniden Kurulumu
echo ========================================
echo.
echo Bu script tunnel'i tamamen silip yeniden olusturacak.
echo.
pause

echo.
echo [1/5] Mevcut tunnel'lar durduruluyor...
taskkill /F /IM cloudflared.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/5] Eski tunnel siliniyor (mlsmakina-tunnel)...
cloudflared tunnel delete mlsmakina-tunnel

echo.
echo [3/5] Yeni tunnel olusturuluyor...
cloudflared tunnel create mlsmakina-tunnel

echo.
echo [4/5] DNS route ekleniyor...
cloudflared tunnel route dns mlsmakina-tunnel mlsmakinaurunyonetim.mlsmakina.com.tr

echo.
echo [5/5] Config dosyasi guncelleniyor...
echo tunnel: f296d465-b827-4621-b742-c593d9d16cdd > "%USERPROFILE%\.cloudflared\config.yml"
echo credentials-file: %USERPROFILE%\.cloudflared\f296d465-b827-4621-b742-c593d9d16cdd.json >> "%USERPROFILE%\.cloudflared\config.yml"
echo. >> "%USERPROFILE%\.cloudflared\config.yml"
echo ingress: >> "%USERPROFILE%\.cloudflared\config.yml"
echo   - hostname: mlsmakinaurunyonetim.mlsmakina.com.tr >> "%USERPROFILE%\.cloudflared\config.yml"
echo     service: http://localhost:3000 >> "%USERPROFILE%\.cloudflared\config.yml"
echo   - service: http_status:404 >> "%USERPROFILE%\.cloudflared\config.yml"

echo.
echo ========================================
echo Kurulum tamamlandi!
echo ========================================
echo.
echo Simdi Cloudflare Dashboard'a gidin:
echo 1. https://dash.cloudflare.com
echo 2. Zero Trust ^> Tunnels ^> mlsmakina-tunnel
echo 3. Configure ^> Public Hostname ekleyin:
echo    - Subdomain: mlsmakinaurunyonetim
echo    - Domain: mlsmakina.com.tr
echo    - Service: HTTP
echo    - URL: localhost:3000
echo.
echo Sonra tunnel'i baslatin:
echo cloudflared tunnel run mlsmakina-tunnel
echo.
pause














