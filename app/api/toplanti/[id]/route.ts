import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

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

    const toplanti = await prisma.toplanti.findUnique({
      where: { id },
      include: {
        firma: {
          include: {
            yetkiliKisiler: true,
          },
        },
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

    if (!toplanti) {
      return NextResponse.json({ error: 'Toplantı bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(toplanti)
  } catch (error) {
    console.error('Toplantı detay hatası:', error)
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
    const { firmaId, yetkiliKisiId, toplantiTarihi, konu, notlar } = body

    const toplanti = await prisma.toplanti.update({
      where: { id },
      data: {
        firmaId: firmaId || undefined,
        yetkiliKisiId: yetkiliKisiId || null,
        toplantiTarihi: toplantiTarihi ? new Date(toplantiTarihi) : undefined,
        konu: konu !== undefined ? konu : undefined,
        notlar: notlar !== undefined ? notlar : undefined,
      },
      include: {
        firma: {
          include: {
            yetkiliKisiler: true,
          },
        },
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

    return NextResponse.json(toplanti)
  } catch (error) {
    console.error('Toplantı güncelleme hatası:', error)
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

    const { id } = await params

    await prisma.toplanti.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Toplantı silme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


