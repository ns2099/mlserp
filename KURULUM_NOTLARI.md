# Kurulum Notları

## Nodemailer Kurulumu

PowerShell execution policy sorunu nedeniyle, CMD (Command Prompt) kullanarak şu komutu çalıştırın:

```cmd
cd C:\Users\ENES\Desktop\mlsmakina
npm install nodemailer @types/nodemailer
```

## Yeni Özellikler

### 1. Email Gönderildi Bilgisi
- İlk giriş yapıldığında, email gönderildiğinde ekranda bilgi mesajı gösterilir
- Email adresi ekranda görüntülenir

### 2. Kayıt Olma Sayfası
- `/kayit` sayfası eklendi
- Kullanıcılar kendi hesaplarını oluşturabilir
- Email adresi opsiyonel
- Şifre göster/gizle özelliği
- Form validasyonu

### 3. Login Sayfası Güncellemeleri
- "Kayıt Ol" linki eklendi
- Email gönderildiğinde bilgi mesajı gösterilir
- Daha iyi kullanıcı deneyimi

## Kullanım

1. **Kayıt Ol**: `/kayit` sayfasından yeni kullanıcı oluşturun
2. **Giriş Yap**: `/login` sayfasından giriş yapın
3. **İlk Giriş**: İlk giriş yapıldığında email gönderilir ve ekranda bilgi gösterilir
4. **Şifre Değiştir**: Email'deki linke tıklayarak şifre değiştirilebilir

## Notlar

- Nodemailer kurulumu zorunludur
- Email göndermek için `.env` dosyasında SMTP ayarları gerekli
- Kayıt olan kullanıcılar için `ilkGirisVarmi` otomatik olarak `true` olur




