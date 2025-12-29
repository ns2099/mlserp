# Brevo (Sendinblue) SMTP Kurulum Kılavuzu

Bu kılavuz, Brevo SMTP servisini projenize entegre etmek için adım adım talimatlar içerir.

## 1. Brevo Hesabı Oluşturma

1. **Brevo'ya kaydolun:**
   - https://www.brevo.com adresine gidin
   - "Sign up free" butonuna tıklayın
   - Email adresiniz ve şifrenizle ücretsiz hesap oluşturun
   - Email adresinizi doğrulayın

2. **Hesabınızı doğrulayın:**
   - Email kutunuzu kontrol edin
   - Brevo'dan gelen doğrulama emailine tıklayın

## 2. SMTP Key Oluşturma

1. **Brevo Dashboard'a giriş yapın:**
   - https://app.brevo.com adresine gidin
   - Email ve şifrenizle giriş yapın

2. **SMTP ayarlarına gidin:**
   - Sol menüden **Settings** (Ayarlar) seçeneğine tıklayın
   - **SMTP & API** sekmesine tıklayın
   - **SMTP** bölümüne gidin

3. **SMTP Key oluşturun:**
   - **SMTP Keys** bölümünde **Generate a new SMTP key** butonuna tıklayın
   - Key için bir isim verin (örn: "MLS Makina")
   - **Generate** butonuna tıklayın
   - ⚠️ **ÖNEMLİ:** Oluşturulan key'i hemen kopyalayın ve güvenli bir yere kaydedin
   - Key sadece bir kez gösterilir, sonra göremezsiniz!

## 3. .env Dosyası Yapılandırması

Projenizin kök dizinindeki `.env` dosyasına (yoksa oluşturun) aşağıdaki ayarları ekleyin:

```env
# Brevo SMTP Ayarları
SMTP_HOST=smtp.brevo.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-brevo-smtp-key-here
SMTP_SECURE=false
SMTP_FROM=noreply@yourdomain.com

# Uygulama URL (Email linkleri için)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Açıklamalar:

- **SMTP_HOST:** `smtp.brevo.com` (değiştirmeyin)
- **SMTP_PORT:** `587` (değiştirmeyin)
- **SMTP_USER:** Brevo'ya kayıt olduğunuz email adresi
- **SMTP_PASS:** 2. adımda oluşturduğunuz SMTP key
- **SMTP_SECURE:** `false` (587 portu için)
- **SMTP_FROM:** Email gönderen adresi (SMTP_USER ile aynı olabilir veya farklı bir email)
- **NEXT_PUBLIC_APP_URL:** Uygulamanızın URL'i (production'da gerçek domain'inizi yazın)

## 4. Örnek .env Dosyası

```env
# Brevo SMTP Ayarları
SMTP_HOST=smtp.brevo.com
SMTP_PORT=587
SMTP_USER=info@mlsmakina.com
SMTP_PASS=xkeysib-1234567890abcdef-ABCDEF1234567890
SMTP_SECURE=false
SMTP_FROM=noreply@mlsmakina.com

# Uygulama URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Diğer ayarlar...
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=your-secret-key
```

## 5. Test Etme

1. **Sunucuyu yeniden başlatın:**
   ```bash
   npm run dev
   ```

2. **Kayıt ol sayfasını test edin:**
   - Tarayıcıda `http://localhost:3000/kayit` adresine gidin
   - Bir email adresi girin
   - "Onay Linki Gönder" butonuna tıklayın
   - Console'da "✅ SMTP bağlantısı başarılı" mesajını görmelisiniz
   - Email kutunuzu kontrol edin

3. **Hata durumunda:**
   - Console loglarını kontrol edin
   - SMTP_USER ve SMTP_PASS değerlerinin doğru olduğundan emin olun
   - SMTP key'in doğru kopyalandığından emin olun (boşluk olmamalı)

## 6. Brevo Ücretsiz Plan Limitleri

- **Günlük email limiti:** 300 email/gün
- **Aylık email limiti:** 9,000 email/ay
- **SMTP bağlantı limiti:** 10,000 bağlantı/ay

Bu limitler çoğu küçük-orta ölçekli uygulama için yeterlidir.

## 7. Sorun Giderme

### "SMTP kimlik doğrulama hatası" alıyorsanız:

1. SMTP_PASS değerinin doğru olduğundan emin olun
2. SMTP_USER'ın Brevo'ya kayıt olduğunuz email olduğundan emin olun
3. SMTP key'in süresi dolmamış olmalı (Brevo'da kontrol edin)
4. .env dosyasında tırnak işareti kullanmayın (SMTP_PASS="key" ❌, SMTP_PASS=key ✅)

### "Connection timeout" alıyorsanız:

1. İnternet bağlantınızı kontrol edin
2. Firewall'un 587 portunu engellemediğinden emin olun
3. SMTP_HOST'un `smtp.brevo.com` olduğundan emin olun

### Email gelmiyorsa:

1. Spam klasörünü kontrol edin
2. Brevo dashboard'da "Senders" bölümünden gönderen adresinizi doğrulayın
3. Console loglarında hata var mı kontrol edin

## 8. Production Ortamı İçin

Production'da:

1. **NEXT_PUBLIC_APP_URL'i güncelleyin:**
   ```env
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

2. **SMTP_FROM'u domain'inize uygun ayarlayın:**
   ```env
   SMTP_FROM=noreply@yourdomain.com
   ```

3. **Domain doğrulama (Opsiyonel ama önerilir):**
   - Brevo'da "Senders" bölümünden domain'inizi doğrulayın
   - Bu, email'lerinizin spam'e düşme riskini azaltır

## 9. Ek Kaynaklar

- Brevo Dokümantasyon: https://developers.brevo.com/
- Brevo SMTP Ayarları: https://help.brevo.com/hc/en-us/articles/209467485
- Brevo Destek: https://www.brevo.com/support/

## 10. Başarı Kontrolü

Kurulum başarılıysa:

✅ Console'da "✅ SMTP bağlantısı başarılı: smtp.brevo.com" mesajını görmelisiniz
✅ Kayıt ol sayfasından email gönderebilmelisiniz
✅ Email kutunuzda onay linkini almalısınız
✅ Email'ler spam'e düşmemeli (domain doğrulaması yaptıysanız)

---

**Not:** Bu kılavuz Brevo'nun ücretsiz planı için hazırlanmıştır. Daha yüksek limitler için ücretli planlara geçebilirsiniz.




