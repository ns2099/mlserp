import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { createAuditLog, generateAuditDescription } from '@/lib/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const makina = await prisma.makina.findUnique({
      where: { id: params.id },
      include: {
        makinaBilesenleri: true,
      },
    })

    if (!makina) {
      return NextResponse.json({ error: 'Makina bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(makina)
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
    const { ad, model, durum, aciklama, fotograf, toplamMaliyet, bilesenler } = body

    if (!ad) {
      return NextResponse.json({ error: 'Makina adı gerekli' }, { status: 400 })
    }

    // Eski değerleri al
    const eskiMakina = await prisma.makina.findUnique({
      where: { id: params.id },
      include: { makinaBilesenleri: true },
    })

    if (!eskiMakina) {
      return NextResponse.json({ error: 'Makina bulunamadı' }, { status: 404 })
    }

    // Mevcut bileşenleri sil
    await prisma.makinaBilesen.deleteMany({
      where: { makinaId: params.id },
    })

    // Bileşenlerin toplam maliyetini hesapla (EUR cinsinden)
    const hesaplananToplam = bilesenler
      ? bilesenler.reduce((sum: number, b: any) => sum + (b.toplamMaliyet || 0), 0)
      : toplamMaliyet || eskiMakina.toplamMaliyet || 0

    // Değişiklikleri tespit et
    const degisiklikler: { alan: string; eski: any; yeni: any }[] = []
    if (eskiMakina.ad !== ad) degisiklikler.push({ alan: 'ad', eski: eskiMakina.ad, yeni: ad })
    if (eskiMakina.model !== model) degisiklikler.push({ alan: 'model', eski: eskiMakina.model || '', yeni: model || '' })
    if (eskiMakina.durum !== durum) degisiklikler.push({ alan: 'durum', eski: eskiMakina.durum, yeni: durum || 'Aktif' })
    if (eskiMakina.aciklama !== aciklama) degisiklikler.push({ alan: 'aciklama', eski: eskiMakina.aciklama || '', yeni: aciklama || '' })
    if (eskiMakina.toplamMaliyet !== hesaplananToplam) degisiklikler.push({ alan: 'toplamMaliyet', eski: eskiMakina.toplamMaliyet || 0, yeni: hesaplananToplam })

    const makina = await prisma.makina.update({
      where: { id: params.id },
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
    if (degisiklikler.length > 0) {
      await createAuditLog({
        tablo: 'Makina',
        kayitId: params.id,
        kayitAdi: ad,
        islem: 'Güncellendi',
        kullaniciId: session.id,
        aciklama: generateAuditDescription('Makina', 'Güncellendi', ad, degisiklikler),
        eskiDeger: eskiMakina,
        yeniDeger: makina,
      })
    }

    return NextResponse.json(makina)
  } catch (error) {
    console.error('Makina güncelleme hatası:', error)
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

    const makina = await prisma.makina.findUnique({
      where: { id: params.id },
      include: {
        teklifler: true,
        makinaAtamalar: true,
      },
    })

    if (!makina) {
      return NextResponse.json({ error: 'Makina bulunamadı' }, { status: 404 })
    }

    // İlişkili teklifler varsa silinemez
    if (makina.teklifler.length > 0) {
      return NextResponse.json(
        { error: 'Bu makineye ait teklifler bulunduğu için silinemez. Önce teklifleri silin.' },
        { status: 400 }
      )
    }

    // Makina atamaları varsa silinemez
    if (makina.makinaAtamalar.length > 0) {
      return NextResponse.json(
        { error: 'Bu makine üretimde kullanıldığı için silinemez.' },
        { status: 400 }
      )
    }

    // Bileşenleri sil (cascade zaten var ama manuel de silebiliriz)
    await prisma.makinaBilesen.deleteMany({
      where: { makinaId: params.id },
    })

    await prisma.makina.delete({
      where: { id: params.id },
    })

    // Audit log oluştur
    await createAuditLog({
      tablo: 'Makina',
      kayitId: params.id,
      kayitAdi: makina.ad,
      islem: 'Silindi',
      kullaniciId: session.id,
      aciklama: generateAuditDescription('Makina', 'Silindi', makina.ad),
    })

    return NextResponse.json({ message: 'Makina silindi' })
  } catch (error) {
    console.error('Makina silme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
