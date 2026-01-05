# Windows Firewall'da port 3000'i açma scripti
# Yönetici yetkileri gerektirir

Write-Host "`n🔥 Windows Firewall Yapılandırması`n" -ForegroundColor Cyan

# Yönetici kontrolü
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  Bu script yönetici yetkileri gerektirir!" -ForegroundColor Yellow
    Write-Host "`nLütfen PowerShell'i 'Yönetici olarak çalıştır' ile açın ve tekrar deneyin.`n" -ForegroundColor Yellow
    
    # Alternatif: Manuel talimatlar
    Write-Host "Manuel olarak yapmak için:" -ForegroundColor Gray
    Write-Host "1. Windows Defender Firewall'ı açın" -ForegroundColor Gray
    Write-Host "2. Gelişmiş Ayarlar > Gelen Kuralları" -ForegroundColor Gray
    Write-Host "3. Yeni Kural > Bağlantı Noktası" -ForegroundColor Gray
    Write-Host "4. TCP, Port 3000, Bağlantıya izin ver`n" -ForegroundColor Gray
    
    exit 1
}

try {
    # Mevcut kuralı kontrol et
    $existingRule = Get-NetFirewallRule -DisplayName "Next.js Dev Server" -ErrorAction SilentlyContinue
    
    if ($existingRule) {
        Write-Host "✅ Firewall kuralı zaten mevcut. Güncelleniyor..." -ForegroundColor Green
        Remove-NetFirewallRule -DisplayName "Next.js Dev Server" -ErrorAction SilentlyContinue
    }
    
    # Yeni kural oluştur
    New-NetFirewallRule -DisplayName "Next.js Dev Server" `
        -Direction Inbound `
        -LocalPort 3000 `
        -Protocol TCP `
        -Action Allow `
        -Profile Domain,Private,Public `
        -Description "Next.js development server için port 3000 erişimi"
    
    Write-Host "✅ Firewall kuralı başarıyla oluşturuldu!" -ForegroundColor Green
    Write-Host "`nPort 3000 artık ağdan erişilebilir.`n" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Hata: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nManuel olarak firewall'ı yapılandırmanız gerekebilir.`n" -ForegroundColor Yellow
}

