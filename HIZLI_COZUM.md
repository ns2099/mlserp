# Prisma Client Hatası - Hızlı Çözüm

## Sorun
`@prisma/client` modülü bulunamıyor veya `prisma://` protokolü hatası alıyorsunuz.

## Çözüm (3 Adım)

### Adım 1: Batch Dosyasını Çalıştırın
`PRISMA_FIX.bat` dosyasına **çift tıklayın** veya CMD'de çalıştırın:
```cmd
PRISMA_FIX.bat
```

Bu dosya şunları yapacak:
1. `npm install` - Eksik modülleri yükler
2. `npx prisma generate` - Prisma client'ı oluşturur
3. `npx prisma migrate deploy` - Migration'ları kontrol eder

### Adım 2: Next.js Sunucusunu Yeniden Başlatın
```cmd
npm run dev
```

### Adım 3: Test Edin
Tarayıcıda `http://localhost:3000/dashboard` adresine gidin.

## Alternatif: Manuel Çözüm

Eğer batch dosyası çalışmazsa, CMD'de (PowerShell değil) şu komutları sırayla çalıştırın:

```cmd
cd C:\Users\ENES\Desktop\mlsmakinanet
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

## Önemli Notlar

- **CMD kullanın**, PowerShell değil (execution policy sorunları olabilir)
- `.env` dosyasının `DATABASE_URL="file:./prisma/dev.db"` içerdiğinden emin olun
- Sunucuyu her zaman yeniden başlatın (`Ctrl+C` sonra `npm run dev`)

## Sorun Devam Ederse

1. `.next` klasörünü silin
2. `node_modules/.prisma` klasörünü silin (varsa)
3. `PRISMA_FIX.bat` dosyasını tekrar çalıştırın













