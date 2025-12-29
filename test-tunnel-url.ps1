# Quick tunnel test script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cloudflare Quick Tunnel Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Uygulamanizin localhost:3000'de calistigindan emin olun!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Tunnel baslatiliyor..." -ForegroundColor Green
Write-Host ""

# Quick tunnel baslat (foreground'da calisir, URL'yi gosterir)
cloudflared tunnel --url http://localhost:3000














