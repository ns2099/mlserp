import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; teklifId: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tedarikciAdi, teklifNo, birimFiyat, toplamFiyat, teslimSuresi, odemeKosullari, aciklama, durum } = body

    const teklif = await prisma.satinAlmaTeklif.update({
      where: { id: params.teklifId },
      data: {
        tedarikciAdi,
        teklifNo: teklifNo !== undefined ? teklifNo : undefined,
        birimFiyat: birimFiyat !== undefined ? parseFloat(birimFiyat) : undefined,
        toplamFiyat: toplamFiyat !== undefined ? parseFloat(toplamFiyat) : undefined,
        teslimSuresi: teslimSuresi !== undefined ? (teslimSuresi ? parseInt(teslimSuresi) : null) : undefined,
        odemeKosullari: odemeKosullari !== undefined ? odemeKosullari : undefined,
        aciklama: aciklama !== undefined ? aciklama : undefined,
        durum,
      },
    })

    return NextResponse.json(teklif)
  } catch (error) {
    console.error('Satın alma teklifi güncelleme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; teklifId: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.satinAlmaTeklif.delete({
      where: { id: params.teklifId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Satın alma teklifi silme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


















