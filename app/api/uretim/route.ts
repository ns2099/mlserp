import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const uretimler = await prisma.uretim.findMany({
      include: {
        teklif: {
          include: {
            firma: true,
          },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(uretimler)
  } catch (error) {
    console.error('Üretim listesi hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error('JSON parse hatası:', error)
      return NextResponse.json({ error: 'Geçersiz JSON formatı' }, { status: 400 })
    }

    const { teklifId, aciklama } = body

    if (!teklifId || typeof teklifId !== 'string') {
      return NextResponse.json({ error: 'Teklif ID gerekli' }, { status: 400 })
    }

    // Teklifin onaylanmış olduğunu kontrol et
    const teklif = await prisma.teklif.findUnique({
      where: { id: teklifId },
      include: { firma: true },
    })

    if (!teklif) {
      return NextResponse.json({ error: 'Teklif bulunamadı' }, { status: 404 })
    }

    if (teklif.durum !== 2) {
      return NextResponse.json(
        { error: 'Sadece onaylanmış teklifler için üretim oluşturulabilir' },
        { status: 400 }
      )
    }

    // Zaten bu teklif için üretim var mı kontrol et - sadece "Üretimde" durumunu kontrol et
    const mevcutUretim = await prisma.uretim.findFirst({
      where: {
        teklifId,
        durum: 'Üretimde',
      },
    })

    if (mevcutUretim) {
      return NextResponse.json(
        { error: 'Bu teklif için zaten "Üretimde" durumunda bir üretim kaydı var' },
        { status: 400 }
      )
    }

    const uretim = await prisma.uretim.create({
      data: {
        teklifId,
        userId: session.id,
        durum: 'Üretimde',
        aciklama: aciklama || null,
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

    return NextResponse.json(uretim, { status: 201 })
  } catch (error) {
    console.error('Üretim oluşturma hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}




