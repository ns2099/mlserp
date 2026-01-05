# 🚀 mlserp.com Deploy Rehberi - Railway ile

Railway, SQLite ile çalışır ve domain bağlama çok kolaydır. En basit ve hızlı çözüm!

## 📋 Ön Hazırlık

### 1. GitHub'a Push Edin

```bash
# Git repository oluşturun (eğer yoksa)
git init
git add .
git commit -m "Initial commit"

# GitHub'da yeni repository oluşturun, sonra:
git remote add origin https://github.com/KULLANICI_ADINIZ/mlserp.git
git branch -M main
git push -u origin main
```

**ÖNEMLİ:** `.env` dosyasını `.gitignore`'a ekleyin (zaten ekli olmalı)

## 🌐 Siteye Erişim

### Şu An Erişim:
Railway Dashboard → Projeniz → **Settings** → **Networking** bölümünde Railway'in otomatik oluşturduğu URL'i görebilirsiniz:
- Örnek: `https://your-project.up.railway.app`

### Custom Domain (mlserp.com) Bağlama:

1. **Railway Dashboard'da:**
   - Projenize tıklayın
   - **Settings** → **Networking** sekmesine gidin
   - **Custom Domain** bölümünde **"Add Custom Domain"** tıklayın
   - `mlserp.com` yazın ve ekleyin
   - Railway size bir CNAME kaydı verecek (örnek: `xxxxx.up.railway.app`)

2. **Natrod DNS Panelinde:**
   - DNS yönetim paneline girin
   - Şu kayıtları ekleyin:
     ```
     Type: CNAME
     Name: @ (veya boş)
     Value: Railway'in verdiği CNAME değeri
     
     Type: CNAME  
     Name: www
     Value: Railway'in verdiği CNAME değeri
     ```

3. **DNS yayılması:** 5-30 dakika sürebilir

4. **SSL Sertifikası:** Railway otomatik olarak Let's Encrypt SSL sertifikası sağlar

## 🚂 Railway ile Deploy (5 Dakika)

### Adım 1: Railway Hesabı Oluşturun

1. https://railway.app adresine gidin
2. "Start a New Project" tıklayın
3. GitHub ile giriş yapın
4. Ücretsiz planı seçin ($5 kredi veriyorlar)

### Adım 2: Projeyi Deploy Edin

1. Railway dashboard'da **"New Project"** tıklayın
2. **"Deploy from GitHub repo"** seçin
3. GitHub repository'nizi seçin
4. Railway otomatik olarak Next.js'i algılayacak

### Adım 3: Environment Variables Ayarlayın

Railway dashboard'da projenize tıklayın → **Variables** sekmesine gidin:

```env
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_URL=https://mlserp.com
NEXTAUTH_SECRET=mlserp-secret-key-2024-rastgele-uzun-bir-anahtar-buraya
NEXT_PUBLIC_APP_URL=https://mlserp.com
```

**ÖNEMLİ:** `NEXTAUTH_SECRET` için güçlü bir anahtar oluşturun:
```bash
# PowerShell'de:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### Adım 4: Build Ayarları

Railway otomatik olarak algılar, ama kontrol edin:

**Settings** → **Build Command:**
```
npm install && npx prisma generate && npm run build
```

**Start Command:**
```
npm start
```

### Adım 5: Domain Bağlama (mlserp.com)

1. Railway dashboard'da projenize tıklayın
2. **Settings** → **Domains** sekmesine gidin
3. **"Custom Domain"** tıklayın
4. `mlserp.com` yazın ve **"Add"** tıklayın
5. Railway size DNS kayıtlarını verecek

### Adım 6: DNS Ayarları (Natrod)

1. Natrod DNS yönetim paneline gidin
2. mlserp.com için şu kayıtları ekleyin:

**A Record:**
```
Type: A
Name: @
Value: [Railway'den verilen IP adresi]
TTL: 3600
```

**CNAME Record (www için):**
```
Type: CNAME
Name: www
Value: [Railway'den verilen CNAME değeri]
TTL: 3600
```

**VEYA Railway'in verdiği CNAME kaydını kullanın** (daha kolay)

### Adım 7: SSL Sertifikası

Railway otomatik olarak SSL sertifikası sağlar (Let's Encrypt). 5-10 dakika içinde aktif olur.

### Adım 8: Database Seed

İlk deploy'dan sonra Railway'de **"Deploy Logs"** sekmesinde terminal açın:

```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

VEYA Railway'de **"New"** → **"Database"** → **"Add PostgreSQL"** ekleyip SQLite yerine PostgreSQL kullanabilirsiniz (önerilir).

## ✅ Kontrol Listesi

- [ ] GitHub'a push edildi
- [ ] Railway'de proje oluşturuldu
- [ ] Environment variables ayarlandı
- [ ] Domain bağlandı (mlserp.com)
- [ ] DNS kayıtları eklendi
- [ ] SSL aktif (https://mlserp.com)
- [ ] Database seed edildi
- [ ] Site çalışıyor!

## 🔧 Alternatif: PostgreSQL'e Geçiş (Önerilir)

SQLite production için ideal değil. PostgreSQL'e geçmek isterseniz:

1. Railway'de **"New"** → **"Database"** → **"Add PostgreSQL"** tıklayın
2. PostgreSQL'in `DATABASE_URL`'ini kopyalayın
3. Environment variables'da `DATABASE_URL`'i güncelleyin
4. `prisma/schema.prisma` dosyasında:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. Railway terminal'de:
   ```bash
   npx prisma migrate deploy
   npx tsx prisma/seed.ts
   ```

## 🐛 Sorun Giderme

### "Build failed" hatası
- Railway logs'u kontrol edin
- `package.json`'daki build script'ini kontrol edin

### "Database not found" hatası
- Environment variables'da `DATABASE_URL` kontrol edin
- Railway terminal'de `npx prisma migrate deploy` çalıştırın

### Domain çalışmıyor
- DNS kayıtlarının yayılması 24-48 saat sürebilir
- Railway'de domain durumunu kontrol edin
- DNS propagation kontrolü: https://www.whatsmydns.net

## 💰 Maliyet

- **Railway Ücretsiz Plan:** $5 kredi/ay (yeterli)
- **Domain:** Natrod'da aldığınız fiyat
- **Toplam:** ~$0-10/ay

## 🎉 Başarılı!

Site artık https://mlserp.com adresinden erişilebilir!

