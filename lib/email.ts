// Email transporter oluştur (nodemailer lazy import)
let transporter: any = null

async function getTransporter() {
  if (transporter) return transporter

  try {
    const nodemailer = await import('nodemailer')
    
    // SMTP ayarlarını kontrol et
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP ayarları yapılandırılmamış. Lütfen .env dosyasında SMTP_USER ve SMTP_PASS değerlerini ayarlayın.')
    }

    const host = process.env.SMTP_HOST || 'smtp.gmail.com'
    const port = parseInt(process.env.SMTP_PORT || '587')
    const secure = process.env.SMTP_SECURE === 'true' || port === 465
    
    // SMTP yapılandırması
    const config: any = {
      host,
      port,
      secure, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }

    // Bazı SMTP servisleri için ek ayarlar
    if (host.includes('sendgrid')) {
      // SendGrid için özel ayarlar
      config.auth.user = 'apikey'
      config.auth.pass = process.env.SMTP_PASS
    } else if (host.includes('mailgun')) {
      // Mailgun için özel ayarlar
      config.auth.user = process.env.SMTP_USER
      config.auth.pass = process.env.SMTP_PASS
    } else if (host.includes('brevo') || host.includes('sendinblue')) {
      // Brevo (Sendinblue) için özel ayarlar
      config.auth.user = process.env.SMTP_USER
      config.auth.pass = process.env.SMTP_PASS
    } else if (host.includes('mailjet')) {
      // Mailjet için özel ayarlar
      config.auth.user = process.env.SMTP_USER // API Key
      config.auth.pass = process.env.SMTP_PASS // Secret Key
    } else if (host.includes('elasticemail')) {
      // Elastic Email için özel ayarlar
      config.auth.user = process.env.SMTP_USER
      config.auth.pass = process.env.SMTP_PASS
    }

    // TLS ayarları (bazı servisler için gerekli)
    if (process.env.SMTP_REJECT_UNAUTHORIZED === 'false') {
      config.tls = {
        rejectUnauthorized: false
      }
    }

    transporter = nodemailer.default.createTransport(config)

    // Bağlantıyı test et
    try {
      await transporter.verify()
      console.log('✅ SMTP bağlantısı başarılı:', host)
    } catch (verifyError) {
      console.warn('⚠️ SMTP bağlantı testi başarısız, ancak devam ediliyor:', verifyError)
    }

    return transporter
  } catch (error) {
    console.error('Nodemailer import hatası:', error)
    throw new Error('Email servisi kurulu değil. Lütfen "npm install nodemailer @types/nodemailer" komutunu çalıştırın.')
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  username: string
) {
  const emailTransporter = await getTransporter()
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sifre-sifirla?token=${token}`

  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER
  const mailOptions = {
    from: `"MLS Makina" <${fromEmail}>`,
    to: email,
    subject: 'Şifre Sıfırlama - MLS Makina Ürün Yönetim Sistemi',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MLS Makina</h1>
              <p>Ürün Yönetim Sistemi</p>
            </div>
            <div class="content">
              <h2>Merhaba ${username},</h2>
              <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Şifremi Sıfırla</a>
              </p>
              <p>Veya aşağıdaki linki kopyalayıp tarayıcınıza yapıştırabilirsiniz:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              <p><strong>Not:</strong> Bu link 24 saat geçerlidir. Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
            </div>
            <div class="footer">
              <p>Bu otomatik bir e-postadır. Lütfen yanıtlamayın.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Merhaba ${username},
      
      Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki linke tıklayarak yeni şifrenizi belirleyebilirsiniz:
      
      ${resetUrl}
      
      Bu link 24 saat geçerlidir. Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
      
      Saygılarımızla,
      MLS Makina Ürün Yönetim Sistemi
    `,
  }

  try {
    // SMTP ayarlarını kontrol et
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP ayarları yapılandırılmamış')
      return { 
        success: false, 
        error: 'SMTP ayarları yapılandırılmamış. Lütfen .env dosyasında SMTP_USER ve SMTP_PASS değerlerini ayarlayın.' 
      }
    }

    const info = await emailTransporter.sendMail(mailOptions)
    console.log('✅ Email başarıyla gönderildi:', info.messageId, '->', email)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('❌ Email gönderme hatası:', error)
    const errorMessage = error?.response || error?.message || 'Bilinmeyen hata'
    const errorString = String(errorMessage)
    
    console.error('Hata detayları:', {
      code: error?.code,
      command: error?.command,
      response: error?.response,
      responseCode: error?.responseCode,
    })
    
    // SMTP kimlik doğrulama hatası için özel mesaj
    if (errorString.includes('535') || errorString.includes('BadCredentials') || errorString.includes('Username and Password not accepted') || errorString.includes('Invalid login')) {
      const host = process.env.SMTP_HOST || 'smtp.gmail.com'
      let errorMsg = 'SMTP kimlik doğrulama hatası. '
      
      if (host.includes('gmail')) {
        errorMsg += 'Gmail için uygulama şifresi (App Password) kullanmanız gerekiyor. Detaylar: https://support.google.com/accounts/answer/185833'
      } else if (host.includes('sendgrid')) {
        errorMsg += 'SendGrid için API Key kullanmanız gerekiyor. SMTP_USER="apikey" ve SMTP_PASS=API_KEY şeklinde ayarlayın.'
      } else if (host.includes('mailgun')) {
        errorMsg += 'Mailgun için doğru kullanıcı adı ve şifre kullanmanız gerekiyor.'
      } else if (host.includes('brevo') || host.includes('sendinblue')) {
        errorMsg += 'Brevo için SMTP kullanıcı adı ve şifrenizi kontrol edin.'
      } else if (host.includes('mailjet')) {
        errorMsg += 'Mailjet için API Key (SMTP_USER) ve Secret Key (SMTP_PASS) kontrol edin.'
      } else if (host.includes('elasticemail')) {
        errorMsg += 'Elastic Email için email adresi ve API key kontrol edin.'
      } else {
        errorMsg += 'Lütfen .env dosyasında SMTP_USER ve SMTP_PASS değerlerini kontrol edin.'
      }
      
      return {
        success: false,
        error: errorMsg
      }
    }
    
    return { 
      success: false, 
      error: errorMessage instanceof Error ? errorMessage.message : String(errorMessage)
    }
  }
}

// Email onaylama email'i gönder
export async function sendVerificationEmail(
  email: string,
  token: string
) {
  const emailTransporter = await getTransporter()
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/email-onay?token=${token}`

  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER
  const mailOptions = {
    from: `"MLS Makina" <${fromEmail}>`,
    to: email,
    subject: 'Hesap Onayı - MLS Makina Ürün Yönetim Sistemi',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MLS Makina</h1>
              <p>Ürün Yönetim Sistemi</p>
            </div>
            <div class="content">
              <h2>Hesap Onayı</h2>
              <p>Kayıt işleminizi tamamlamak için aşağıdaki butona tıklayarak hesabınızı aktifleştirin.</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Hesabımı Onayla</a>
              </p>
              <p>Veya aşağıdaki linki kopyalayıp tarayıcınıza yapıştırabilirsiniz:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              <p><strong>Not:</strong> Bu link 24 saat geçerlidir. Eğer bu kayıt işlemini siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
            </div>
            <div class="footer">
              <p>Bu otomatik bir e-postadır. Lütfen yanıtlamayın.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Hesap Onayı
      
      Kayıt işleminizi tamamlamak için aşağıdaki linke tıklayarak hesabınızı aktifleştirin:
      
      ${verificationUrl}
      
      Bu link 24 saat geçerlidir. Eğer bu kayıt işlemini siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
      
      Saygılarımızla,
      MLS Makina Ürün Yönetim Sistemi
    `,
  }

  try {
    // SMTP ayarlarını kontrol et
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP ayarları yapılandırılmamış')
      return { 
        success: false, 
        error: 'SMTP ayarları yapılandırılmamış. Lütfen .env dosyasında SMTP_USER ve SMTP_PASS değerlerini ayarlayın.' 
      }
    }

    const info = await emailTransporter.sendMail(mailOptions)
    console.log('✅ Onay emaili başarıyla gönderildi:', info.messageId, '->', email)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('❌ Onay emaili gönderme hatası:', error)
    const errorMessage = error?.response || error?.message || 'Bilinmeyen hata'
    const errorString = String(errorMessage)
    
    // SMTP kimlik doğrulama hatası için özel mesaj
    if (errorString.includes('535') || errorString.includes('BadCredentials') || errorString.includes('Username and Password not accepted') || errorString.includes('Invalid login')) {
      const host = process.env.SMTP_HOST || 'smtp.gmail.com'
      let errorMsg = 'SMTP kimlik doğrulama hatası. '
      
      if (host.includes('gmail')) {
        errorMsg += 'Gmail için uygulama şifresi (App Password) kullanmanız gerekiyor. Detaylar: https://support.google.com/accounts/answer/185833'
      } else if (host.includes('sendgrid')) {
        errorMsg += 'SendGrid için API Key kullanmanız gerekiyor. SMTP_USER="apikey" ve SMTP_PASS=API_KEY şeklinde ayarlayın.'
      } else if (host.includes('mailgun')) {
        errorMsg += 'Mailgun için doğru kullanıcı adı ve şifre kullanmanız gerekiyor.'
      } else if (host.includes('brevo') || host.includes('sendinblue')) {
        errorMsg += 'Brevo için SMTP kullanıcı adı ve şifrenizi kontrol edin.'
      } else if (host.includes('mailjet')) {
        errorMsg += 'Mailjet için API Key (SMTP_USER) ve Secret Key (SMTP_PASS) kontrol edin.'
      } else if (host.includes('elasticemail')) {
        errorMsg += 'Elastic Email için email adresi ve API key kontrol edin.'
      } else {
        errorMsg += 'Lütfen .env dosyasında SMTP_USER ve SMTP_PASS değerlerini kontrol edin.'
      }
      
      return {
        success: false,
        error: errorMsg
      }
    }
    
    return { 
      success: false, 
      error: errorMessage instanceof Error ? errorMessage.message : String(errorMessage)
    }
  }
}

