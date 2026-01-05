# .env dosyasını ağ erişimi için güncelleme scripti

Write-Host "`n🔧 .env Dosyası Güncelleme`n" -ForegroundColor Cyan

# IP adresini bul
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*" -and
    $_.InterfaceAlias -notlike "*Loopback*"
} | Select-Object IPAddress, InterfaceAlias

if (-not $ipAddresses) {
    Write-Host "❌ IP adresi bulunamadı!" -ForegroundColor Red
    exit 1
}

$ipAddress = $ipAddresses[0].IPAddress
$networkUrl = "http://$ipAddress:3000"

Write-Host "📍 Bulunan IP Adresi: $ipAddress" -ForegroundColor Green
Write-Host "🌐 Ağ URL'i: $networkUrl`n" -ForegroundColor Green

# .env dosyasını oku
$envPath = ".env"

if (-not (Test-Path $envPath)) {
    Write-Host "⚠️  .env dosyası bulunamadı!" -ForegroundColor Yellow
    Write-Host "Lütfen önce .env dosyasını oluşturun.`n" -ForegroundColor Yellow
    exit 1
}

# .env dosyasını oku
$envContent = Get-Content $envPath -Raw

# Yedek oluştur
$backupPath = ".env.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $envPath $backupPath
Write-Host "💾 Yedek oluşturuldu: $backupPath" -ForegroundColor Gray

# Güncellemeleri yap
$updated = $false

# NEXTAUTH_URL güncelle
if ($envContent -match 'NEXTAUTH_URL="?http://localhost:3000"?') {
    $envContent = $envContent -replace 'NEXTAUTH_URL="?http://localhost:3000"?', "NEXTAUTH_URL=`"$networkUrl`""
    $updated = $true
    Write-Host "✅ NEXTAUTH_URL güncellendi" -ForegroundColor Green
} elseif ($envContent -notmatch 'NEXTAUTH_URL=') {
    $envContent += "`nNEXTAUTH_URL=`"$networkUrl`""
    $updated = $true
    Write-Host "✅ NEXTAUTH_URL eklendi" -ForegroundColor Green
}

# NEXT_PUBLIC_APP_URL güncelle
if ($envContent -match 'NEXT_PUBLIC_APP_URL=http://localhost:3000') {
    $envContent = $envContent -replace 'NEXT_PUBLIC_APP_URL=http://localhost:3000', "NEXT_PUBLIC_APP_URL=$networkUrl"
    $updated = $true
    Write-Host "✅ NEXT_PUBLIC_APP_URL güncellendi" -ForegroundColor Green
} elseif ($envContent -notmatch 'NEXT_PUBLIC_APP_URL=') {
    $envContent += "`nNEXT_PUBLIC_APP_URL=$networkUrl"
    $updated = $true
    Write-Host "✅ NEXT_PUBLIC_APP_URL eklendi" -ForegroundColor Green
}

if ($updated) {
    # Dosyayı kaydet
    Set-Content -Path $envPath -Value $envContent -NoNewline
    Write-Host "`n✅ .env dosyası başarıyla güncellendi!`n" -ForegroundColor Green
    Write-Host "📝 Güncellenmiş değerler:" -ForegroundColor Cyan
    Write-Host "   NEXTAUTH_URL=`"$networkUrl`"" -ForegroundColor White
    Write-Host "   NEXT_PUBLIC_APP_URL=$networkUrl`n" -ForegroundColor White
    Write-Host "💡 Şimdi 'npm run dev:network' komutuyla uygulamayı başlatabilirsiniz.`n" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  .env dosyası zaten güncel görünüyor.`n" -ForegroundColor Blue
}

