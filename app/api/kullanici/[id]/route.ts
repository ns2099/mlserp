import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const kullanici = await prisma.user.findUnique({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { username, password, adSoyad, yetki } = body

    // Düzenlenen kullanıcıyı al
    const targetUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Admin kontrolü: Sadece "admin" kullanıcı adına sahip kullanıcı diğer kullanıcıları düzenleyebilir
    const isAdmin = session.username === 'admin'
    const isEditingSelf = session.id === id

    // Normal kullanıcılar sadece kendi şifrelerini güncelleyebilir
    if (!isAdmin && !isEditingSelf) {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gereklidir' },
        { status: 403 }
      )
    }

    // Normal kullanıcılar sadece şifre güncelleyebilir
    if (!isAdmin && isEditingSelf) {
      if (!password || password.length === 0) {
        return NextResponse.json(
          { error: 'Şifre gerekli' },
          { status: 400 }
        )
      }

      // Sadece şifre güncelle
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      })

      return NextResponse.json({ message: 'Şifre güncellendi' })
    }

    // Admin kullanıcı tüm alanları güncelleyebilir
    if (!username || !adSoyad) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve ad soyad gerekli' },
        { status: 400 }
      )
    }

    // Admin kullanıcısının kullanıcı adını değiştirmeyi engelle
    if (targetUser.username === 'admin' && username !== 'admin') {
      return NextResponse.json(
        { error: 'Admin kullanıcısının kullanıcı adı değiştirilemez' },
        { status: 400 }
      )
    }

    // Kullanıcı adı kontrolü (kendisi hariç)
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        NOT: { id },
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
    }

    // Admin yetki değiştirebilir (admin kullanıcısının yetkisini değiştirmeyi engelle)
    if (yetki && targetUser.username !== 'admin') {
      updateData.yetki = yetki
    } else if (targetUser.username === 'admin') {
      // Admin kullanıcısının yetkisi her zaman Yönetici olmalı
      updateData.yetki = 'Yönetici'
    }

    // Şifre değiştirilecekse
    if (password && password.length > 0) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const kullanici = await prisma.user.update({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Sadece admin kullanıcı silme işlemi yapabilir
    if (session.username !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gereklidir' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Admin kullanıcısını silmeyi engelle
    const kullanici = await prisma.user.findUnique({
      where: { id },
    })

    if (kullanici?.username === 'admin') {
      return NextResponse.json(
        { error: 'Admin kullanıcısı silinemez' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Kullanıcı silindi' })
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
