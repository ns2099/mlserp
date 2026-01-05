import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const odeme = await prisma.odeme.findUnique({
      where: { id: params.id },
      include: {
        teklif: {
          include: {
            firma: true,
          },
        },
        user: true,
      },
    })

    if (!odeme) {
      return NextResponse.json({ error: 'Ödeme bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(odeme)
  } catch (error) {
    console.error('Ödeme getirme hatası:', error)
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

    const body = await request.json()
    const { tur, tutar, paraBirimi, odemeTarihi, odemeYontemi, aciklama, teklifId } = body

    const odeme = await prisma.odeme.update({
      where: { id: params.id },
      data: {
        tur,
        tutar: parseFloat(tutar),
        paraBirimi: paraBirimi || 'TRY',
        odemeTarihi: new Date(odemeTarihi),
        odemeYontemi,
        aciklama: aciklama || null,
        teklifId: teklifId || null,
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

    return NextResponse.json(odeme)
  } catch (error) {
    console.error('Ödeme güncelleme hatası:', error)
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

    await prisma.odeme.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Ödeme başarıyla silindi' })
  } catch (error) {
    console.error('Ödeme silme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
