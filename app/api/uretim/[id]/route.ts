import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const uretim = await prisma.uretim.findUnique({
      where: { id: params.id },
      include: {
        teklif: {
          include: {
            firma: true,
          },
        },
        user: true,
        gelismeler: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!uretim) {
      return NextResponse.json({ error: 'Üretim bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(uretim)
  } catch (error) {
    console.error('Üretim detay hatası:', error)
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
    const { durum } = body

    if (!durum) {
      return NextResponse.json({ error: 'Durum gerekli' }, { status: 400 })
    }

    const gecerliDurumlar = ['Üretimde', 'Son Kontrol', 'Onaylandı']
    if (!gecerliDurumlar.includes(durum)) {
      return NextResponse.json(
        { error: 'Geçerli bir durum gerekli (Üretimde, Son Kontrol, Onaylandı)' },
        { status: 400 }
      )
    }

    const eskiUretim = await prisma.uretim.findUnique({
      where: { id: params.id },
      include: {
        teklif: {
          include: {
            firma: true,
          },
        },
      },
    })

    if (!eskiUretim) {
      return NextResponse.json({ error: 'Üretim bulunamadı' }, { status: 404 })
    }

    const updateData: any = { durum }
    
    // Eğer durum "Onaylandı" ise bitiş tarihini ekle
    if (durum === 'Onaylandı' && !eskiUretim.bitisTarihi) {
      updateData.bitisTarihi = new Date()
    }

    const uretim = await prisma.uretim.update({
      where: { id: params.id },
      data: updateData,
      include: {
        teklif: {
          include: {
            firma: true,
          },
        },
        user: true,
      },
    })

    return NextResponse.json(uretim)
  } catch (error) {
    console.error('Üretim durum güncelleme hatası:', error)
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

    const uretim = await prisma.uretim.findUnique({
      where: { id: params.id },
      include: {
        teklif: {
          include: {
            firma: true,
          },
        },
      },
    })

    if (!uretim) {
      return NextResponse.json({ error: 'Üretim bulunamadı' }, { status: 404 })
    }

    // İlişkili kayıtları sil (cascade zaten var ama manuel de silebiliriz)
    await prisma.urunGideri.deleteMany({
      where: { uretimId: params.id },
    })

    await prisma.uretimGelisme.deleteMany({
      where: { uretimId: params.id },
    })

    await prisma.makinaAtama.deleteMany({
      where: { uretimId: params.id },
    })

    await prisma.uretim.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Üretim silindi' })
  } catch (error) {
    console.error('Üretim silme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

