# Cloudflare Dashboard - Adım Adım Ingress Ekleme

## ⚠️ ÖNEMLİ: Bu adımları TAM OLARAK takip edin!

### Adım 1: Cloudflare Dashboard'a Giriş
1. Tarayıcınızda **https://dash.cloudflare.com** adresine gidin
2. Cloudflare hesabınızla **giriş yapın**

### Adım 2: Zero Trust'a Git
1. Sol menüde **"Zero Trust"** seçeneğini bulun
   - Eğer görmüyorsanız: Sol altta **"Access"** > **"Tunnels"** seçeneğine tıklayın
   - VEYA: URL'ye direkt gidin: https://one.dash.cloudflare.com/

### Adım 3: Tunnel'ı Bul
1. Tunnel listesinde **"mlsmakina-tunnel"** veya tunnel ID'nizi bulun
2. Tunnel adına **tıklayın** (tunnel ID: `f296d465-b827-4621-b742-c593d9d16cdd`)

### Adım 4: Configure Sekmesi
1. Tunnel detay sayfasında üstteki sekmelerden **"Configure"** sekmesine tıklayın
2. Sayfanın ortasında **"Public Hostname"** bölümünü bulun

### Adım 5: Public Hostname Ekle
1. **"Add a public hostname"** butonuna tıklayın
2. Açılan formda şunları doldurun:

   **Subdomain:**
   ```
   mlsmakinaurunyonetim
   ```
   (Sadece subdomain kısmı, domain değil!)

   **Domain:**
   - Dropdown menüden **"mlsmakina.com.tr"** seçin
   - Eğer görünmüyorsa, domain Cloudflare'de yönetilmiyor demektir

   **Service Type:**
   - **"HTTP"** seçin

   **URL:**
   ```
   localhost:3000
   ```
   (Sadece bu, http:// eklemeyin!)

3. **"Save hostname"** butonuna tıklayın

### Adım 6: Tunnel'ı Yeniden Başlat
1. PowerShell'de mevcut tunnel'ı durdurun (Ctrl+C)
2. Yeni bir PowerShell penceresi açın
3. Şu komutu çalıştırın:
   ```powershell
   cloudflared tunnel run mlsmakina-tunnel
   ```

### Adım 7: URL'i Kontrol Et
Tunnel başladığında şu çıktıyı görmelisiniz:
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at:                                         |
|  https://mlsmakinaurunyonetim.mlsmakina.com.tr                                            |
+--------------------------------------------------------------------------------------------+
```

## ❌ Eğer Hala Çalışmıyorsa

### Alternatif 1: Quick Tunnel (Geçici Çözüm)
Bu yöntem otomatik URL verir ama her başlatışta farklı URL olur:

```powershell
cloudflared tunnel --url http://localhost:3000
```

Çıktıda şuna benzer bir URL göreceksiniz:
```
https://random-name.trycloudflare.com
```

### Alternatif 2: Tunnel'ı Tamamen Yeniden Oluştur
1. `CLOUDFLARE_TUNNEL_YENIDEN_KUR.bat` dosyasına çift tıklayın
2. Adımları takip edin
3. Cloudflare Dashboard'dan ingress ekleyin

### Alternatif 3: Manuel Config ile
Config dosyası zaten var ama Cloudflare Dashboard'dan ingress eklemeden çalışmaz.

**ÖNEMLİ:** Config dosyası yeterli değil, Cloudflare Dashboard'dan **MUTLAKA** ingress eklemeniz gerekiyor!

## 🔍 Sorun Tespiti

### Tunnel çalışıyor mu?
```powershell
Get-Process cloudflared
```
Eğer process görünüyorsa tunnel çalışıyor.

### Uygulama çalışıyor mu?
```powershell
curl http://localhost:3000
```
Başarılı yanıt almalısınız.

### DNS kaydı var mı?
Cloudflare Dashboard > DNS sekmesinde `mlsmakinaurunyonetim` için CNAME kaydı olmalı.

## 📞 Son Çare

Eğer hiçbir şey işe yaramazsa:
1. Cloudflare desteğine başvurun
2. Veya geçici olarak Quick Tunnel kullanın (her başlatışta yeni URL)














