# Giriş Sorunu Çözümü

Eğer giriş yapamıyorsanız, aşağıdaki adımları takip edin:

## 1. .env Dosyasını Oluşturun

Proje klasöründe `.env` dosyası oluşturun ve şu içeriği ekleyin:

```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="mls-makina-secret-key-2024-production"
```

## 2. Admin Kullanıcısını Oluşturun

Terminal'de şu komutları çalıştırın:

```bash
# Prisma client'ı oluştur
npx prisma generate

# Admin kullanıcısını oluştur
npx prisma db seed
```

VEYA manuel olarak:

```bash
npx tsx prisma/seed.ts
```

## 3. Giriş Bilgileri

- **Kullanıcı Adı:** `admin`
- **Şifre:** `admin123`

## 4. Eğer Hala Giriş Yapamıyorsanız

### Seçenek A: Prisma Studio ile Manuel Ekleme

```bash
npx prisma studio
```

Prisma Studio açıldığında:
1. `User` tablosuna gidin
2. "Add record" butonuna tıklayın
3. Şu bilgileri girin:
   - username: `admin`
   - password: (bcrypt hash gerekli - aşağıdaki script'i kullanın)
   - adSoyad: `Admin Kullanıcı`
   - yetki: `Yönetici`

### Seçenek B: Node Script ile

Aşağıdaki komutu çalıştırın:

```bash
node scripts/create-admin.js
```

## 5. Şifre Hash Oluşturma

Eğer manuel ekleme yapıyorsanız, şifre hash'i için:

```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('admin123', 10);
console.log(hash);
```

## Sorun Giderme

1. **"NEXTAUTH_SECRET is not set" hatası:**
   - `.env` dosyasının olduğundan emin olun
   - Sunucuyu yeniden başlatın

2. **"User not found" hatası:**
   - Admin kullanıcısının oluşturulduğundan emin olun
   - Veritabanı dosyasının (`prisma/dev.db`) mevcut olduğunu kontrol edin

3. **"Invalid credentials" hatası:**
   - Kullanıcı adı ve şifrenin doğru olduğundan emin olun
   - Şifrenin bcrypt ile hash'lendiğinden emin olun









