# 🗄️ Railway Database Migration Rehberi

## ⚠️ Sorun: Database Migration Yapılmamış

Uygulama başlamıyor çünkü database migration yapılmamış.

## ✅ Hızlı Çözüm

### Yöntem 1: Railway Terminal'de Manuel Migration (Hemen)

1. **Railway Dashboard** → Projeniz
2. **Deploy Logs** sekmesine gidin
3. **Terminal** sekmesine tıklayın
4. Şu komutları çalıştırın:

```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

### Yöntem 2: Otomatik Migration (Sonraki Deploy'da)

`railway.json` dosyasına migration eklendi. Bir sonraki deploy'da otomatik çalışacak.

## 🔧 Railway'de SQLite Kullanımı

SQLite Railway'de dosya sistemi kullanır. Migration için:

```bash
# Migration yapmak için (production)
npx prisma migrate deploy

# VEYA database'i sıfırdan oluşturmak için
npx prisma db push
npx tsx prisma/seed.ts
```

## 📝 Kontrol Listesi

- [ ] Railway terminal'de migration yapıldı
- [ ] Database seed edildi
- [ ] Uygulama yeniden deploy edildi
- [ ] Site çalışıyor

## 🚀 Yeniden Deploy

Migration yaptıktan sonra:

1. Railway Dashboard → Projeniz → **Settings** → **Deploy** → **Redeploy**
2. VEYA GitHub'a yeni commit push edin

## 💡 İpucu: PostgreSQL'e Geçiş (Önerilir)

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



