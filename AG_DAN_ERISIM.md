# 🌐 Ağdan Erişim Rehberi

Bu rehber, lokalinde çalışan uygulamanıza aynı ağdaki başka bilgisayarlardan nasıl erişebileceğinizi açıklar.

## 📋 Adımlar

### 1️⃣ IP Adresinizi Öğrenin

PowerShell'de şu komutu çalıştırın:

```powershell
.\scripts\get-ip-address.ps1
```

VEYA manuel olarak:

```powershell
ipconfig
```

`IPv4 Address` değerini not edin (örnek: `192.168.1.100`)

### 2️⃣ Uygulamayı Ağdan Erişilebilir Modda Başlatın

Normal `npm run dev` yerine şunu kullanın:

```bash
npm run dev:network
```

Bu komut uygulamayı `0.0.0.0` adresinde başlatır ve tüm ağ arayüzlerinden erişilebilir hale getirir.

### 3️⃣ Windows Firewall'ı Yapılandırın

#### Yöntem A: PowerShell ile (Yönetici olarak)

```powershell
New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

#### Yöntem B: Windows Defender Firewall GUI

1. **Windows Defender Firewall**'ı açın
2. **Gelişmiş Ayarlar** > **Gelen Kuralları** seçin
3. **Yeni Kural** > **Bağlantı Noktası**
4. **TCP** seçin, **Belirli yerel bağlantı noktaları**: `3000`
5. **Bağlantıya izin ver** seçin
6. Tüm profilleri seçin
7. İsim: `Next.js Dev Server`

### 4️⃣ .env Dosyasını Güncelleyin

`.env` dosyasında `NEXTAUTH_URL` değerini IP adresinizle güncelleyin:

```env
# Yerel IP adresinizle değiştirin
NEXTAUTH_URL="http://192.168.1.100:3000"
NEXT_PUBLIC_APP_URL=http://192.168.1.100:3000
```

**ÖNEMLİ:** IP adresiniz değiştiğinde bu değerleri güncellemeyi unutmayın!

### 5️⃣ Diğer Bilgisayarlardan Erişin

Aynı ağdaki başka bir bilgisayardan tarayıcıda şu adresi açın:

```
http://[IP-ADRESINIZ]:3000
```

Örnek: `http://192.168.1.100:3000`

## 🔒 Güvenlik Notları

⚠️ **ÖNEMLİ:** Bu yapılandırma sadece yerel ağınız için güvenlidir. İnternet üzerinden erişilebilir hale getirmek için ek güvenlik önlemleri almanız gerekir.

- ✅ Sadece güvendiğiniz ağlarda kullanın
- ✅ Üretim ortamında kullanmayın
- ✅ Hassas veriler için HTTPS kullanın

## 🐛 Sorun Giderme

### "Erişilemiyor" hatası alıyorsanız:

1. **Firewall kontrolü:**
   ```powershell
   Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*3000*"}
   ```

2. **Port kullanımda mı kontrol edin:**
   ```powershell
   netstat -ano | findstr :3000
   ```

3. **IP adresinizi tekrar kontrol edin:**
   ```powershell
   ipconfig
   ```

4. **Uygulamanın doğru modda çalıştığından emin olun:**
   - `npm run dev:network` kullandığınızdan emin olun
   - Terminal'de `-H 0.0.0.0` görünüyor olmalı

### "Connection refused" hatası:

- Windows Firewall'ın portu engellemediğinden emin olun
- Antivirus yazılımının portu engellemediğini kontrol edin

## 📱 Mobil Cihazlardan Erişim

Aynı WiFi ağına bağlı telefon veya tablet'ten de erişebilirsiniz:

```
http://[IP-ADRESINIZ]:3000
```

## ✅ Başarı Kontrolü

Uygulama başarıyla çalışıyorsa, terminal'de şunu görmelisiniz:

```
- Local:        http://localhost:3000
- Network:      http://192.168.1.100:3000
```

"Network" satırı görünüyorsa, ağdan erişim hazırdır! 🎉

