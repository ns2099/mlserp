import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Geçici olarak session kontrolü kaldırıldı
    const kullanicilar = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        adSoyad: true,
        yetki: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(kullanicilar)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Geçici olarak session kontrolü kaldırıldı
    const body = await request.json()
    const { username, password, adSoyad, yetki } = body

    if (!username || !password || !adSoyad) {
      return NextResponse.json(
        { error: 'Kullanıcı adı, şifre ve ad soyad gerekli' },
        { status: 400 }
      )
    }

    // Kullanıcı adı kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı zaten kullanılıyor' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        adSoyad,
        yetki: yetki || 'Kullanıcı',
      },
      select: {
        id: true,
        username: true,
        adSoyad: true,
        yetki: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

