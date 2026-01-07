import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { username, password, rememberMe } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı adı ve şifre gerekli' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı adı veya şifre hatalı' },
        { status: 401 }
      )
    }

    // Email onayı kontrolü - sadece yeni kayıt olanlar için (emailOnayToken varsa)
    // Mevcut kullanıcılar için email onay kontrolü yapılmaz
    if (!user.emailOnaylandiMi && user.emailOnayToken) {
      return NextResponse.json(
        { success: false, error: 'Hesabınız henüz onaylanmamış. Lütfen e-postanızdaki onay linkine tıklayın.' },
        { status: 401 }
      )
    }

    // Şifre kontrolü
    if (!user.password) {
      return NextResponse.json(
        { success: false, error: 'Şifre belirlenmemiş. Lütfen e-postanızdaki onay linkine tıklayın.' },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı adı veya şifre hatalı' },
        { status: 401 }
      )
    }

    // İlk giriş kontrolü - eğer ilk giriş yapılmamışsa şifre sıfırlama token'ı oluştur ve email gönder
    if (!user.ilkGirisVarmi && user.email) {
      const crypto = await import('crypto')
      const token = crypto.randomBytes(32).toString('hex')
      const tokenExpiry = new Date()
      tokenExpiry.setHours(tokenExpiry.getHours() + 24) // 24 saat geçerli

      await prisma.user.update({
        where: { id: user.id },
        data: {
          sifreSifirlamaToken: token,
          sifreSifirlamaTarih: tokenExpiry,
        },
      })

      // Email gönder
      let emailSent = false
      let emailError = null
      try {
        // SMTP ayarlarını kontrol et
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
          console.warn('SMTP ayarları yapılandırılmamış. Email gönderilemedi.')
          emailError = 'SMTP ayarları yapılandırılmamış'
        } else {
          const { sendPasswordResetEmail } = await import('@/lib/email')
          const emailResult = await sendPasswordResetEmail(user.email, token, user.username)
          if (emailResult.success) {
            emailSent = true
            console.log('Email başarıyla gönderildi:', user.email)
          } else {
            emailError = emailResult.error
            console.error('Email gönderme hatası:', emailResult.error)
          }
        }
      } catch (error) {
        emailError = error instanceof Error ? error.message : 'Bilinmeyen hata'
        console.error('Email gönderme hatası:', error)
      }

      return NextResponse.json({
        success: true,
        requiresPasswordReset: true,
        emailSent,
        emailError,
        message: emailSent 
          ? `İlk girişiniz için e-postanıza (${user.email}) şifre sıfırlama linki gönderilmiştir. Lütfen e-postanızı kontrol edin.`
          : emailError
          ? `Şifre sıfırlama linki oluşturuldu ancak email gönderilemedi: ${emailError}. Lütfen yönetici ile iletişime geçin.`
          : 'İlk girişiniz için e-postanıza şifre sıfırlama linki gönderildi. Lütfen e-postanızı kontrol edin.',
        user: {
          id: user.id,
          username: user.username,
          name: user.adSoyad,
          email: user.email,
          role: user.yetki,
        },
      })
    }

    // Oturum süresini belirle: rememberMe true ise 30 gün, değilse 1 gün
    const sessionDuration = rememberMe 
      ? 30 * 24 * 60 * 60 // 30 gün
      : 24 * 60 * 60 // 1 gün

    // Basit session token oluştur (güvenlik için JWT kullanılabilir ama şimdilik basit tutuyoruz)
    const sessionToken = Buffer.from(
      JSON.stringify({
        id: user.id,
        username: user.username,
        name: user.adSoyad,
        role: user.yetki,
        exp: Date.now() + sessionDuration * 1000,
      })
    ).toString('base64')

    // Session cookie oluştur
    const response = NextResponse.json({
      success: true,
      requiresPasswordReset: false,
      token: sessionToken, // Mobile app için token
      user: {
        id: user.id,
        username: user.username,
        name: user.adSoyad,
        email: user.email,
        role: user.yetki,
      },
    })

    // Cookie set et - Cloudflare Tunnel için ayarlar
    // Cloudflare HTTPS → Node HTTP olduğu için secure: false kullanıyoruz
    const forwardedProto = request.headers.get('x-forwarded-proto')
    const isHttps = forwardedProto === 'https'
    
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: false, // Cloudflare Tunnel için false (Cloudflare HTTPS → Node HTTP)
      sameSite: 'lax',
      maxAge: sessionDuration, // rememberMe'ye göre ayarlanmış süre
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

