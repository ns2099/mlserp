import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const odemeler = await prisma.odeme.findMany({
      include: {
        teklif: {
          include: {
            firma: true,
          },
        },
        user: true,
      },
      orderBy: { odemeTarihi: 'desc' },
    })

    return NextResponse.json(odemeler)
  } catch (error) {
    console.error('Ödeme listeleme hatası:', error)
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
    const { tur, tutar, paraBirimi, odemeTarihi, odemeYontemi, aciklama, teklifId } = body

    if (!tur || !tutar || !odemeTarihi || !odemeYontemi) {
      return NextResponse.json(
        { error: 'Tür, tutar, ödeme tarihi ve ödeme yöntemi gerekli' },
        { status: 400 }
      )
    }

    // Teklif kontrolü (eğer teklifId varsa)
    if (teklifId) {
      const teklif = await prisma.teklif.findUnique({
        where: { id: teklifId },
      })
      if (!teklif) {
        return NextResponse.json({ error: 'Teklif bulunamadı' }, { status: 404 })
      }
    }

    const odeme = await prisma.odeme.create({
      data: {
        tur,
        tutar: parseFloat(tutar),
        paraBirimi: paraBirimi || 'TRY',
        odemeTarihi: new Date(odemeTarihi),
        odemeYontemi,
        aciklama: aciklama || null,
        teklifId: teklifId || null,
        userId: session.id,
      },
      include: {
        teklif: {
          include: {
            firma: true,
          },
        },
        user: true,
      },
    })

    return NextResponse.json(odeme, { status: 201 })
  } catch (error) {
    console.error('Ödeme oluşturma hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
