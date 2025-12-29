import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { createAuditLog, generateAuditDescription } from '@/lib/audit'

export async function GET() {
  try {
    // Geçici olarak session kontrolü kaldırıldı
    const makinalar = await prisma.makina.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(makinalar)
  } catch (error) {
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
    const { ad, model, durum, aciklama, fotograf, toplamMaliyet, bilesenler } = body

    if (!ad) {
      return NextResponse.json({ error: 'Makina adı gerekli' }, { status: 400 })
    }

    // Bileşenlerin toplam maliyetini hesapla (EUR cinsinden)
    const hesaplananToplam = bilesenler
      ? bilesenler.reduce((sum: number, b: any) => sum + (b.toplamMaliyet || 0), 0)
      : toplamMaliyet || 0

    const makina = await prisma.makina.create({
      data: {
        ad,
        model: model || null,
        durum: durum || 'Aktif',
        aciklama: aciklama || null,
        fotograf: fotograf || null,
        toplamMaliyet: hesaplananToplam,
        makinaBilesenleri: bilesenler
          ? {
              create: bilesenler.map((b: any) => ({
                ad: b.ad,
                aciklama: b.aciklama || null,
                miktar: b.miktar || 1,
                birimMaliyet: b.birimMaliyet || 0,
                paraBirimi: b.paraBirimi || 'EUR',
                toplamMaliyet: b.toplamMaliyet || 0, // EUR cinsinden
              })),
            }
          : undefined,
      },
      include: {
        makinaBilesenleri: true,
      },
    })

    // Audit log oluştur
    await createAuditLog({
      tablo: 'Makina',
      kayitId: makina.id,
      kayitAdi: ad,
      islem: 'Oluşturuldu',
      kullaniciId: session.id,
      aciklama: generateAuditDescription('Makina', 'Oluşturuldu', ad),
      yeniDeger: makina,
    })

    return NextResponse.json(makina, { status: 201 })
  } catch (error) {
    console.error('Makina oluşturma hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

