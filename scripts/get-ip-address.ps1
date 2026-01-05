# Yerel IP adresini bulma scripti
Write-Host "`n🌐 Ağ IP Adresiniz:`n" -ForegroundColor Cyan

$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*" -and
    $_.InterfaceAlias -notlike "*Loopback*"
} | Select-Object IPAddress, InterfaceAlias

if ($ipAddresses) {
    foreach ($ip in $ipAddresses) {
        Write-Host "  📍 $($ip.IPAddress) - $($ip.InterfaceAlias)" -ForegroundColor Green
    }
    Write-Host "`n💡 Uygulamaya erişmek için:`n" -ForegroundColor Yellow
    Write-Host "   http://$($ipAddresses[0].IPAddress):3000`n" -ForegroundColor White -BackgroundColor DarkBlue
} else {
    Write-Host "  ❌ IP adresi bulunamadı!" -ForegroundColor Red
}

Write-Host "`n📝 Not: Uygulamayı ağdan erişilebilir yapmak için:" -ForegroundColor Gray
Write-Host "   1. npm run dev:network komutunu kullanın" -ForegroundColor Gray
Write-Host "   2. Windows Firewall'da port 3000'i açın`n" -ForegroundColor Gray

