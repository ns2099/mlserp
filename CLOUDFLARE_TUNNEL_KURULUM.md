# Cloudflare Tunnel Kurulum Rehberi

## Sorun
DNS_PROBE_FINISHED_NXDOMAIN hatası alıyorsunuz. Bu, Cloudflare Tunnel'in düzgün kurulmadığı veya çalışmadığı anlamına gelir.

## Adım 1: Cloudflare Tunnel Kurulumu

### Windows için:

1. **Cloudflare Tunnel'ı indirin:**
   - https://github.com/cloudflare/cloudflared/releases adresine gidin
   - Windows için `cloudflared-windows-amd64.exe` dosyasını indirin
   - İndirdiğiniz dosyayı `C:\cloudflared\` klasörüne kopyalayın
   - Dosya adını `cloudflared.exe` olarak değiştirin

2. **PATH'e ekleyin:**
   - Windows arama çubuğuna "ortam değişkenleri" yazın
   - "Sistem ortam değişkenlerini düzenle" seçeneğine tıklayın
   - "Ortam Değişkenleri" butonuna tıklayın
   - "Path" değişkenini seçip "Düzenle" yapın
   - "Yeni" butonuna tıklayıp `C:\cloudflared` ekleyin
   - Tüm pencereleri "Tamam" ile kapatın

3. **Kurulumu test edin:**
   ```powershell
   cloudflared --version
   ```
   Versiyon numarası görünmeli.

## Adım 2: Cloudflare Tunnel Oluşturma

### Yöntem 1: Cloudflare Dashboard Üzerinden (Önerilen)

1. **Cloudflare Dashboard'a giriş yapın:**
   - https://dash.cloudflare.com adresine gidin
   - Hesabınıza giriş yapın

2. **Zero Trust'a gidin:**
   - Sol menüden "Zero Trust" seçeneğine tıklayın
   - Eğer Zero Trust yoksa, "Add a Site" yerine "Access" > "Tunnels" seçeneğine gidin

3. **Yeni Tunnel oluşturun:**
   - "Create a tunnel" butonuna tıklayın
   - Tunnel adı: `mlsmakina-tunnel` (veya istediğiniz bir isim)
   - "Save tunnel" butonuna tıklayın

4. **Token'ı kopyalayın:**
   - Oluşturulan tunnel için bir token gösterilecek
   - Bu token'ı kopyalayın ve güvenli bir yere kaydedin
   - Token şuna benzer: `eyJhIjoi...` (uzun bir string)

5. **Tunnel'ı yapılandırın:**
   - Tunnel'ı seçin
   - "Configure" sekmesine gidin
   - "Public Hostname" bölümünde:
     - **Subdomain:** `mlsmakinaurunyonetim` (veya istediğiniz subdomain)
     - **Domain:** `mlsmakina.com.tr` (kendi domain'iniz)
     - **Service Type:** `HTTP`
     - **URL:** `localhost:3000` (veya uygulamanızın çalıştığı port)
   - "Save hostname" butonuna tıklayın

### Yöntem 2: Komut Satırından

1. **Cloudflare'e giriş yapın:**
   ```powershell
   cloudflared tunnel login
   ```
   - Tarayıcı açılacak, Cloudflare hesabınızla giriş yapın
   - Giriş yaptıktan sonra komut satırına dönün

2. **Tunnel oluşturun:**
   ```powershell
   cloudflared tunnel create mlsmakina-tunnel
   ```

3. **Tunnel ID'yi not edin:**
   - Komut çıktısında bir Tunnel ID göreceksiniz
   - Bu ID'yi kopyalayın

4. **Config dosyası oluşturun:**
   `C:\Users\ENES\.cloudflared\config.yml` dosyasını oluşturun (veya düzenleyin):

   ```yaml
   tunnel: <TUNNEL_ID_BURAYA>
   credentials-file: C:\Users\ENES\.cloudflared\<TUNNEL_ID>.json

   ingress:
     - hostname: mlsmakinaurunyonetim.mlsmakina.com.tr
       service: http://localhost:3000
     - service: http_status:404
   ```

   **ÖNEMLİ:** `<TUNNEL_ID_BURAYA>` yerine gerçek Tunnel ID'nizi yazın.

5. **Route ekleyin:**
   ```powershell
   cloudflared tunnel route dns mlsmakina-tunnel mlsmakinaurunyonetim.mlsmakina.com.tr
   ```

## Adım 3: Tunnel'ı Çalıştırma

### Yöntem 1: Manuel Çalıştırma

1. **Uygulamanızı başlatın:**
   ```powershell
   cd C:\Users\ENES\Desktop\mlsmakinanet
   npm run dev
   ```

2. **Yeni bir PowerShell penceresi açın ve tunnel'ı başlatın:**
   ```powershell
   cloudflared tunnel run mlsmakina-tunnel
   ```

   VEYA config dosyası kullanıyorsanız:
   ```powershell
   cloudflared tunnel --config C:\Users\ENES\.cloudflared\config.yml run
   ```

### Yöntem 2: Windows Servisi Olarak (Önerilen)

1. **Tunnel'ı servis olarak yükleyin:**
   ```powershell
   cloudflared service install
   ```

2. **Servisi başlatın:**
   ```powershell
   net start cloudflared
   ```

3. **Servis durumunu kontrol edin:**
   ```powershell
   sc query cloudflared
   ```

## Adım 4: Test Etme

1. **Uygulamanızın çalıştığından emin olun:**
   ```powershell
   # Yeni bir PowerShell penceresi
   curl http://localhost:3000
   ```
   Başarılı yanıt almalısınız.

2. **Cloudflare Tunnel'ın çalıştığını kontrol edin:**
   - Tunnel çalışırken şu çıktıyı görmelisiniz:
   ```
   +--------------------------------------------------------------------------------------------+
   |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
   |  https://mlsmakinaurunyonetim.mlsmakina.com.tr                                             |
   +--------------------------------------------------------------------------------------------+
   ```

3. **Tarayıcıdan test edin:**
   - Gizli sekme açın
   - `https://mlsmakinaurunyonetim.mlsmakina.com.tr` adresine gidin
   - Login sayfası görünmeli

## Sorun Giderme

### DNS hatası devam ediyorsa:

1. **DNS cache'i temizleyin:**
   ```powershell
   ipconfig /flushdns
   ```

2. **Tunnel'ın çalıştığını kontrol edin:**
   ```powershell
   cloudflared tunnel list
   ```

3. **Tunnel loglarını kontrol edin:**
   - Tunnel çalışırken hata mesajları görüyorsanız, logları kontrol edin
   - Cloudflare Dashboard'dan tunnel durumunu kontrol edin

4. **Domain DNS ayarlarını kontrol edin:**
   - Cloudflare Dashboard > DNS sekmesine gidin
   - `mlsmakinaurunyonetim` için bir CNAME kaydı olmalı
   - Bu kayıt otomatik oluşturulmalı, yoksa manuel ekleyin:
     - **Type:** CNAME
     - **Name:** mlsmakinaurunyonetim
     - **Target:** `<TUNNEL_ID>.cfargotunnel.com`
     - **Proxy:** Proxied (turuncu bulut)

### Tunnel bağlantı hatası:

1. **Port'un açık olduğundan emin olun:**
   - Windows Firewall'da port 3000'in açık olduğundan emin olun
   - Uygulamanızın gerçekten `localhost:3000`'de çalıştığını kontrol edin

2. **Tunnel token'ını kontrol edin:**
   - Token'ın doğru olduğundan emin olun
   - Token süresi dolmuş olabilir, yeni token oluşturun

### SSL/TLS hatası:

- Cloudflare Tunnel otomatik olarak SSL sağlar
- Eğer SSL hatası alıyorsanız, Cloudflare Dashboard'da SSL/TLS ayarlarını kontrol edin
- SSL modu "Full" veya "Full (strict)" olmalı

## Otomatik Başlatma (Opsiyonel)

Tunnel'ın her bilgisayar açıldığında otomatik başlaması için:

1. **Windows Görev Zamanlayıcı'yı kullanın:**
   - Windows arama çubuğuna "görev zamanlayıcı" yazın
   - "Görev Oluştur" seçeneğine tıklayın
   - **Genel sekmesi:**
     - Ad: Cloudflare Tunnel
     - "Kullanıcı oturum açtığında çalıştır" seçeneğini işaretleyin
   - **Eylemler sekmesi:**
     - "Yeni" butonuna tıklayın
     - Program: `C:\cloudflared\cloudflared.exe`
     - Bağımsız değişkenler: `tunnel run mlsmakina-tunnel`
   - "Tamam" ile kaydedin

## Önemli Notlar

1. **Tunnel çalışırken uygulamanız da çalışmalı**
2. **Tunnel'ı kapatırsanız, dışarıdan erişim kesilir**
3. **Tunnel token'ını kimseyle paylaşmayın**
4. **Domain'in Cloudflare'de yönetildiğinden emin olun**

## Hızlı Başlangıç Komutları

```powershell
# 1. Uygulamayı başlat (bir PowerShell penceresi)
cd C:\Users\ENES\Desktop\mlsmakinanet
npm run dev

# 2. Tunnel'ı başlat (başka bir PowerShell penceresi)
cloudflared tunnel run mlsmakina-tunnel
```

Her iki komut da çalışırken, `https://mlsmakinaurunyonetim.mlsmakina.com.tr` adresinden erişebilirsiniz.














