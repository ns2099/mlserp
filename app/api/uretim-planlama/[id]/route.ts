import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

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
    const { adimAdi, kullaniciId, makinaId, baslangicTarihi, bitisTarihi, isMaliyeti, durum, aciklama } = body

    const adim = await prisma.uretimPlanlamaAdimi.update({
      where: { id: params.id },
      data: {
        adimAdi: adimAdi,
        kullaniciId: kullaniciId,
        makinaId: makinaId || null,
        baslangicTarihi: new Date(baslangicTarihi),
        bitisTarihi: new Date(bitisTarihi),
        isMaliyeti: isMaliyeti || 0,
        durum: durum || 'Planlandı',
        aciklama: aciklama || null,
      },
      include: {
        kullanici: true,
        makina: true,
        teklif: {
          include: {
            firma: true,
          },
        },
      },
    })

    return NextResponse.json(adim)
  } catch (error) {
    console.error('Üretim planlama adımı güncelleme hatası:', error)
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

    await prisma.uretimPlanlamaAdimi.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Üretim planlama adımı silme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}



















