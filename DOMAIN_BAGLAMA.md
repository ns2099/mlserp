# 🌐 mlserp.com Domain Bağlama Rehberi

## ✅ Deploy Başarılı! Şimdi Domain'i Bağlayalım

### 🚀 Adım 1: Railway'de Custom Domain Ekleme

1. **Railway Dashboard'a gidin:** https://railway.app
2. **Projenize tıklayın**
3. **Settings** sekmesine gidin
4. **Networking** bölümüne gidin
5. **"Custom Domain"** bölümünde **"Add Custom Domain"** butonuna tıklayın
6. `mlserp.com` yazın ve **"Add"** tıklayın
7. Railway size bir **CNAME kaydı** verecek (örnek: `xxxxx.up.railway.app`)
   - Bu CNAME değerini kopyalayın!

### 🔧 Adım 2: Natrod DNS Ayarları

1. **Natrod DNS yönetim paneline gidin**
2. mlserp.com için DNS kayıtlarını düzenleyin
3. Şu kayıtları **ekleyin** veya **güncelleyin**:

#### CNAME Kaydı (Ana Domain):
```
Type: CNAME
Name: @ (veya boş bırakın)
Value: [Railway'in verdiği CNAME değeri - örnek: xxxxx.up.railway.app]
TTL: 3600 (veya otomatik)
```

#### CNAME Kaydı (www için):
```
Type: CNAME
Name: www
Value: [Railway'in verdiği CNAME değeri - aynı değer]
TTL: 3600 (veya otomatik)
```

**ÖNEMLİ:** 
- Eğer `@` kabul etmiyorsa, Name alanını **boş bırakın**
- Bazı DNS sağlayıcıları sadece CNAME kabul eder, bazıları A kaydı ister
- Railway genellikle CNAME kullanır

### ⏳ Adım 3: Bekleme Süresi

- **DNS yayılması:** 5-30 dakika sürebilir
- **SSL sertifikası:** Railway otomatik olarak Let's Encrypt SSL sağlar (5-10 dakika)
- Railway Dashboard'da domain'in durumunu kontrol edebilirsiniz

### ✅ Adım 4: Test Etme

1. **DNS yayıldıktan sonra:**
   - `https://mlserp.com` adresine gidin
   - `https://www.mlserp.com` adresine gidin

2. **SSL kontrolü:**
   - Tarayıcıda yeşil kilit simgesi görünmeli
   - `https://` ile başlamalı

### 🔍 Şu An Erişim (Geçici)

Domain bağlanana kadar Railway'in geçici URL'i ile erişebilirsiniz:

1. Railway Dashboard → Projeniz → **Settings** → **Networking**
2. "Generate Domain" veya mevcut Railway URL'i kullanın
3. Örnek: `https://your-project-name.up.railway.app`

### 🐛 Sorun Giderme

#### Domain çalışmıyor?
- DNS kayıtlarını kontrol edin (CNAME doğru mu?)
- Railway Dashboard'da domain durumunu kontrol edin
- DNS yayılması için 30 dakika bekleyin

#### SSL sertifikası yok?
- Railway otomatik sağlar, 5-10 dakika bekleyin
- Domain'in doğru bağlandığını kontrol edin

#### "Domain not found" hatası?
- DNS kayıtlarının doğru eklendiğinden emin olun
- Natrod panelinde kayıtları kontrol edin

### 📝 Kontrol Listesi

- [ ] Railway'de custom domain eklendi
- [ ] CNAME kaydı kopyalandı
- [ ] Natrod DNS'de CNAME kaydı eklendi (@ için)
- [ ] Natrod DNS'de CNAME kaydı eklendi (www için)
- [ ] DNS yayılması için beklendi (5-30 dakika)
- [ ] SSL sertifikası aktif (Railway otomatik sağlar)
- [ ] https://mlserp.com çalışıyor
- [ ] https://www.mlserp.com çalışıyor

### 🎉 Tamamlandı!

Domain bağlandıktan sonra siteye şu adreslerden erişebilirsiniz:
- **https://mlserp.com**
- **https://www.mlserp.com**

