import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teklifId = searchParams.get('teklifId')

    if (teklifId) {
      // Belirli bir teklif için planlama adımlarını getir
      const adimlar = await prisma.uretimPlanlamaAdimi.findMany({
        where: { teklifId },
        include: {
          kullanici: true,
          makina: true,
          teklif: {
            include: {
              firma: true,
            },
          },
        },
        orderBy: { siraNo: 'asc' },
      })
      return NextResponse.json(adimlar)
    }

    // Tüm planlama adımlarını getir
    const adimlar = await prisma.uretimPlanlamaAdimi.findMany({
      include: {
        kullanici: true,
        makina: true,
        teklif: {
          include: {
            firma: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(adimlar)
  } catch (error) {
    console.error('Üretim planlama adımları getirme hatası:', error)
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
    const { teklifId, adimlar } = body

    if (!teklifId || !adimlar || !Array.isArray(adimlar) || adimlar.length === 0) {
      return NextResponse.json(
        { error: 'Teklif ID ve en az bir adım gerekli' },
        { status: 400 }
      )
    }

    // Teklifin onaylanmış olduğunu kontrol et
    const teklif = await prisma.teklif.findUnique({
      where: { id: teklifId },
    })

    if (!teklif) {
      return NextResponse.json({ error: 'Teklif bulunamadı' }, { status: 404 })
    }

    if (teklif.durum !== 2) {
      return NextResponse.json(
        { error: 'Sadece onaylanmış teklifler için üretim planlama oluşturulabilir' },
        { status: 400 }
      )
    }

    // Mevcut adımları sil
    await prisma.uretimPlanlamaAdimi.deleteMany({
      where: { teklifId },
    })

    // Yeni adımları oluştur
    const olusturulanAdimlar = await prisma.uretimPlanlamaAdimi.createMany({
      data: adimlar.map((adim: any) => ({
        teklifId,
        adimAdi: adim.adimAdi,
        siraNo: adim.siraNo,
        kullaniciId: adim.kullaniciId,
        makinaId: adim.makinaId || null,
        baslangicTarihi: new Date(adim.baslangicTarihi),
        bitisTarihi: new Date(adim.bitisTarihi),
        isMaliyeti: adim.isMaliyeti || 0,
        durum: adim.durum || 'Planlandı',
        aciklama: adim.aciklama || null,
      })),
    })

    // Oluşturulan adımları tekrar getir
    const yeniAdimlar = await prisma.uretimPlanlamaAdimi.findMany({
      where: { teklifId },
      include: {
        kullanici: true,
        makina: true,
        teklif: {
          include: {
            firma: true,
          },
        },
      },
      orderBy: { siraNo: 'asc' },
    })

    return NextResponse.json(yeniAdimlar, { status: 201 })
  } catch (error) {
    console.error('Üretim planlama oluşturma hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}










