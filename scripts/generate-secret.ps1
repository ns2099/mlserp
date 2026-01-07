# NEXTAUTH_SECRET için güçlü anahtar oluşturma scripti

Write-Host "`n🔑 NEXTAUTH_SECRET Oluşturuluyor...`n" -ForegroundColor Cyan

$secret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})

Write-Host "Oluşturulan Secret:" -ForegroundColor Green
Write-Host $secret -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "`nBu değeri Railway environment variables'a ekleyin:`n" -ForegroundColor Yellow
Write-Host "NEXTAUTH_SECRET=$secret`n" -ForegroundColor Gray

# Panoya kopyala
$secret | Set-Clipboard
Write-Host "✅ Secret panoya kopyalandı!`n" -ForegroundColor Green



