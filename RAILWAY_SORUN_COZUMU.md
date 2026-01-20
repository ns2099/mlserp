# 🔧 Railway "Application failed to respond" Hatası Çözümü

## 🚨 Sorun: Application failed to respond

Bu hata genellikle şu sebeplerden olur:
1. Database migration yapılmamış
2. Environment variables eksik/yanlış
3. Uygulama crash olmuş

## ✅ Hızlı Çözüm Adımları

### 1️⃣ Railway Dashboard'da Deploy Loglarını Kontrol Edin

1. Railway Dashboard → Projeniz
2. **Deploy Logs** sekmesine gidin
3. Son deploy'un loglarını kontrol edin
4. Hata mesajlarını okuyun

### 2️⃣ Environment Variables Kontrolü

Railway Dashboard → Projeniz → **Variables** sekmesinde şunlar olmalı:

```env
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_URL=https://mlserp.com
NEXTAUTH_SECRET=[güçlü bir secret key - 32 karakter]
NEXT_PUBLIC_APP_URL=https://mlserp.com
PORT=3000
```

**ÖNEMLİ:** 
- `PORT` Railway otomatik sağlar ama ekleyebilirsiniz
- `NEXTAUTH_SECRET` güçlü olmalı (32+ karakter)

### 3️⃣ Database Migration Yapın

Railway Dashboard → Projeniz → **Deploy Logs** sekmesinde terminal açın veya **Settings** → **Service** → **New Terminal**:

```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

VEYA Railway'de **Settings** → **Deploy** → **Post Deploy Command** ekleyin:
```bash
npx prisma migrate deploy && npx tsx prisma/seed.ts
```

### 4️⃣ Railway'de PostgreSQL Kullanın (Önerilir)

SQLite production için ideal değil. PostgreSQL'e geçin:

1. Railway Dashboard → Projeniz → **New** → **Database** → **Add PostgreSQL**
2. PostgreSQL'in `DATABASE_URL`'ini kopyalayın
3. **Variables** sekmesinde `DATABASE_URL`'i güncelleyin
4. `prisma/schema.prisma` dosyasında:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. Deploy edin ve migration yapın:
   ```bash
   npx prisma migrate deploy
   npx tsx prisma/seed.ts
   ```

### 5️⃣ Start Command Kontrolü

Railway Dashboard → Projeniz → **Settings** → **Deploy**:

**Start Command:**
```
npm start
```

VEYA direkt:
```
node .next/standalone/server.js
```

### 6️⃣ Build Command Kontrolü

Railway Dashboard → Projeniz → **Settings** → **Deploy**:

**Build Command:**
```
npm install && npx prisma generate && npm run build
```

## 🔍 Yaygın Hatalar ve Çözümleri

### "Cannot find module" hatası
- Build başarısız olmuş olabilir
- Deploy loglarını kontrol edin
- `npm install` çalıştığını kontrol edin

### "Database connection failed" hatası
- `DATABASE_URL` doğru mu kontrol edin
- SQLite için: `file:./prisma/dev.db`
- PostgreSQL için: Railway'in verdiği connection string

### "NEXTAUTH_SECRET is not set" hatası
- Environment variables'da `NEXTAUTH_SECRET` ekleyin
- Güçlü bir secret oluşturun (32+ karakter)

### "Port already in use" hatası
- Railway otomatik PORT sağlar
- `PORT` environment variable'ını silin veya Railway'in otomatik sağladığını kullanın

## 📝 Kontrol Listesi

- [ ] Deploy loglarını kontrol ettim
- [ ] Environment variables doğru ayarlandı
- [ ] Database migration yapıldı
- [ ] Database seed edildi
- [ ] Start command doğru (`npm start`)
- [ ] Build command doğru
- [ ] Uygulama yeniden deploy edildi

## 🚀 Yeniden Deploy

1. Railway Dashboard → Projeniz
2. **Settings** → **Deploy** → **Redeploy** tıklayın
3. VEYA GitHub'a yeni commit push edin (otomatik deploy)

## 💡 İpucu: Railway Terminal Kullanın

Railway Dashboard → Projeniz → **Deploy Logs** → **Terminal** sekmesinde:
- Manuel olarak komut çalıştırabilirsiniz
- Database'i kontrol edebilirsiniz
- Logları görebilirsiniz




