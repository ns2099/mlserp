import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { sendPasswordResetEmail } from '@/lib/email'
import * as crypto from 'crypto'

// İlk giriş için şifre sıfırlama token'ı oluştur ve email gönder
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Kullanıcıyı getir
    const user = await prisma.user.findUnique({
      where: { id: session.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    if (!user.email) {
      return NextResponse.json(
        { error: 'Kullanıcının e-posta adresi kayıtlı değil' },
        { status: 400 }
      )
    }

    // Token oluştur
    const token = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 24) // 24 saat geçerli

    // Token'ı veritabanına kaydet
    await prisma.user.update({
      where: { id: user.id },
      data: {
        sifreSifirlamaToken: token,
        sifreSifirlamaTarih: tokenExpiry,
      },
    })

    // Email gönder
    const emailResult = await sendPasswordResetEmail(
      user.email,
      token,
      user.username
    )

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'E-posta gönderilemedi: ' + emailResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Şifre sıfırlama e-postası gönderildi',
    })
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

