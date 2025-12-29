import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

// Token ile şifre değiştir
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, yeniSifre } = body

    if (!token || !yeniSifre) {
      return NextResponse.json(
        { error: 'Token ve yeni şifre gerekli' },
        { status: 400 }
      )
    }

    if (yeniSifre.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      )
    }

    // Token ile kullanıcıyı bul
    const user = await prisma.user.findFirst({
      where: {
        sifreSifirlamaToken: token,
        sifreSifirlamaTarih: {
          gte: new Date(), // Token hala geçerli
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş token' },
        { status: 400 }
      )
    }

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(yeniSifre, 10)

    // Şifreyi güncelle ve token'ı temizle
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        sifreSifirlamaToken: null,
        sifreSifirlamaTarih: null,
        ilkGirisVarmi: true, // İlk giriş tamamlandı
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi',
    })
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}




