# Migration Adımları

## Email Onaylama Sistemi Migration

### 1. CMD (Command Prompt) Açın
PowerShell yerine CMD kullanın çünkü PowerShell execution policy sorunu var.

### 2. Proje Klasörüne Gidin
```cmd
cd C:\Users\ENES\Desktop\mlsmakina
```

### 3. Migration Çalıştırın
```cmd
npx prisma migrate dev --name add_email_verification
```

**ÖNEMLİ:** `cd` ve `npx` komutları ayrı satırlarda olmalı veya `&&` ile birleştirilmelidir.

### Alternatif: Tek Satırda
```cmd
cd C:\Users\ENES\Desktop\mlsmakina && npx prisma migrate dev --name add_email_verification
```

### Eğer Hala Hata Alırsanız

1. **Önce klasöre gidin:**
```cmd
cd C:\Users\ENES\Desktop\mlsmakina
```

2. **Sonra migration çalıştırın:**
```cmd
npx prisma migrate dev --name add_email_verification
```

### Migration Sonrası

Migration başarılı olduktan sonra:
```cmd
npm run dev
```

ile uygulamayı başlatın.

## Schema Değişiklikleri

Bu migration şu değişiklikleri yapacak:
- `email` alanı `unique` yapılacak
- `password` ve `adSoyad` nullable yapılacak
- `emailOnaylandiMi`, `emailOnayToken`, `emailOnayTarih` alanları eklenecek

## Not

Eğer veritabanında mevcut kullanıcılar varsa ve `password` veya `adSoyad` null ise, migration sırasında hata alabilirsiniz. Bu durumda önce mevcut kullanıcıların bu alanlarını doldurmanız gerekebilir.




