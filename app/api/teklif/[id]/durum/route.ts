import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { createAuditLog, generateAuditDescription } from '@/lib/audit'

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

    if (!durum || (durum < 1 || durum > 4)) {
      return NextResponse.json(
        { error: 'Geçerli bir durum gerekli (1-4)' },
        { status: 400 }
      )
    }

    // Eski teklifi al
    const eskiTeklif = await prisma.teklif.findUnique({
      where: { id: params.id },
      include: { firma: true },
    })

    if (!eskiTeklif) {
      return NextResponse.json({ error: 'Teklif bulunamadı' }, { status: 404 })
    }

    const teklif = await prisma.teklif.update({
      where: { id: params.id },
      data: { durum },
      include: {
        firma: true,
        user: true,
      },
    })

    // Durum değişikliği için audit log
    const durumlar: Record<number, string> = { 1: 'Bekleyen', 2: 'Onaylanan', 3: 'Reddedilen', 4: 'Tamamlanan' }
    const degisiklikler = [
      { alan: 'durum', eski: durumlar[eskiTeklif.durum] || eskiTeklif.durum, yeni: durumlar[durum] || durum }
    ]

    await createAuditLog({
      tablo: 'Teklif',
      kayitId: params.id,
      kayitAdi: `${teklif.firma?.ad || 'Firma Yok'} - ${teklif.toplamFiyat.toFixed(2)} €`,
      islem: 'Güncellendi',
      kullaniciId: session.id,
      aciklama: generateAuditDescription('Teklif', 'Güncellendi', `${teklif.firma?.ad || 'Firma Yok'} - ${teklif.toplamFiyat.toFixed(2)} €`, degisiklikler),
      eskiDeger: eskiTeklif,
      yeniDeger: teklif,
    })

    return NextResponse.json(teklif)
  } catch (error) {
    console.error('Teklif durum güncelleme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

