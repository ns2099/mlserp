# 🏠 Localhost Kurulum Rehberi

## ✅ Yapılan Değişiklikler

1. ✅ Database: PostgreSQL → SQLite'a geri döndürüldü
2. ✅ Gereksiz deploy dosyaları silindi
3. ✅ Build komutları düzeltildi
4. ✅ Vercel ayarları kaldırıldı

---

## 🔧 Kurulum Adımları

### 1. .env Dosyasını Güncelleyin

Proje klasöründe `.env` dosyasını oluşturun veya güncelleyin:

```env
# SQLite Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="mls-makina-secret-key-2024"

# Email (Opsiyonel - eğer email göndermek istiyorsanız)
SMTP_HOST=smtp.brevo.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-password
SMTP_SECURE=false
SMTP_FROM=noreply@example.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 2. Database'i Hazırlayın

**CMD'de çalıştırın (PowerShell'de değil):**

```cmd
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

---

### 3. Sunucuyu Başlatın

```cmd
npm run dev
```

---

### 4. Giriş Yapın

Tarayıcıda http://localhost:3000/login adresine gidin:

- **Kullanıcı Adı:** `admin`
- **Şifre:** `admin123`

---

## 🔄 Database'i Sıfırlamak İsterseniz

```cmd
npx prisma migrate reset
npx prisma migrate dev
npx tsx prisma/seed.ts
```

---

## ✅ Tamamlandı!

Uygulamanız localhost'ta çalışmaya hazır! 🎉

