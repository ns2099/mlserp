import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { createAuditLog, generateAuditDescription } from '@/lib/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const firma = await prisma.firma.findUnique({
      where: { id },
      include: {
        yetkiliKisiler: true,
      },
    })

    if (!firma) {
      return NextResponse.json({ error: 'Firma bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(firma)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { ad, telefon, email, adres, yetkiliKisiler } = body

    if (!ad) {
      return NextResponse.json({ error: 'Firma adı gerekli' }, { status: 400 })
    }

    // Eski değerleri al
    const eskiFirma = await prisma.firma.findUnique({
      where: { id },
      include: {
        yetkiliKisiler: true,
      },
    })

    if (!eskiFirma) {
      return NextResponse.json({ error: 'Firma bulunamadı' }, { status: 404 })
    }

    // Değişiklikleri tespit et
    const degisiklikler: { alan: string; eski: any; yeni: any }[] = []
    if (eskiFirma.ad !== ad) degisiklikler.push({ alan: 'ad', eski: eskiFirma.ad, yeni: ad })
    if (eskiFirma.telefon !== telefon) degisiklikler.push({ alan: 'telefon', eski: eskiFirma.telefon || '', yeni: telefon || '' })
    if (eskiFirma.email !== email) degisiklikler.push({ alan: 'email', eski: eskiFirma.email || '', yeni: email || '' })
    if (eskiFirma.adres !== adres) degisiklikler.push({ alan: 'adres', eski: eskiFirma.adres || '', yeni: adres || '' })

    // Mevcut yetkili kişilerin ID'lerini al
    const mevcutIds = (yetkiliKisiler || [])
      .map((k: any) => k.id)
      .filter((id: string) => id)

    // Silinecek yetkili kişileri bul ve sil
    const silinecekler = eskiFirma.yetkiliKisiler.filter(
      (k) => !mevcutIds.includes(k.id)
    )
    for (const kisi of silinecekler) {
      await prisma.yetkiliKisi.delete({
        where: { id: kisi.id },
      })
    }

    // Yeni ve güncellenecek yetkili kişileri işle
    if (yetkiliKisiler && Array.isArray(yetkiliKisiler)) {
      for (const kisi of yetkiliKisiler) {
        if (kisi.id) {
          // Güncelle
          await prisma.yetkiliKisi.update({
            where: { id: kisi.id },
            data: {
              adSoyad: kisi.adSoyad,
              telefon: kisi.telefon || null,
              email: kisi.email || null,
              pozisyon: kisi.pozisyon || null,
            },
          })
        } else {
          // Yeni ekle
          await prisma.yetkiliKisi.create({
            data: {
              firmaId: id,
              adSoyad: kisi.adSoyad,
              telefon: kisi.telefon || null,
              email: kisi.email || null,
              pozisyon: kisi.pozisyon || null,
            },
          })
        }
      }
    }

    const firma = await prisma.firma.update({
      where: { id },
      data: {
        ad,
        telefon: telefon || null,
        email: email || null,
        adres: adres || null,
      },
      include: {
        yetkiliKisiler: true,
      },
    })

    // Audit log oluştur
    if (degisiklikler.length > 0) {
      await createAuditLog({
        tablo: 'Firma',
        kayitId: id,
        kayitAdi: ad,
        islem: 'Güncellendi',
        kullaniciId: session.id,
        aciklama: generateAuditDescription('Firma', 'Güncellendi', ad, degisiklikler),
        eskiDeger: eskiFirma,
        yeniDeger: firma,
      })
    }

    return NextResponse.json(firma)
  } catch (error) {
    console.error('Firma güncelleme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const firma = await prisma.firma.findUnique({
      where: { id },
      include: {
        teklifler: true,
        yetkiliKisiler: true,
      },
    })

    if (!firma) {
      return NextResponse.json({ error: 'Firma bulunamadı' }, { status: 404 })
    }

    // İlişkili teklifler varsa silinemez
    if (firma.teklifler.length > 0) {
      return NextResponse.json(
        { error: 'Bu firmaya ait teklifler bulunduğu için silinemez. Önce teklifleri silin.' },
        { status: 400 }
      )
    }

    // Yetkili kişileri sil (cascade zaten var ama manuel de silebiliriz)
    await prisma.yetkiliKisi.deleteMany({
      where: { firmaId: id },
    })

    await prisma.firma.delete({
      where: { id },
    })

    // Audit log oluştur
    await createAuditLog({
      tablo: 'Firma',
      kayitId: id,
      kayitAdi: firma.ad,
      islem: 'Silindi',
      kullaniciId: session.id,
      aciklama: generateAuditDescription('Firma', 'Silindi', firma.ad),
    })

    return NextResponse.json({ message: 'Firma silindi' })
  } catch (error) {
    console.error('Firma silme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

