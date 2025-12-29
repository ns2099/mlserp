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

    const satinAlma = await prisma.satinAlma.findUnique({
      where: { id: params.id },
      include: {
        uretim: {
          include: {
            teklif: {
              include: {
                firma: true,
              },
            },
          },
        },
        uretimPlanlamaAdimi: {
          include: {
            teklif: {
              include: {
                firma: true,
              },
            },
            kullanici: true,
            makina: true,
          },
        },
        teklifler: true,
      },
    })

    if (!satinAlma) {
      return NextResponse.json({ error: 'Satın alma bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(satinAlma)
  } catch (error) {
    console.error('Satın alma getirme hatası:', error)
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
    const {
      urunAdi,
      miktar,
      birim,
      birimFiyat,
      toplamFiyat,
      tedarikciFirma,
      tedarikciIletisim,
      durum,
      siparisTarihi,
      teslimTarihi,
      faturaNo,
      aciklama,
    } = body

    const hesaplananToplam = miktar && birimFiyat ? miktar * birimFiyat : undefined

    const satinAlma = await prisma.satinAlma.update({
      where: { id: params.id },
      data: {
        urunAdi,
        miktar: miktar !== undefined ? parseFloat(miktar) : undefined,
        birim,
        birimFiyat: birimFiyat !== undefined ? parseFloat(birimFiyat) : undefined,
        toplamFiyat: toplamFiyat !== undefined ? parseFloat(toplamFiyat) : hesaplananToplam,
        tedarikciFirma: tedarikciFirma !== undefined ? tedarikciFirma : undefined,
        tedarikciIletisim: tedarikciIletisim !== undefined ? tedarikciIletisim : undefined,
        durum,
        siparisTarihi: siparisTarihi ? new Date(siparisTarihi) : null,
        teslimTarihi: teslimTarihi ? new Date(teslimTarihi) : null,
        faturaNo: faturaNo !== undefined ? faturaNo : undefined,
        aciklama: aciklama !== undefined ? aciklama : undefined,
      },
      include: {
        uretim: {
          include: {
            teklif: {
              include: {
                firma: true,
              },
            },
          },
        },
        uretimPlanlamaAdimi: {
          include: {
            teklif: {
              include: {
                firma: true,
              },
            },
            kullanici: true,
            makina: true,
          },
        },
        teklifler: true,
      },
    })

    return NextResponse.json(satinAlma)
  } catch (error) {
    console.error('Satın alma güncelleme hatası:', error)
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

    await prisma.satinAlma.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Satın alma silme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

