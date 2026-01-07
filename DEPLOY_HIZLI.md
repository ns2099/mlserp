# ⚡ Hızlı Deploy - mlserp.com (3 Adım)

## 🎯 En Hızlı Yol: Railway

### 1️⃣ GitHub'a Push Edin

```bash
git init
git add .
git commit -m "Deploy to Railway"
git remote add origin https://github.com/KULLANICI_ADINIZ/mlserp.git
git push -u origin main
```

### 2️⃣ Railway'de Deploy Edin

1. https://railway.app → "Start a New Project"
2. GitHub ile giriş yapın
3. Repository'nizi seçin
4. Railway otomatik deploy edecek!

### 3️⃣ Domain Bağlayın

1. Railway → Settings → Domains
2. "Custom Domain" → `mlserp.com` ekleyin
3. Railway'in verdiği DNS kayıtlarını Natrod'a ekleyin
4. 5-10 dakika bekleyin → SSL otomatik aktif!

## 🔑 Environment Variables (Railway'de)

```env
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_URL=https://mlserp.com
NEXTAUTH_SECRET=[Güçlü bir anahtar oluşturun]
NEXT_PUBLIC_APP_URL=https://mlserp.com
```

## ✅ İlk Kurulum (Railway Terminal)

Railway'de projenize tıklayın → "Deploy Logs" → Terminal:

```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

## 🎉 Tamamlandı!

Site https://mlserp.com adresinde yayında!

---

**Detaylı rehber için:** `DEPLOY_MLSERP.md` dosyasına bakın.


