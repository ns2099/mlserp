# Cloudflare Tunnel URL Görünmüyor - Çözüm

## Sorun
Tunnel çalışıyor ama URL görünmüyor. Bu, ingress yapılandırmasının Cloudflare Dashboard'dan yapılmadığı anlamına gelir.

## Çözüm: Cloudflare Dashboard Üzerinden Ingress Ekleme

### Adım 1: Cloudflare Dashboard'a Giriş
1. https://dash.cloudflare.com adresine gidin
2. Hesabınıza giriş yapın
3. Domain'inizi seçin: `mlsmakina.com.tr`

### Adım 2: Zero Trust'a Git
1. Sol menüden **"Zero Trust"** seçeneğine tıklayın
   - Eğer Zero Trust görünmüyorsa: **"Access"** > **"Tunnels"** seçeneğine gidin

### Adım 3: Tunnel'ı Bul ve Yapılandır
1. Tunnel listesinde **"mlsmakina-tunnel"** tunnel'ını bulun
2. Tunnel'a tıklayın
3. **"Configure"** sekmesine gidin

### Adım 4: Public Hostname Ekle
1. **"Public Hostname"** bölümüne gidin
2. **"Add a public hostname"** butonuna tıklayın
3. Şu bilgileri girin:
   - **Subdomain:** `mlsmakinaurunyonetim`
   - **Domain:** `mlsmakina.com.tr` (dropdown'dan seçin)
   - **Service Type:** `HTTP`
   - **URL:** `localhost:3000`
4. **"Save hostname"** butonuna tıklayın

### Adım 5: Tunnel'ı Yeniden Başlat
1. Mevcut tunnel'ı durdurun (Ctrl+C)
2. Tunnel'ı yeniden başlatın:
   ```powershell
   cloudflared tunnel run mlsmakina-tunnel
   ```

### Adım 6: URL'i Kontrol Et
Tunnel başladığında şu çıktıyı görmelisiniz:
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at:                                         |
|  https://mlsmakinaurunyonetim.mlsmakina.com.tr                                            |
+--------------------------------------------------------------------------------------------+
```

## Alternatif: Config Dosyası ile (Eğer Dashboard Çalışmazsa)

Config dosyası zaten oluşturuldu ama tunnel onu okumuyor olabilir. Şunu deneyin:

1. **Tunnel'ı durdurun** (Ctrl+C)

2. **Config dosyasını kontrol edin:**
   ```powershell
   Get-Content "$env:USERPROFILE\.cloudflared\config.yml"
   ```

3. **Tunnel'ı config ile başlatın:**
   ```powershell
   cloudflared tunnel --config "$env:USERPROFILE\.cloudflared\config.yml" run
   ```

## DNS Kontrolü

DNS kaydının doğru olduğundan emin olun:

1. Cloudflare Dashboard > DNS sekmesine gidin
2. `mlsmakinaurunyonetim` için bir CNAME kaydı olmalı
3. Eğer yoksa, şunu ekleyin:
   - **Type:** CNAME
   - **Name:** mlsmakinaurunyonetim
   - **Target:** `f296d465-b827-4621-b742-c593d9d16cdd.cfargotunnel.com`
   - **Proxy:** Proxied (turuncu bulut) ✅

## Sorun Devam Ederse

1. **Tunnel loglarını kontrol edin:**
   - Tunnel çalışırken hata mesajları var mı?
   - "ingress" ile ilgili hata var mı?

2. **Tunnel'ı tamamen yeniden oluşturun:**
   ```powershell
   # Eski tunnel'ı sil
   cloudflared tunnel delete mlsmakina-tunnel
   
   # Yeni tunnel oluştur
   cloudflared tunnel create mlsmakina-tunnel
   
   # DNS route ekle
   cloudflared tunnel route dns mlsmakina-tunnel mlsmakinaurunyonetim.mlsmakina.com.tr
   
   # Tunnel'ı başlat
   cloudflared tunnel run mlsmakina-tunnel
   ```

3. **Cloudflare Dashboard'dan ingress ekleyin** (yukarıdaki Adım 4)














