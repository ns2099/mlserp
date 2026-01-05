import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { createAuditLog, generateAuditDescription } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    // Geçici olarak session kontrolü kaldırıldı
    const searchParams = request.nextUrl.searchParams
    const durum = searchParams.get('durum')

    const where: any = {}
    if (durum && durum !== 'tum') {
      where.durum = parseInt(durum)
    }

    const teklifler = await prisma.teklif.findMany({
      where,
      include: {
        firma: true,
        makina: true,
        user: true,
        teklifUrunler: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(teklifler)
  } catch (error) {
    console.error('Teklif listeleme hatası:', error)
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
    console.log('Gelen veri:', JSON.stringify(body, null, 2))
    
    const { ad, firmaId, makinaId, toplamFiyat, aciklama, teklifTarihi, urunler } = body

    // Ürünler opsiyonel, ama varsa boş olmamalı
    const urunlerList = Array.isArray(urunler) ? urunler : []
    
    console.log('Session ID:', session.id)
    console.log('Firma ID:', firmaId)
    console.log('Ürün sayısı:', urunlerList.length)

    // User kontrolü - session.id'nin veritabanında olup olmadığını kontrol et
    const user = await prisma.user.findUnique({
      where: { id: session.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.' }, { status: 404 })
    }

    // Veri tiplerini doğrula ve dönüştür
    const toplamFiyatNum = typeof toplamFiyat === 'string' ? parseFloat(toplamFiyat) : Number(toplamFiyat) || 0

    // Firma kontrolü - eğer firmaId varsa kontrol et
    let validFirmaId: string | null = null
    let firma: any = null
    if (firmaId && String(firmaId).trim() !== '') {
      firma = await prisma.firma.findUnique({
        where: { id: String(firmaId).trim() },
      })

      if (!firma) {
        return NextResponse.json({ error: 'Firma bulunamadı' }, { status: 404 })
      }
      validFirmaId = firma.id
    }

    // Makina kontrolü (eğer makinaId varsa)
    let validMakinaId: string | null = null
    if (makinaId && String(makinaId).trim() !== '') {
      try {
        const makina = await prisma.makina.findUnique({
          where: { id: String(makinaId).trim() },
        })
        if (makina) {
          validMakinaId = makina.id
        }
        // Makina bulunamazsa null kalır, hata fırlatmıyoruz
      } catch (err) {
        console.warn('Makina kontrolü sırasında hata:', err)
        // Hata durumunda null kalır
      }
    }

    // Ürünleri doğrula ve dönüştür - sadece geçerli olanları al
    const validatedUrunler = urunlerList
      .filter((u: any) => u && u.urunAdi && String(u.urunAdi).trim() !== '')
      .map((u: any) => {
        const miktar = parseInt(String(u.miktar || 1), 10)
        const birimFiyat = parseFloat(String(u.birimFiyat || 0))
        const toplamFiyatUrun = parseFloat(String(u.toplamFiyat || 0))

        return {
          urunAdi: String(u.urunAdi).trim(),
          miktar: isNaN(miktar) || miktar < 1 ? 1 : miktar,
          birimFiyat: isNaN(birimFiyat) || birimFiyat < 0 ? 0 : birimFiyat,
          toplamFiyat: isNaN(toplamFiyatUrun) || toplamFiyatUrun < 0 ? 0 : toplamFiyatUrun,
          aciklama: u.aciklama && String(u.aciklama).trim() !== '' ? String(u.aciklama).trim() : null,
        }
      })

    // Veri hazırlığı - tüm değerleri kontrol et
    const teklifData: {
      ad: string | null
      firmaId: string | null
      userId: string
      toplamFiyat: number
      durum: number
      makinaId?: string | null
      aciklama?: string | null
      teklifTarihi?: Date | null
    } = {
      ad: ad && String(ad).trim() !== '' ? String(ad).trim() : null,
      firmaId: validFirmaId,
      userId: String(session.id).trim(),
      toplamFiyat: Number(toplamFiyatNum),
      durum: 1, // Bekleyen
    }

    // Teklif tarihi varsa ekle (geriye yönelik olabilir)
    if (teklifTarihi && String(teklifTarihi).trim() !== '') {
      try {
        const tarih = new Date(String(teklifTarihi))
        if (!isNaN(tarih.getTime())) {
          teklifData.teklifTarihi = tarih
        }
      } catch (err) {
        console.warn('Teklif tarihi parse edilemedi:', err)
      }
    }

    // MakinaId sadece varsa ekle
    if (validMakinaId) {
      teklifData.makinaId = validMakinaId
    } else {
      teklifData.makinaId = null
    }

    // Aciklama sadece varsa ekle
    if (aciklama && String(aciklama).trim() !== '') {
      const aciklamaStr = String(aciklama).trim()
      // SQLite TEXT limiti çok yüksek ama yine de kontrol edelim
      if (aciklamaStr.length <= 1000000) {
        teklifData.aciklama = aciklamaStr
      } else {
        console.warn('Açıklama çok uzun, kısaltılıyor')
        teklifData.aciklama = aciklamaStr.substring(0, 1000000)
      }
    } else {
      teklifData.aciklama = null
    }

    console.log('Teklif oluşturuluyor:', JSON.stringify(teklifData, null, 2))
    console.log('Validated ürünler:', JSON.stringify(validatedUrunler, null, 2))

    // Önce teklifi oluştur
    console.log('Prisma create çağrılıyor...')
    const teklif = await prisma.teklif.create({
      data: teklifData,
      include: {
        firma: true,
        makina: true,
      },
    })
    console.log('Teklif oluşturuldu:', teklif.id)

    // Sonra ürünleri ekle
    if (validatedUrunler.length > 0) {
      await prisma.teklifUrun.createMany({
        data: validatedUrunler.map((u: { urunAdi: string; miktar: number; birimFiyat: number; toplamFiyat: number; aciklama: string | null }) => ({
          teklifId: teklif.id,
          urunAdi: u.urunAdi,
          miktar: u.miktar,
          birimFiyat: u.birimFiyat,
          toplamFiyat: u.toplamFiyat,
          aciklama: u.aciklama,
        })),
      })
    }

    // Teklifi tekrar çek (ürünlerle birlikte)
    const teklifWithUrunler = await prisma.teklif.findUnique({
      where: { id: teklif.id },
      include: {
        firma: true,
        makina: true,
        teklifUrunler: true,
      },
    })

    // Audit log oluştur
    if (teklifWithUrunler) {
      const firmaAdi = firma?.ad || 'Firma Yok'
      await createAuditLog({
        tablo: 'Teklif',
        kayitId: teklifWithUrunler.id,
        kayitAdi: `${firmaAdi} - ${toplamFiyatNum.toFixed(2)} €`,
        islem: 'Oluşturuldu',
        kullaniciId: session.id,
        aciklama: generateAuditDescription('Teklif', 'Oluşturuldu', `${firmaAdi} - ${toplamFiyatNum.toFixed(2)} €`),
        yeniDeger: JSON.stringify(teklifWithUrunler),
      })

      return NextResponse.json(teklifWithUrunler, { status: 201 })
    }

    return NextResponse.json(teklif, { status: 201 })
  } catch (error) {
    console.error('=== TEKLIF OLUŞTURMA HATASI ===')
    console.error('Hata tipi:', typeof error)
    console.error('Hata:', error)
    
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    // Prisma hatası için özel mesaj
    if (error && typeof error === 'object') {
      const errorObj = error as any
      console.error('Error object keys:', Object.keys(errorObj))
      console.error('Error code:', errorObj.code)
      console.error('Error meta:', errorObj.meta)
      
      if ('code' in errorObj) {
        return NextResponse.json(
          {
            error: 'Veritabanı hatası',
            details: errorObj.message || 'Prisma hatası oluştu',
            code: errorObj.code,
            meta: errorObj.meta,
          },
          { status: 500 }
        )
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Final error message:', errorMessage)
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: errorMessage,
        fullError: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : String(error),
      },
      { status: 500 }
    )
  }
}

