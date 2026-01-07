# 🔒 HTTPS/SSL Sertifikası Çözümü - Railway

## ✅ Railway Otomatik SSL Sağlar

Railway custom domain için **otomatik olarak Let's Encrypt SSL sertifikası** sağlar. Manuel bir şey yapmanıza gerek yok!

## 🔍 Kontrol Adımları

### 1️⃣ Railway'de Domain Durumunu Kontrol Edin

1. **Railway Dashboard** → Projeniz → **Settings** → **Networking**
2. **Custom Domain** bölümünde `mlserp.com` domain'inin durumunu kontrol edin
3. Şu durumları görebilirsiniz:
   - ✅ **Active** - Domain bağlı ve SSL aktif
   - ⏳ **Pending** - DNS yayılması bekleniyor
   - ❌ **Failed** - DNS ayarları yanlış

### 2️⃣ DNS Ayarlarını Kontrol Edin

Natrod DNS panelinde şu kayıtlar olmalı:

```
Type: CNAME
Name: @ (veya boş)
Value: [Railway'in verdiği CNAME değeri]

Type: CNAME
Name: www
Value: [Railway'in verdiği CNAME değeri]
```

### 3️⃣ SSL Sertifikası Bekleme Süresi

- **DNS yayılması:** 5-30 dakika
- **SSL sertifikası oluşturma:** 5-10 dakika (DNS yayıldıktan sonra)
- **Toplam:** 10-40 dakika

## 🚀 Hızlı Çözüm

### Eğer Domain Henüz Bağlanmadıysa:

1. **Railway Dashboard** → Projeniz → **Settings** → **Networking**
2. **"Add Custom Domain"** tıklayın
3. `mlserp.com` yazın ve ekleyin
4. Railway size bir CNAME kaydı verecek
5. Natrod DNS panelinde bu CNAME kaydını ekleyin
6. 10-40 dakika bekleyin

### Eğer Domain Bağlı Ama SSL Yoksa:

1. Railway Dashboard'da domain durumunu kontrol edin
2. Eğer "Pending" durumundaysa, DNS yayılmasını bekleyin
3. Eğer "Failed" durumundaysa, DNS kayıtlarını kontrol edin

## 🔧 Manuel SSL Kontrolü

Railway SSL sertifikasını otomatik sağlar ama bazen yeniden oluşturulması gerekebilir:

1. Railway Dashboard → Projeniz → **Settings** → **Networking**
2. Domain'in yanındaki **⋮** (üç nokta) menüsüne tıklayın
3. **"Refresh SSL"** veya **"Re-provision SSL"** seçeneğini seçin
4. 5-10 dakika bekleyin

## ✅ Kontrol Listesi

- [ ] Railway'de custom domain eklendi (`mlserp.com`)
- [ ] DNS kayıtları doğru (CNAME)
- [ ] DNS yayılması tamamlandı (30 dakika beklendi)
- [ ] Railway Dashboard'da domain durumu "Active"
- [ ] `https://mlserp.com` çalışıyor
- [ ] Tarayıcıda yeşil kilit simgesi görünüyor

## 🐛 Sorun Giderme

### "Güvenli değil" uyarısı görüyorum
- DNS yayılması için daha fazla bekleyin (30-60 dakika)
- Railway Dashboard'da domain durumunu kontrol edin
- SSL sertifikasını yenileyin (yukarıdaki adımlar)

### SSL sertifikası oluşturulmuyor
- DNS kayıtlarının doğru olduğundan emin olun
- Railway Dashboard'da domain durumunu kontrol edin
- Railway support ile iletişime geçin

### Domain çalışıyor ama SSL yok
- Railway otomatik sağlar, 5-10 dakika bekleyin
- Domain durumunu kontrol edin
- SSL sertifikasını manuel yenileyin

## 💡 İpucu

Railway SSL sertifikasını **otomatik olarak yeniler** (90 günlük Let's Encrypt sertifikaları). Manuel bir şey yapmanıza gerek yok!

## 🎉 Tamamlandı!

SSL sertifikası aktif olduğunda:
- ✅ `https://mlserp.com` çalışacak
- ✅ Tarayıcıda yeşil kilit simgesi görünecek
- ✅ "Güvenli değil" uyarısı kaybolacak


