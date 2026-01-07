import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const toplantilar = await prisma.toplanti.findMany({
      include: {
        firma: true,
        yetkiliKisi: true,
        user: {
          select: {
            id: true,
            username: true,
            adSoyad: true,
          },
        },
      },
      orderBy: { toplantiTarihi: 'desc' },
    })

    return NextResponse.json(toplantilar)
  } catch (error) {
    console.error('Toplantı listesi hatası:', error)
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
    const { firmaId, yetkiliKisiId, toplantiTarihi, konu, notlar } = body

    if (!firmaId || !toplantiTarihi) {
      return NextResponse.json(
        { error: 'Firma ve toplantı tarihi gerekli' },
        { status: 400 }
      )
    }

    const toplanti = await prisma.toplanti.create({
      data: {
        firmaId,
        yetkiliKisiId: yetkiliKisiId || null,
        toplantiTarihi: new Date(toplantiTarihi),
        konu: konu || null,
        notlar: notlar || null,
        userId: session.id,
      },
      include: {
        firma: true,
        yetkiliKisi: true,
        user: {
          select: {
            id: true,
            username: true,
            adSoyad: true,
          },
        },
      },
    })

    return NextResponse.json(toplanti, { status: 201 })
  } catch (error) {
    console.error('Toplantı oluşturma hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

