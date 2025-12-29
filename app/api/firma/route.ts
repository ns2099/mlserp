import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { createAuditLog, generateAuditDescription } from '@/lib/audit'

export async function GET() {
  try {
    // Geçici olarak session kontrolü kaldırıldı
    const firmalar = await prisma.firma.findMany({
      include: {
        yetkiliKisiler: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(firmalar)
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
    const { ad, telefon, email, adres, yetkiliKisi } = body

    if (!ad) {
      return NextResponse.json({ error: 'Firma adı gerekli' }, { status: 400 })
    }

    const firma = await prisma.firma.create({
      data: {
        ad,
        telefon: telefon || null,
        email: email || null,
        adres: adres || null,
        yetkiliKisiler: yetkiliKisi
          ? {
              create: {
                adSoyad: yetkiliKisi.adSoyad,
                telefon: yetkiliKisi.telefon || null,
                email: yetkiliKisi.email || null,
                pozisyon: yetkiliKisi.pozisyon || null,
              },
            }
          : undefined,
      },
      include: {
        yetkiliKisiler: true,
      },
    })

    // Audit log oluştur
    await createAuditLog({
      tablo: 'Firma',
      kayitId: firma.id,
      kayitAdi: ad,
      islem: 'Oluşturuldu',
      kullaniciId: session.id,
      aciklama: generateAuditDescription('Firma', 'Oluşturuldu', ad),
      yeniDeger: firma,
    })

    return NextResponse.json(firma, { status: 201 })
  } catch (error) {
    console.error('Firma oluşturma hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

