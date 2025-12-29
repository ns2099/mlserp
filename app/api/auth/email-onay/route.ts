import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, username, adSoyad, password } = body

    if (!token || !username || !adSoyad || !password) {
      return NextResponse.json(
        { success: false, error: 'Tüm alanlar gerekli' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      )
    }

    // Token ile kullanıcıyı bul
    const user = await prisma.user.findFirst({
      where: {
        emailOnayToken: token,
        emailOnayTarih: {
          gte: new Date(), // Token hala geçerli
        },
        emailOnaylandiMi: false, // Henüz onaylanmamış
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veya süresi dolmuş token' },
        { status: 400 }
      )
    }

    // Username kontrolü (eğer değiştirilmişse)
    if (username !== user.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      })

      if (existingUsername) {
        return NextResponse.json(
          { success: false, error: 'Bu kullanıcı adı zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10)

    // Kullanıcıyı güncelle ve onayla
    await prisma.user.update({
      where: { id: user.id },
      data: {
        username,
        password: hashedPassword,
        adSoyad,
        emailOnaylandiMi: true,
        emailOnayToken: null,
        emailOnayTarih: null,
        ilkGirisVarmi: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Hesap başarıyla onaylandı',
    })
  } catch (error) {
    console.error('Email onay hatası:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}




