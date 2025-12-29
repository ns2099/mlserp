# Mailjet SMTP Kurulum Kılavuzu

Bu kılavuz, Mailjet SMTP servisini projenize entegre etmek için adım adım talimatlar içerir.

## Mailjet Neden İyi?

- ✅ **Günde 200 email ücretsiz** (ihtiyacınızdan fazla - günde 50 email göndereceksiniz)
- ✅ **Ayda 6,000 email ücretsiz**
- ✅ Kolay kurulum
- ✅ Güvenilir ve profesyonel
- ✅ SMTP desteği güçlü
- ✅ İyi dokümantasyon

## 1. Mailjet Hesabı Oluşturma

1. **Mailjet'e kaydolun:**
   - https://www.mailjet.com adresine gidin
   - "Sign Up Free" butonuna tıklayın
   - Email adresiniz, şifre ve şirket adınızla ücretsiz hesap oluşturun
   - Email adresinizi doğrulayın

2. **Hesabınızı doğrulayın:**
   - Email kutunuzu kontrol edin
   - Mailjet'ten gelen doğrulama emailine tıklayın

## 2. API Keys Oluşturma

1. **Mailjet Dashboard'a giriş yapın:**
   - https://app.mailjet.com adresine gidin
   - Email ve şifrenizle giriş yapın

2. **API Keys'e gidin:**
   - Sağ üst köşedeki profil ikonuna tıklayın
   - **Account Settings** seçeneğine tıklayın
   - Sol menüden **API Keys** sekmesine tıklayın
   - Varsayılan olarak bir API key ve Secret key zaten oluşturulmuş olacak

3. **API Key ve Secret Key'i kopyalayın:**
   - **API Key** değerini kopyalayın (SMTP_USER olarak kullanılacak)
   - **Secret Key** değerini kopyalayın (SMTP_PASS olarak kullanılacak)
   - ⚠️ **ÖNEMLİ:** Secret key'i güvenli bir yere kaydedin

## 3. Sender Email Doğrulama (ZORUNLU)

⚠️ **ÖNEMLİ:** Mailjet, gönderen email adresinin doğrulanmasını zorunlu kılar. Doğrulama yapılmadan email gönderemezsiniz!

1. **Senders bölümüne gidin:**
   - Mailjet Dashboard'da sol menüden **Senders** seçeneğine tıklayın
   - Veya doğrudan: https://app.mailjet.com/senders

2. **Yeni sender ekleyin:**
   - **Add a sender** veya **Add sender** butonuna tıklayın
   - Email adresinizi girin (örn: `noreply@yourdomain.com` veya `info@yourdomain.com`)
   - **Save** veya **Add** butonuna tıklayın

3. **Email doğrulaması:**
   - Mailjet, girdiğiniz email adresine bir doğrulama email'i gönderecek
   - Email kutunuzu kontrol edin
   - Mailjet'ten gelen email'i açın
   - Email içindeki **doğrulama linkine** tıklayın
   - Veya email'deki **doğrulama kodunu** kopyalayıp Mailjet dashboard'a yapıştırın

4. **Doğrulama durumunu kontrol edin:**
   - Senders sayfasında email adresinizin yanında **"Verified"** veya **"Active"** yazması gerekir
   - Durum **"Pending"** ise, email kutunuzu tekrar kontrol edin

5. **.env dosyasını güncelleyin:**
   - Doğrulanmış email adresini `SMTP_FROM` olarak kullanın:
   ```env
   SMTP_FROM=your-verified-email@example.com
   ```

**Not:** 
- Doğrulama işlemi genellikle birkaç dakika içinde tamamlanır
- Email gelmediyse spam klasörünü kontrol edin
- 3 gün içinde doğrulama yapılmazsa Mailjet hesabınız askıya alınabilir

## 4. .env Dosyası Yapılandırması

Projenizin kök dizinindeki `.env` dosyasına (yoksa oluşturun) aşağıdaki ayarları ekleyin:

```env
# Mailjet SMTP Ayarları
SMTP_HOST=in-v3.mailjet.com
SMTP_PORT=587
SMTP_USER=your-api-key-here
SMTP_PASS=your-secret-key-here
SMTP_SECURE=false
SMTP_FROM=your-email@example.com

# Uygulama URL (Email linkleri için)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Açıklamalar:

- **SMTP_HOST:** `in-v3.mailjet.com` (değiştirmeyin)
- **SMTP_PORT:** `587` (değiştirmeyin)
- **SMTP_USER:** 2. adımda kopyaladığınız API Key
- **SMTP_PASS:** 2. adımda kopyaladığınız Secret Key
- **SMTP_SECURE:** `false` (587 portu için)
- **SMTP_FROM:** Email gönderen adresi (doğrulanmış sender email)
- **NEXT_PUBLIC_APP_URL:** Uygulamanızın URL'i (production'da gerçek domain'inizi yazın)

## 5. Örnek .env Dosyası

```env
# Mailjet SMTP Ayarları
SMTP_HOST=in-v3.mailjet.com
SMTP_PORT=587
SMTP_USER=1234567890abcdef1234567890abcdef
SMTP_PASS=abcdef1234567890abcdef1234567890
SMTP_SECURE=false
SMTP_FROM=noreply@mlsmakina.com

# Uygulama URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Diğer ayarlar...
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=your-secret-key
```

## 6. Test Etme

1. **Sunucuyu yeniden başlatın:**
   ```bash
   npm run dev
   ```

2. **Kayıt ol sayfasını test edin:**
   - Tarayıcıda `http://localhost:3000/kayit` adresine gidin
   - Bir email adresi girin
   - "Onay Linki Gönder" butonuna tıklayın
   - Console'da "✅ SMTP bağlantısı başarılı: in-v3.mailjet.com" mesajını görmelisiniz
   - Email kutunuzu kontrol edin

3. **Hata durumunda:**
   - Console loglarını kontrol edin
   - SMTP_USER (API Key) ve SMTP_PASS (Secret Key) değerlerinin doğru olduğundan emin olun
   - API Key ve Secret Key'in doğru kopyalandığından emin olun (boşluk olmamalı)

## 7. Mailjet Ücretsiz Plan Limitleri

- **Günlük email limiti:** 200 email/gün
- **Aylık email limiti:** 6,000 email/ay
- **SMTP bağlantı limiti:** Sınırsız

Bu limitler sizin ihtiyacınız için fazlasıyla yeterlidir (günde 50 email).

## 8. Sorun Giderme

### "SMTP kimlik doğrulama hatası" alıyorsanız:

1. SMTP_USER'ın API Key olduğundan emin olun (Secret Key değil!)
2. SMTP_PASS'ın Secret Key olduğundan emin olun (API Key değil!)
3. API Key ve Secret Key'in doğru kopyalandığından emin olun
4. .env dosyasında tırnak işareti kullanmayın (SMTP_USER="key" ❌, SMTP_USER=key ✅)

### "Connection timeout" alıyorsanız:

1. İnternet bağlantınızı kontrol edin
2. Firewall'un 587 portunu engellemediğinden emin olun
3. SMTP_HOST'un `in-v3.mailjet.com` olduğundan emin olun

### Email gelmiyorsa:

1. Spam klasörünü kontrol edin
2. Mailjet dashboard'da "Activity" bölümünden email'in gönderilip gönderilmediğini kontrol edin
3. Sender email'inizi doğruladığınızdan emin olun
4. Console loglarında hata var mı kontrol edin

## 9. Production Ortamı İçin

Production'da:

1. **NEXT_PUBLIC_APP_URL'i güncelleyin:**
   ```env
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

2. **SMTP_FROM'u domain'inize uygun ayarlayın:**
   ```env
   SMTP_FROM=noreply@yourdomain.com
   ```

3. **Domain doğrulama (Önerilir):**
   - Mailjet'te "Senders" bölümünden domain'inizi doğrulayın
   - Bu, email'lerinizin spam'e düşme riskini azaltır
   - Email deliverability'yi artırır

## 10. Ek Kaynaklar

- Mailjet Dokümantasyon: https://dev.mailjet.com/
- Mailjet SMTP Ayarları: https://dev.mailjet.com/email/guides/send-api-v31/
- Mailjet Destek: https://www.mailjet.com/support/

## 11. Başarı Kontrolü

Kurulum başarılıysa:

✅ Console'da "✅ SMTP bağlantısı başarılı: in-v3.mailjet.com" mesajını görmelisiniz
✅ Kayıt ol sayfasından email gönderebilmelisiniz
✅ Email kutunuzda onay linkini almalısınız
✅ Mailjet dashboard'da "Activity" bölümünde gönderilen email'leri görebilmelisiniz

---

**Not:** Bu kılavuz Mailjet'in ücretsiz planı için hazırlanmıştır. Günde 200 email limiti sizin ihtiyacınız için fazlasıyla yeterlidir (günde 50 email göndereceksiniz).

