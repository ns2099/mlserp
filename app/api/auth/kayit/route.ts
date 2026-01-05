import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validasyon
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Geçerli bir e-posta adresi giriniz' },
        { status: 400 }
      )
    }

    // Email kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim() },
    })

    if (existingUser) {
      if (existingUser.emailOnaylandiMi) {
        return NextResponse.json(
          { success: false, error: 'Bu e-posta adresi ile zaten kayıtlı bir hesap var' },
          { status: 400 }
        )
      } else {
        // Email onaylanmamış, yeni token gönder
        const crypto = await import('crypto')
        const token = crypto.randomBytes(32).toString('hex')
        const tokenExpiry = new Date()
        tokenExpiry.setHours(tokenExpiry.getHours() + 24) // 24 saat geçerli

        await prisma.user.update({
          where: { email: email.trim() },
          data: {
            emailOnayToken: token,
            emailOnayTarih: tokenExpiry,
          },
        })

        // Email gönder
        let emailSent = false
        let emailError = null
        try {
          if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            emailError = 'SMTP ayarları yapılandırılmamış'
          } else {
            const { sendVerificationEmail } = await import('@/lib/email')
            const emailResult = await sendVerificationEmail(email.trim(), token)
            if (emailResult.success) {
              emailSent = true
            } else {
              emailError = emailResult.error
            }
          }
        } catch (error) {
          emailError = error instanceof Error ? error.message : 'Bilinmeyen hata'
        }

        return NextResponse.json({
          success: true,
          emailSent,
          emailError,
          message: emailSent 
            ? 'Onay linki tekrar gönderildi. Lütfen e-postanızı kontrol edin.'
            : 'Onay linki oluşturuldu ancak email gönderilemedi.',
        })
      }
    }

    // Yeni kullanıcı oluştur
    const crypto = await import('crypto')
    const token = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 24) // 24 saat geçerli

    // Email'den username oluştur (email'in @ öncesi kısmı)
    const usernameFromEmail = email.trim().split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    
    // Username benzersiz olmalı, eğer varsa sayı ekle
    let username = usernameFromEmail
    let counter = 1
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${usernameFromEmail}${counter}`
      counter++
    }

    const user = await prisma.user.create({
      data: {
        username,
        password: null, // Şifre email onayından sonra belirlenecek
        email: email.trim(),
        emailOnaylandiMi: false,
        emailOnayToken: token,
        emailOnayTarih: tokenExpiry,
        yetki: 'Kullanıcı',
      },
    })

    // Email gönder
    let emailSent = false
    let emailError = null
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        emailError = 'SMTP ayarları yapılandırılmamış'
      } else {
        const { sendVerificationEmail } = await import('@/lib/email')
        const emailResult = await sendVerificationEmail(email.trim(), token)
        if (emailResult.success) {
          emailSent = true
          console.log('✅ Kayıt onay emaili gönderildi:', email)
        } else {
          emailError = emailResult.error
          console.error('❌ Email gönderme hatası:', emailResult.error)
        }
      }
    } catch (error) {
      emailError = error instanceof Error ? error.message : 'Bilinmeyen hata'
      console.error('❌ Email gönderme hatası:', error)
    }

    return NextResponse.json({
      success: true,
      emailSent,
      emailError,
      message: emailSent 
        ? 'Kayıt başarılı! E-postanıza gönderilen onay linkine tıklayarak hesabınızı aktifleştirin.'
        : 'Kayıt oluşturuldu ancak email gönderilemedi.',
    })
  } catch (error) {
    console.error('Kayıt hatası:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

