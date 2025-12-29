import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kullanici = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        username: true,
        adSoyad: true,
        yetki: true,
      },
    })

    if (!kullanici) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(kullanici)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { username, password, adSoyad, yetki } = body

    if (!username || !adSoyad) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve ad soyad gerekli' },
        { status: 400 }
      )
    }

    // Kullanıcı adı kontrolü (kendisi hariç)
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        NOT: { id: params.id },
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı zaten kullanılıyor' },
        { status: 400 }
      )
    }

    const updateData: any = {
      username,
      adSoyad,
      yetki: yetki || 'Kullanıcı',
    }

    // Şifre değiştirilecekse
    if (password && password.length > 0) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const kullanici = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        adSoyad: true,
        yetki: true,
      },
    })

    return NextResponse.json(kullanici)
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Admin kullanıcısını silmeyi engelle
    const kullanici = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (kullanici?.username === 'admin') {
      return NextResponse.json(
        { error: 'Admin kullanıcısı silinemez' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Kullanıcı silindi' })
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
