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
    const adimId = searchParams.get('adimId')

    const uretimId = searchParams.get('uretimId')

    if (adimId) {
      // Belirli bir adım için satın almaları getir
      const satinAlmalar = await prisma.satinAlma.findMany({
        where: { uretimPlanlamaAdimiId: adimId },
        include: {
          uretim: {
            include: {
              teklif: {
                include: {
                  firma: true,
                },
              },
            },
          },
          uretimPlanlamaAdimi: {
            include: {
              teklif: {
                include: {
                  firma: true,
                },
              },
              kullanici: true,
              makina: true,
            },
          },
          teklifler: true,
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(satinAlmalar)
    }

    if (uretimId) {
      // Belirli bir üretim için tüm satın almaları getir
      const satinAlmalar = await prisma.satinAlma.findMany({
        where: { uretimId },
        include: {
          uretim: {
            include: {
              teklif: {
                include: {
                  firma: true,
                },
              },
            },
          },
          uretimPlanlamaAdimi: {
            include: {
              teklif: {
                include: {
                  firma: true,
                },
              },
              kullanici: true,
              makina: true,
            },
          },
          teklifler: true,
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(satinAlmalar)
    }

    if (teklifId) {
      // Belirli bir teklif için tüm satın almaları getir
      const satinAlmalar = await prisma.satinAlma.findMany({
        where: {
          uretimPlanlamaAdimi: {
            teklifId,
          },
        },
        include: {
          uretim: {
            include: {
              teklif: {
                include: {
                  firma: true,
                },
              },
            },
          },
          uretimPlanlamaAdimi: {
            include: {
              teklif: {
                include: {
                  firma: true,
                },
              },
              kullanici: true,
              makina: true,
            },
          },
          teklifler: true,
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(satinAlmalar)
    }

    // Tüm satın almaları getir
    const satinAlmalar = await prisma.satinAlma.findMany({
      include: {
        uretim: {
          include: {
            teklif: {
              include: {
                firma: true,
              },
            },
          },
        },
        uretimPlanlamaAdimi: {
          include: {
            teklif: {
              include: {
                firma: true,
              },
            },
            kullanici: true,
            makina: true,
          },
        },
        teklifler: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(satinAlmalar)
  } catch (error) {
    console.error('Satın alma listesi hatası:', error)
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
    const {
      genelGider,
      tekrarlayanMi,
      tekrarlamaSuresi,
      uretimId,
      uretimPlanlamaAdimiId,
      urunAdi,
      miktar,
      birim,
      birimFiyat,
      toplamFiyat,
      tedarikciFirma,
      tedarikciIletisim,
      durum,
      siparisTarihi,
      teslimTarihi,
      faturaNo,
      aciklama,
    } = body

    if (!urunAdi || !miktar || !birimFiyat) {
      return NextResponse.json(
        { error: 'Ürün adı, miktar ve birim fiyat gerekli' },
        { status: 400 }
      )
    }

    // Genel gider değilse üretim kontrolü yap
    if (!genelGider) {
      if (!uretimId) {
        return NextResponse.json(
          { error: 'Genel gider değilse üretim seçimi zorunludur' },
          { status: 400 }
        )
      }

      const uretim = await prisma.uretim.findUnique({
        where: { id: uretimId },
      })

      if (!uretim) {
        return NextResponse.json({ error: 'Üretim bulunamadı' }, { status: 404 })
      }

      // Eğer planlama adımı seçilmişse, üretime ait olduğunu kontrol et
      if (uretimPlanlamaAdimiId) {
        const adim = await prisma.uretimPlanlamaAdimi.findUnique({
          where: { id: uretimPlanlamaAdimiId },
          include: { teklif: true },
        })

        if (!adim) {
          return NextResponse.json({ error: 'Üretim planlama adımı bulunamadı' }, { status: 404 })
        }

        if (adim.teklifId !== uretim.teklifId) {
          return NextResponse.json(
            { error: 'Üretim planlama adımı seçilen üretime ait değil' },
            { status: 400 }
          )
        }
      }
    }

    const hesaplananToplam = miktar * birimFiyat

    // Tekrarlayan gider için sonraki tekrar tarihini hesapla
    let sonrakiTekrarTarihi: Date | null = null
    if (genelGider && tekrarlayanMi && tekrarlamaSuresi && teslimTarihi) {
      const teslimTarih = new Date(teslimTarihi)
      sonrakiTekrarTarihi = new Date(teslimTarih)
      
      switch (tekrarlamaSuresi) {
        case 'Günlük':
          sonrakiTekrarTarihi.setDate(sonrakiTekrarTarihi.getDate() + 1)
          break
        case 'Haftalık':
          sonrakiTekrarTarihi.setDate(sonrakiTekrarTarihi.getDate() + 7)
          break
        case 'Aylık':
          sonrakiTekrarTarihi.setMonth(sonrakiTekrarTarihi.getMonth() + 1)
          break
        case 'Üç Aylık':
          sonrakiTekrarTarihi.setMonth(sonrakiTekrarTarihi.getMonth() + 3)
          break
        case 'Altı Aylık':
          sonrakiTekrarTarihi.setMonth(sonrakiTekrarTarihi.getMonth() + 6)
          break
        case 'Yıllık':
          sonrakiTekrarTarihi.setFullYear(sonrakiTekrarTarihi.getFullYear() + 1)
          break
      }
    }

    const satinAlma = await prisma.satinAlma.create({
      data: {
        genelGider: genelGider || false,
        tekrarlayanMi: (genelGider && tekrarlayanMi) || false,
        tekrarlamaSuresi: (genelGider && tekrarlayanMi && tekrarlamaSuresi) || null,
        sonrakiTekrarTarihi: sonrakiTekrarTarihi,
        uretimId: genelGider ? null : uretimId,
        uretimPlanlamaAdimiId: genelGider ? null : (uretimPlanlamaAdimiId || null),
        urunAdi,
        miktar: parseFloat(miktar),
        birim: birim || 'Adet',
        birimFiyat: parseFloat(birimFiyat),
        toplamFiyat: toplamFiyat || hesaplananToplam,
        tedarikciFirma: tedarikciFirma || null,
        tedarikciIletisim: tedarikciIletisim || null,
        durum: durum || 'Planlandı',
        siparisTarihi: siparisTarihi ? new Date(siparisTarihi) : null,
        teslimTarihi: teslimTarihi ? new Date(teslimTarihi) : null,
        faturaNo: faturaNo || null,
        aciklama: aciklama || null,
      },
      include: {
        uretimPlanlamaAdimi: {
          include: {
            teklif: {
              include: {
                firma: true,
              },
            },
            kullanici: true,
            makina: true,
          },
        },
      },
    })

    return NextResponse.json(satinAlma, { status: 201 })
  } catch (error) {
    console.error('Satın alma oluşturma hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

