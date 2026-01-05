import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { createAuditLog, generateAuditDescription } from '@/lib/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teklif = await prisma.teklif.findUnique({
      where: { id: params.id },
      include: {
        firma: true,
        user: true,
        teklifUrunler: true,
      },
    })

    if (!teklif) {
      return NextResponse.json({ error: 'Teklif bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(teklif)
  } catch (error) {
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
    const { firmaId, toplamFiyat, aciklama, durum, urunler } = body

    if (!firmaId || !urunler || urunler.length === 0) {
      return NextResponse.json(
        { error: 'Firma ve ürünler gerekli' },
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

    // Mevcut ürünleri sil
    await prisma.teklifUrun.deleteMany({
      where: { teklifId: params.id },
    })

    // Firma bilgisini al
    const firma = await prisma.firma.findUnique({
      where: { id: firmaId },
    })

    // Teklifi güncelle
    const teklif = await prisma.teklif.update({
      where: { id: params.id },
      data: {
        firmaId,
        toplamFiyat: toplamFiyat || 0,
        aciklama: aciklama || null,
        durum: durum || 1,
        teklifUrunler: {
          create: urunler.map((u: any) => ({
            urunAdi: u.urunAdi,
            miktar: u.miktar,
            birimFiyat: u.birimFiyat,
            toplamFiyat: u.toplamFiyat,
            aciklama: u.aciklama || null,
          })),
        },
      },
      include: {
        firma: true,
        teklifUrunler: true,
      },
    })

    // Değişiklikleri tespit et
    const degisiklikler: { alan: string; eski: any; yeni: any }[] = []
    if (eskiTeklif.firmaId !== firmaId) {
      degisiklikler.push({ alan: 'firma', eski: eskiTeklif.firma?.ad || '', yeni: firma?.ad || '' })
    }
    if (eskiTeklif.toplamFiyat !== toplamFiyat) {
      degisiklikler.push({ alan: 'toplamFiyat', eski: eskiTeklif.toplamFiyat, yeni: toplamFiyat })
    }
    if (eskiTeklif.durum !== durum) {
      const durumlar: Record<number, string> = { 1: 'Bekleyen', 2: 'Onaylanan', 3: 'Reddedilen', 4: 'Tamamlanan' }
      degisiklikler.push({ alan: 'durum', eski: durumlar[eskiTeklif.durum] || eskiTeklif.durum, yeni: durumlar[durum || 1] || durum })
    }

    // Audit log oluştur
    await createAuditLog({
      tablo: 'Teklif',
      kayitId: params.id,
      kayitAdi: `${firma?.ad || 'Bilinmeyen'} - ${toplamFiyat.toFixed(2)} €`,
      islem: 'Güncellendi',
      kullaniciId: session.id,
      aciklama: generateAuditDescription('Teklif', 'Güncellendi', `${firma?.ad || 'Bilinmeyen'} - ${toplamFiyat.toFixed(2)} €`, degisiklikler),
      eskiDeger: eskiTeklif,
      yeniDeger: teklif,
    })

    return NextResponse.json(teklif)
  } catch (error) {
    console.error('Teklif güncelleme hatası:', error)
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

    const teklif = await prisma.teklif.findUnique({
      where: { id: params.id },
      include: {
        firma: true,
        uretimler: true,
        planlamalar: true,
      },
    })

    if (!teklif) {
      return NextResponse.json({ error: 'Teklif bulunamadı' }, { status: 404 })
    }

    // İlişkili üretimler varsa silinemez
    if (teklif.uretimler.length > 0) {
      return NextResponse.json(
        { error: 'Bu teklife ait üretimler bulunduğu için silinemez. Önce üretimleri silin.' },
        { status: 400 }
      )
    }

    // Planlamaları sil
    await prisma.planlama.deleteMany({
      where: { teklifId: params.id },
    })

    // İlişkili kayıtları sil (cascade)
    await prisma.teklifUrun.deleteMany({
      where: { teklifId: params.id },
    })

    await prisma.teklif.delete({
      where: { id: params.id },
    })

    // Audit log oluştur
    await createAuditLog({
      tablo: 'Teklif',
      kayitId: params.id,
      kayitAdi: `${teklif.firma?.ad || 'Firma Yok'} - ${teklif.toplamFiyat.toFixed(2)} €`,
      islem: 'Silindi',
      kullaniciId: session.id,
      aciklama: generateAuditDescription('Teklif', 'Silindi', `${teklif.firma?.ad || 'Firma Yok'} - ${teklif.toplamFiyat.toFixed(2)} €`),
    })

    return NextResponse.json({ message: 'Teklif silindi' })
  } catch (error) {
    console.error('Teklif silme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

