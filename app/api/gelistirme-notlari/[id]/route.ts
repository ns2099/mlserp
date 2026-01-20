import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const not = await prisma.gelistirmeNotu.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            adSoyad: true,
          },
        },
      },
    })

    if (!not) {
      return NextResponse.json({ error: 'Not bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(not)
  } catch (error) {
    console.error('Geliştirme notu yükleme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { baslik, icerik, cozum, durum } = body

    // Notu bul
    const not = await prisma.gelistirmeNotu.findUnique({
      where: { id },
    })

    if (!not) {
      return NextResponse.json({ error: 'Not bulunamadı' }, { status: 404 })
    }

    // Notu güncelle
    const updatedNot = await prisma.gelistirmeNotu.update({
      where: { id },
      data: {
        baslik: baslik || not.baslik,
        icerik: icerik || not.icerik,
        cozum: cozum !== undefined ? cozum : not.cozum,
        durum: durum || not.durum,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            adSoyad: true,
          },
        },
      },
    })

    return NextResponse.json(updatedNot)
  } catch (error) {
    console.error('Geliştirme notu güncelleme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Notu bul
    const not = await prisma.gelistirmeNotu.findUnique({
      where: { id },
    })

    if (!not) {
      return NextResponse.json({ error: 'Not bulunamadı' }, { status: 404 })
    }

    // Notu sil
    await prisma.gelistirmeNotu.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Not silindi' })
  } catch (error) {
    console.error('Geliştirme notu silme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
