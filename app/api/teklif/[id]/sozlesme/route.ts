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

    const teklifId = params.id

    // Teklifin var olup olmadığını kontrol et
    const teklif = await prisma.teklif.findUnique({
      where: { id: teklifId },
    })

    if (!teklif) {
      return NextResponse.json({ error: 'Teklif bulunamadı' }, { status: 404 })
    }

    // Sözleşmeyi bul veya null döndür
    const sozlesme = await prisma.sozlesme.findUnique({
      where: { teklifId },
    })

    return NextResponse.json(sozlesme)
  } catch (error) {
    console.error('Sözleşme getirme hatası:', error)
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

    const teklifId = params.id
    const body = await request.json()
    const { dosyaUrl, notlar } = body

    // Teklifin var olup olmadığını kontrol et
    const teklif = await prisma.teklif.findUnique({
      where: { id: teklifId },
    })

    if (!teklif) {
      return NextResponse.json({ error: 'Teklif bulunamadı' }, { status: 404 })
    }

    // Mevcut sözleşmeyi kontrol et
    const mevcutSozlesme = await prisma.sozlesme.findUnique({
      where: { teklifId },
    })

    let sozlesme
    if (mevcutSozlesme) {
      // Güncelle
      sozlesme = await prisma.sozlesme.update({
        where: { teklifId },
        data: {
          dosyaUrl: dosyaUrl !== undefined ? dosyaUrl : mevcutSozlesme.dosyaUrl,
          notlar: notlar !== undefined ? notlar : mevcutSozlesme.notlar,
        },
      })
    } else {
      // Yeni oluştur
      sozlesme = await prisma.sozlesme.create({
        data: {
          teklifId,
          dosyaUrl: dosyaUrl || null,
          notlar: notlar || null,
        },
      })
    }

    return NextResponse.json(sozlesme)
  } catch (error) {
    console.error('Sözleşme kaydetme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
