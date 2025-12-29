# SMTP Yapılandırma Kılavuzu

Bu dokümantasyon, farklı SMTP servisleri için yapılandırma örneklerini içerir.

## .env Dosyası Ayarları

Aşağıdaki değişkenleri `.env` dosyanıza ekleyin:

```env
# SMTP Ayarları
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_SECURE=false
SMTP_REJECT_UNAUTHORIZED=true
```

## Popüler SMTP Servisleri

### 1. Brevo (Eski Sendinblue) - ÖNERİLEN

**Avantajlar:** Ücretsiz plan (günde 300 email), kolay kurulum, güvenilir

**Ayarlar:**
```env
SMTP_HOST=smtp.brevo.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-key
SMTP_SECURE=false
```

**Kurulum:**
1. https://www.brevo.com adresinden ücretsiz hesap oluşturun
2. Settings → SMTP & API → SMTP Keys
3. "Generate a new SMTP key" butonuna tıklayın
4. Oluşturulan key'i `SMTP_PASS` olarak kullanın
5. Email adresinizi `SMTP_USER` olarak kullanın

---

### 2. SendGrid

**Avantajlar:** Güvenilir, profesyonel, ücretsiz plan (günde 100 email)

**Ayarlar:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_SECURE=false
```

**Kurulum:**
1. https://sendgrid.com adresinden ücretsiz hesap oluşturun
2. Settings → API Keys → Create API Key
3. Oluşturulan API key'i `SMTP_PASS` olarak kullanın
4. `SMTP_USER` her zaman `apikey` olmalı

---

### 3. Mailgun

**Avantajlar:** Güvenilir, gelişmiş özellikler, ücretsiz plan (ayda 5,000 email)

**Ayarlar:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
SMTP_SECURE=false
```

**Kurulum:**
1. https://www.mailgun.com adresinden ücretsiz hesap oluşturun
2. Sending → Domain Settings → SMTP credentials
3. Kullanıcı adı ve şifreyi kopyalayın

---

### 4. SMTP2GO

**Avantajlar:** Kolay kurulum, ücretsiz plan (ayda 1,000 email)

**Ayarlar:**
```env
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_SECURE=false
```

**Kurulum:**
1. https://www.smtp2go.com adresinden ücretsiz hesap oluşturun
2. Settings → SMTP Users
3. Kullanıcı adı ve şifreyi kopyalayın

---

### 5. Outlook/Hotmail

**Ayarlar:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_SECURE=false
```

**Not:** Outlook için normal şifre kullanabilirsiniz, ancak 2FA açıksa uygulama şifresi gerekebilir.

---

### 6. Yahoo Mail

**Ayarlar:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
```

**Not:** Yahoo için uygulama şifresi gereklidir.

---

### 7. Gmail (Önerilmez - Karmaşık)

**Ayarlar:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
```

**Not:** Gmail için 2 adımlı doğrulama açık olmalı ve uygulama şifresi oluşturulmalıdır. Bu işlem karmaşık olduğu için diğer servisler önerilir.

---

## Port ve Güvenlik Ayarları

- **Port 587:** STARTTLS kullanır (SMTP_SECURE=false)
- **Port 465:** SSL/TLS kullanır (SMTP_SECURE=true)
- **Port 25:** Genellikle engellenir, önerilmez

## Test Etme

Yapılandırmayı test etmek için:

1. `.env` dosyasını güncelleyin
2. Sunucuyu yeniden başlatın
3. Kayıt ol sayfasından bir email göndermeyi deneyin
4. Console loglarını kontrol edin

## Sorun Giderme

### "SMTP kimlik doğrulama hatası" alıyorsanız:

1. Kullanıcı adı ve şifrenin doğru olduğundan emin olun
2. SMTP_HOST değerinin doğru olduğunu kontrol edin
3. Port numarasının doğru olduğunu kontrol edin
4. Firewall veya güvenlik duvarının SMTP portunu engellemediğinden emin olun

### "Connection timeout" alıyorsanız:

1. SMTP_HOST değerini kontrol edin
2. İnternet bağlantınızı kontrol edin
3. SMTP_REJECT_UNAUTHORIZED=false deneyin (güvenlik riski olabilir)

### 8. Mailjet - ÖNERİLEN (Günde 200 Email Ücretsiz)

**Avantajlar:** Günde 200 email ücretsiz, kolay kurulum, güvenilir, SMTP desteği

**Ayarlar:**
```env
SMTP_HOST=in-v3.mailjet.com
SMTP_PORT=587
SMTP_USER=your-api-key
SMTP_PASS=your-secret-key
SMTP_SECURE=false
```

**Kurulum:**
1. https://www.mailjet.com adresinden ücretsiz hesap oluşturun
2. Account Settings → API Keys
3. Default API key ve Secret key'i kopyalayın
4. API key'i `SMTP_USER`, Secret key'i `SMTP_PASS` olarak kullanın

**Limitler:** Günde 200 email, ayda 6,000 email ücretsiz

---

### 9. Elastic Email

**Avantajlar:** Günde 100 email ücretsiz, SMTP desteği

**Ayarlar:**
```env
SMTP_HOST=smtp.elasticemail.com
SMTP_PORT=2525
SMTP_USER=your-email@example.com
SMTP_PASS=your-api-key
SMTP_SECURE=false
```

**Kurulum:**
1. https://elasticemail.com adresinden ücretsiz hesap oluşturun
2. Settings → SMTP/API → Create API Key
3. API key'i `SMTP_PASS` olarak kullanın
4. Email adresinizi `SMTP_USER` olarak kullanın

**Limitler:** Günde 100 email ücretsiz

---

## Önerilen Servisler (Günde 50 Email İçin)

**Mailjet** en iyi seçenektir:
- ✅ Günde 200 email ücretsiz (ihtiyacınızdan fazla)
- ✅ Kolay kurulum
- ✅ Güvenilir
- ✅ SMTP desteği güçlü
- ✅ İyi dokümantasyon

**Elastic Email** alternatif:
- ✅ Günde 100 email ücretsiz (ihtiyacınız için yeterli)
- ✅ Kolay kurulum
- ✅ SMTP desteği var

