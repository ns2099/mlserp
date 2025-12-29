# Email Kurulumu ve İlk Giriş Şifre Değiştirme

## Kurulum Adımları

### 1. Migration Çalıştırma

PowerShell execution policy sorunu nedeniyle CMD kullanın:

```cmd
cd C:\Users\ENES\Desktop\mlsmakina
npx prisma migrate dev --name add_user_email_and_password_reset
```

### 2. Nodemailer Kurulumu

```cmd
npm install nodemailer @types/nodemailer
```

### 3. Environment Variables (.env)

`.env` dosyanıza şu değişkenleri ekleyin:

```env
# Email Configuration (Gmail için)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Gmail App Password Oluşturma

1. Google hesabınıza giriş yapın
2. [Google Account Security](https://myaccount.google.com/security) sayfasına gidin
3. "2-Step Verification" aktif olmalı
4. "App passwords" bölümüne gidin
5. Yeni bir app password oluşturun
6. Bu password'ü `SMTP_PASS` olarak `.env` dosyasına ekleyin

### 5. Seed Script Çalıştırma

```cmd
npm run db:seed
```

Bu komut "enes" kullanıcısını `nsalkan99@gmail.com` email adresi ile oluşturacak.

## Kullanım

### İlk Giriş Akışı

1. Kullanıcı `enes` / `mls123` ile giriş yapar
2. Sistem ilk giriş olduğunu algılar
3. Otomatik olarak `nsalkan99@gmail.com` adresine şifre sıfırlama email'i gönderilir
4. Kullanıcı email'deki linke tıklar
5. Şifre değiştirme sayfası açılır
6. Yeni şifre belirlenir
7. Artık yeni şifre ile giriş yapabilir
8. Eski şifre (`mls123`) artık çalışmaz

### Özellikler

- ✅ İlk giriş kontrolü
- ✅ Otomatik email gönderimi
- ✅ Token tabanlı güvenli şifre sıfırlama
- ✅ 24 saatlik token geçerliliği
- ✅ Şifre değiştirildikten sonra eski şifre çalışmaz
- ✅ Modern ve kullanıcı dostu arayüz

## Sorun Giderme

### Email Gönderilmiyor

1. `.env` dosyasındaki SMTP bilgilerini kontrol edin
2. Gmail App Password'ün doğru olduğundan emin olun
3. 2-Step Verification'ın aktif olduğunu kontrol edin
4. Console loglarını kontrol edin

### Token Geçersiz

- Token 24 saat geçerlidir
- Her girişte yeni token oluşturulur
- Eski token'lar otomatik olarak geçersiz hale gelir

### Migration Hatası

Eğer migration çalışmazsa, manuel olarak schema'yı güncelleyin:

```sql
ALTER TABLE User ADD COLUMN email TEXT;
ALTER TABLE User ADD COLUMN ilkGirisVarmi BOOLEAN DEFAULT 0;
ALTER TABLE User ADD COLUMN sifreSifirlamaToken TEXT;
ALTER TABLE User ADD COLUMN sifreSifirlamaTarih DATETIME;
```




