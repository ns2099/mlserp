# 🚀 Hızlı Başlangıç - Giriş Sorunu Çözümü

## ⚡ Hızlı Çözüm (3 Adım)

### 1️⃣ .env Dosyasını Oluşturun

Proje klasöründe `.env` adında bir dosya oluşturun ve şunu yazın:

```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="mls-makina-secret-key-2024"
```

### 2️⃣ Veritabanını Hazırlayın

Terminal'de (PowerShell veya CMD) şu komutları sırayla çalıştırın:

```bash
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

### 3️⃣ Giriş Yapın

Tarayıcıda http://localhost:3000/login adresine gidin ve:

- **Kullanıcı Adı:** `admin`
- **Şifre:** `admin123`

---

## 🔧 Alternatif: Otomatik Kontrol

Eğer yukarıdaki adımlar çalışmazsa:

```bash
npm run check-db
```

Bu komut veritabanını kontrol eder ve admin kullanıcısı yoksa otomatik oluşturur.

---

## ❓ Sorun Giderme

### "npm komutu bulunamadı" hatası

Node.js yüklü değil. Şu adresten yükleyin:
https://nodejs.org/

### "NEXTAUTH_SECRET is not set" hatası

`.env` dosyasını oluşturduğunuzdan ve sunucuyu yeniden başlattığınızızdan emin olun.

### "Kullanıcı adı veya şifre hatalı" hatası

1. `npm run check-db` komutunu çalıştırın
2. Veya `npx tsx prisma/seed.ts` komutunu çalıştırın
3. Sunucuyu yeniden başlatın (`Ctrl+C` sonra `npm run dev`)

### Veritabanı hatası

```bash
npx prisma migrate reset
npx prisma migrate dev
npx tsx prisma/seed.ts
```

---

## 📞 Hala Çalışmıyor mu?

1. Terminal'de hata mesajlarını kontrol edin
2. `.env` dosyasının proje klasöründe olduğundan emin olun
3. `prisma/dev.db` dosyasının var olduğunu kontrol edin
4. Sunucuyu tamamen kapatıp yeniden başlatın

