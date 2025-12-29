# Mailjet Sender Email Doğrulama - Hızlı Kılavuz

Mailjet'ten "sender address has not been validated yet" hatası alıyorsanız, bu kılavuzu takip edin.

## Sorun

Mailjet size şu mesajı gönderdi:
> "We are contacting you as you (or one of your team members) tried to send an email with sender address: your-email@example.com. But this sender address has not been validated yet on your account."

Bu, gönderen email adresinin doğrulanması gerektiği anlamına gelir.

## Çözüm - Adım Adım

### 1. Mailjet Dashboard'a Giriş Yapın

- https://app.mailjet.com adresine gidin
- Email ve şifrenizle giriş yapın

### 2. Senders Sayfasına Gidin

- Sol menüden **"Senders"** seçeneğine tıklayın
- Veya doğrudan: https://app.mailjet.com/senders

### 3. Yeni Sender Ekleyin

1. **"Add sender"** veya **"Add a sender"** butonuna tıklayın
2. Açılan formda:
   - **Email address:** Doğrulamak istediğiniz email adresini girin
     - Örnek: `noreply@yourdomain.com`
     - Örnek: `info@yourdomain.com`
     - Örnek: `support@yourdomain.com`
   - **Name (Opsiyonel):** Gönderen adı (örn: "MLS Makina")
3. **"Save"** veya **"Add"** butonuna tıklayın

### 4. Email Doğrulaması

Mailjet, girdiğiniz email adresine bir doğrulama email'i gönderecek:

1. **Email kutunuzu kontrol edin**
   - Mailjet'ten gelen email'i bulun
   - Konu: "Verify your sender address" veya benzeri
   - Email gelmediyse **spam klasörünü** kontrol edin

2. **Doğrulama yöntemlerinden birini seçin:**

   **Yöntem 1: Link ile doğrulama (Önerilen)**
   - Email içindeki **"Verify"** veya **"Confirm"** butonuna tıklayın
   - Veya email'deki doğrulama linkine tıklayın
   - Tarayıcıda Mailjet sayfası açılacak ve doğrulama tamamlanacak

   **Yöntem 2: Kod ile doğrulama**
   - Email içindeki **doğrulama kodunu** kopyalayın
   - Mailjet dashboard'daki Senders sayfasına dönün
   - Email adresinizin yanındaki **"Verify"** butonuna tıklayın
   - Kodu yapıştırın ve **"Verify"** butonuna tıklayın

### 5. Doğrulama Durumunu Kontrol Edin

Senders sayfasında:
- Email adresinizin yanında **"Verified"** veya **"Active"** yazması gerekir
- Durum **"Pending"** ise, email kutunuzu tekrar kontrol edin
- Durum **"Failed"** ise, yeni bir doğrulama email'i isteyin

### 6. .env Dosyasını Güncelleyin

Doğrulanmış email adresini `.env` dosyanızda `SMTP_FROM` olarak kullanın:

```env
# Mailjet SMTP Ayarları
SMTP_HOST=in-v3.mailjet.com
SMTP_PORT=587
SMTP_USER=your-api-key-here
SMTP_PASS=your-secret-key-here
SMTP_SECURE=false
SMTP_FROM=your-verified-email@example.com  # ← Doğrulanmış email buraya
```

**Önemli:** `SMTP_FROM` değeri, Mailjet'te doğrulanmış email adresi ile aynı olmalıdır!

### 7. Sunucuyu Yeniden Başlatın

```bash
npm run dev
```

### 8. Test Edin

1. Kayıt ol sayfasından bir email göndermeyi deneyin
2. Artık hata almamalısınız
3. Email başarıyla gönderilmelidir

## Sık Karşılaşılan Sorunlar

### Email Gelmiyor

1. **Spam klasörünü kontrol edin**
2. **Email adresinin doğru olduğundan emin olun**
3. **Mailjet dashboard'da "Resend verification email" butonuna tıklayın**
4. **Farklı bir email adresi deneyin**

### Doğrulama Linki Çalışmıyor

1. **Link'in süresi dolmuş olabilir** - Yeni bir doğrulama email'i isteyin
2. **Farklı bir tarayıcı deneyin**
3. **Doğrulama kodunu manuel olarak girin**

### "3 Days" Uyarısı

Mailjet size 3 gün içinde doğrulama yapmanız gerektiğini söylüyor. Eğer:
- **3 gün geçtiyse:** Yeni bir sender ekleyin ve hemen doğrulayın
- **Henüz geçmediyse:** Yukarıdaki adımları takip edin

### Birden Fazla Email Adresi

Eğer farklı email adreslerinden göndermek istiyorsanız:
- Her email adresi için ayrı ayrı sender ekleyin
- Her birini doğrulayın
- `.env` dosyasında `SMTP_FROM` değerini değiştirebilirsiniz

## Doğrulama Sonrası

✅ Sender doğrulandıktan sonra:
- Email gönderebilirsiniz
- Artık "sender not validated" hatası almazsınız
- Email'leriniz spam'e düşme riski azalır

## Ek Kaynaklar

- Mailjet Senders Dokümantasyonu: https://dev.mailjet.com/email/guides/sender-management/
- Mailjet Destek: https://www.mailjet.com/support/

---

**Not:** Bu işlem sadece bir kez yapılır. Sender doğrulandıktan sonra süresiz olarak kullanabilirsiniz.




