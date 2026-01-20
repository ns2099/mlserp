import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notlar = await prisma.gelistirmeNotu.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            adSoyad: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(notlar)
  } catch (error) {
    console.error('Geliştirme notları yükleme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { baslik, icerik } = body

    if (!baslik || !icerik) {
      return NextResponse.json(
        { error: 'Başlık ve içerik gerekli' },
        { status: 400 }
      )
    }

    const not = await prisma.gelistirmeNotu.create({
      data: {
        baslik,
        icerik,
        userId: session.id,
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

    return NextResponse.json(not, { status: 201 })
  } catch (error) {
    console.error('Geliştirme notu oluşturma hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
