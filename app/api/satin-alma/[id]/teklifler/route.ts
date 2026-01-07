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

    const teklifler = await prisma.satinAlmaTeklif.findMany({
      where: { satinAlmaId: params.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(teklifler)
  } catch (error) {
    console.error('Satın alma teklifleri getirme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tedarikciAdi, teklifNo, birimFiyat, toplamFiyat, teslimSuresi, odemeKosullari, aciklama, durum } = body

    if (!tedarikciAdi || !birimFiyat || !toplamFiyat) {
      return NextResponse.json(
        { error: 'Tedarikçi adı, birim fiyat ve toplam fiyat gerekli' },
        { status: 400 }
      )
    }

    // Satın almanın var olduğunu kontrol et
    const satinAlma = await prisma.satinAlma.findUnique({
      where: { id: params.id },
    })

    if (!satinAlma) {
      return NextResponse.json({ error: 'Satın alma bulunamadı' }, { status: 404 })
    }

    const teklif = await prisma.satinAlmaTeklif.create({
      data: {
        satinAlmaId: params.id,
        tedarikciAdi,
        teklifNo: teklifNo || null,
        birimFiyat: parseFloat(birimFiyat),
        toplamFiyat: parseFloat(toplamFiyat),
        teslimSuresi: teslimSuresi ? parseInt(teslimSuresi) : null,
        odemeKosullari: odemeKosullari || null,
        aciklama: aciklama || null,
        durum: durum || 'Beklemede',
      },
    })

    return NextResponse.json(teklif, { status: 201 })
  } catch (error) {
    console.error('Satın alma teklifi oluşturma hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


















