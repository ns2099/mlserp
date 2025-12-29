import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Tüm teklifleri çek (güncel veri için tüm kayıtlar)
    const tumTeklifler = await prisma.teklif.findMany({
      select: {
        durum: true,
        createdAt: true,
        teklifTarihi: true,
      },
    })

    // Aylık verileri durumlara göre grupla
    const aylikTekliflerDurumluMap = new Map<string, number>()
    
    tumTeklifler.forEach((teklif) => {
      try {
        const tarih = teklif.teklifTarihi || teklif.createdAt
        if (!tarih) return
        
        const ay = tarih.getMonth() + 1
        const durum = teklif.durum
        const key = `${ay}-${durum}`

        const mevcutSayi = aylikTekliflerDurumluMap.get(key) || 0
        aylikTekliflerDurumluMap.set(key, mevcutSayi + 1)
      } catch (error) {
        console.error('Teklif işlenirken hata:', error)
      }
    })

    // Map'ten array'e dönüştür
    const aylikTekliflerDurumlu: Array<{ ay: number; durum: number; sayi: number }> = []
    aylikTekliflerDurumluMap.forEach((sayi, key) => {
      const [ay, durum] = key.split('-').map(Number)
      aylikTekliflerDurumlu.push({ ay, durum, sayi })
    })

    // Ay ve duruma göre sırala
    aylikTekliflerDurumlu.sort((a, b) => {
      if (a.ay !== b.ay) return a.ay - b.ay
      return a.durum - b.durum
    })

    // Güncel veri için cache yok
    return NextResponse.json(aylikTekliflerDurumlu, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Aylık teklif verileri çekilirken hata:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}




