import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Geçici olarak session kontrolü kaldırıldı - admin kullanıcısını kullan
    const body = await request.json()
    const { password, newPassword } = body

    const adminUser = await prisma.user.findFirst({
      where: { username: 'admin' },
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin kullanıcısı bulunamadı' }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: adminUser.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Şifre kontrolü
    if (password) {
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Mevcut şifre hatalı' }, { status: 400 })
      }
    }

    // Yeni şifre güncelleme
    const updateData: any = {}
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      })
    }

    return NextResponse.json({ message: 'Ayarlar güncellendi' })
  } catch (error) {
    console.error('Ayarlar güncelleme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

