# 🔧 Railway Healthcheck Başarısız - Çözüm

## ⚠️ Sorun: Healthcheck Failed - Service Unavailable

Build başarılı ama uygulama başlamıyor. Healthcheck `/` path'ine istek atıyor ama yanıt alamıyor.

## ✅ Hızlı Çözüm Adımları

### 1️⃣ Railway Deploy Loglarını Kontrol Edin

1. **Railway Dashboard** → Projeniz
2. **Deploy Logs** sekmesine gidin
3. **Logs** bölümünde hata mesajlarını kontrol edin
4. Özellikle şu hataları arayın:
   - Database connection errors
   - Migration errors
   - Server start errors
   - PORT errors

### 2️⃣ Railway Terminal'de Migration Yapın

1. Railway Dashboard → Projeniz → **Deploy Logs**
2. **Terminal** sekmesine tıklayın
3. Şu komutları çalıştırın:

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 3️⃣ Environment Variables Kontrolü

Railway Dashboard → Projeniz → **Variables** sekmesinde şunlar olmalı:

```env
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_URL=https://mlserp.com
NEXTAUTH_SECRET=[güçlü bir secret - 32 karakter]
NEXT_PUBLIC_APP_URL=https://mlserp.com
PORT=3000
```

**ÖNEMLİ:** `PORT` Railway otomatik sağlar ama ekleyebilirsiniz.

### 4️⃣ Start Script'i Basitleştirin

Eğer start script sorun çıkarıyorsa, direkt server'ı başlatın:

Railway Dashboard → Projeniz → **Settings** → **Deploy** → **Start Command:**

```
node .next/standalone/server.js
```

VEYA migration'ı manuel yaptıktan sonra:

```
npx prisma db push && npx tsx prisma/seed.ts && node .next/standalone/server.js
```

### 5️⃣ Yeniden Deploy

1. Railway Dashboard → Projeniz → **Settings** → **Deploy** → **Redeploy**
2. VEYA GitHub'a yeni commit push edin

## 🔍 Yaygın Sorunlar

### Database Migration Yapılmamış
- Railway terminal'de `npx prisma db push` çalıştırın
- `npx tsx prisma/seed.ts` çalıştırın

### PORT Sorunu
- Railway otomatik PORT sağlar
- Start script'te PORT'u kontrol edin

### Start Script Hatası
- Start script'i basitleştirin
- Direkt `node .next/standalone/server.js` kullanın

### Database Dosyası Yok
- SQLite için database dosyası oluşturulmalı
- `npx prisma db push` çalıştırın

## 📝 Kontrol Listesi

- [ ] Railway deploy loglarını kontrol ettim
- [ ] Hata mesajlarını okudum
- [ ] Railway terminal'de migration yaptım
- [ ] Environment variables doğru ayarlandı
- [ ] Start command kontrol edildi
- [ ] Yeniden deploy edildi
- [ ] Site çalışıyor

## 💡 İpucu: PostgreSQL'e Geçiş

SQLite production için ideal değil. PostgreSQL'e geçmek isterseniz:

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



