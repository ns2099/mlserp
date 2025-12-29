# Railway Deploy Rehberi

Bu rehber, MLS Makina projesini Railway'e deploy etmek için adım adım talimatlar içerir.

## Ön Gereksinimler

1. [Railway](https://railway.app) hesabı (GitHub ile giriş yapabilirsiniz)
2. GitHub hesabı
3. Projenin GitHub'a push edilmiş olması

---

## Adım 1: Projeyi GitHub'a Push Et

```bash
# Git repository oluştur (eğer yoksa)
git init

# Tüm dosyaları ekle
git add .

# Commit yap
git commit -m "Initial commit - Railway deploy hazırlığı"

# GitHub'da yeni bir repository oluştur ve bağla
git remote add origin https://github.com/KULLANICI_ADINIZ/mls-makina.git
git branch -M main
git push -u origin main
```

---

## Adım 2: Railway'de Proje Oluştur

1. [Railway.app](https://railway.app) adresine git
2. **"Start a New Project"** butonuna tıkla
3. **"Deploy from GitHub repo"** seç
4. GitHub hesabını bağla ve repository'ni seç
5. **"Deploy Now"** tıkla

---

## Adım 3: PostgreSQL Veritabanı Ekle

1. Railway dashboard'da projeye git
2. **"+ New"** butonuna tıkla
3. **"Database"** → **"Add PostgreSQL"** seç
4. PostgreSQL oluşturulduktan sonra otomatik olarak `DATABASE_URL` environment variable'ı eklenir

---

## Adım 4: Environment Variables Ayarla

Railway dashboard'da:

1. Ana uygulama servisine tıkla
2. **"Variables"** sekmesine git
3. Şu değişkenleri ekle:

```
NEXTAUTH_SECRET=rastgele-uzun-gizli-anahtar-32-karakter-uzerinde
NEXTAUTH_URL=https://proje-adi.up.railway.app
```

**NEXTAUTH_SECRET için güvenli bir değer oluştur:**
```bash
# Terminal'de çalıştır:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Opsiyonel - Email Ayarları (Şifre Sıfırlama için):
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

---

## Adım 5: Veritabanı Migration

Railway otomatik olarak `npm run build` çalıştırır ve bu komut:
- `prisma generate` - Prisma Client oluşturur
- `prisma migrate deploy` - Migration'ları uygular
- `next build` - Next.js uygulamasını derler

**İlk deploy'da migration hatası alırsanız:**

1. Railway dashboard'da **"Deploy"** sekmesine git
2. **"Trigger Deploy"** butonuna tıkla (yeniden deploy)

---

## Adım 6: Admin Kullanıcısı Oluştur

Deploy tamamlandıktan sonra admin kullanıcısı oluşturmak için:

1. Railway dashboard'da uygulamaya tıkla
2. **"Settings"** → **"Execute Command"** 
3. Şu komutu çalıştır:

```bash
npm run create-admin
```

Veya Railway CLI kullanarak:
```bash
railway run npm run create-admin
```

---

## Adım 7: Custom Domain Bağla (Opsiyonel)

1. Railway dashboard'da uygulamaya git
2. **"Settings"** → **"Domains"**
3. **"Add Custom Domain"** tıkla
4. Alan adını gir (örn: `mls.siteadi.com`)
5. DNS ayarlarını yapılandır:
   - **CNAME**: Railway'in verdiği değeri DNS'e ekle
   - Veya **A Record**: Railway IP adresini kullan

---

## Sorun Giderme

### Build Hatası
```bash
# Logs'ları kontrol et
railway logs
```

### Veritabanı Bağlantı Hatası
- PostgreSQL servisinin çalıştığından emin ol
- `DATABASE_URL` environment variable'ın doğru ayarlandığından emin ol

### Prisma Migration Hatası
```bash
# Railway shell'de çalıştır
npx prisma migrate deploy
```

### Uygulama Açılmıyor
- NEXTAUTH_URL'in doğru ayarlandığından emin ol
- NEXTAUTH_SECRET'in ayarlandığından emin ol

---

## Faydalı Komutlar

```bash
# Railway CLI kurulumu
npm install -g @railway/cli

# Giriş yap
railway login

# Proje bağla
railway link

# Logs görüntüle
railway logs

# Ortam değişkenlerini göster
railway variables

# Shell aç
railway shell
```

---

## Maliyet

Railway ücretsiz tier özellikleri:
- $5 kredi / ay
- 500 saat çalışma süresi
- PostgreSQL dahil

Genellikle küçük-orta ölçekli projeler için ücretsiz tier yeterlidir.

---

## Destek

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)

