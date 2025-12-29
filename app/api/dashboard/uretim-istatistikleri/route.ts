import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Tüm üretim durumlarını kontrol et
    const tumUretimler = await prisma.uretim.findMany({
      select: {
        durum: true,
      },
    })

    // Durumları say
    const durumSayilari = {
      'Üretimde': 0,
      'Son Kontrol': 0,
      'Onaylandı': 0,
      'Tamamlandı': 0,
    }

    tumUretimler.forEach((u) => {
      if (u.durum in durumSayilari) {
        durumSayilari[u.durum as keyof typeof durumSayilari]++
      } else {
        console.warn('Bilinmeyen üretim durumu:', u.durum)
      }
    })

    // Aktif üretimler: Üretimde + Son Kontrol
    const aktifUretimler = durumSayilari['Üretimde'] + durumSayilari['Son Kontrol']
    
    // Tamamlanan üretimler: Onaylandı (sistemde "Tamamlandı" yok)
    const tamamlananUretimler = durumSayilari['Onaylandı']

    return NextResponse.json({
      aktifUretimler,
      sonKontrol: durumSayilari['Son Kontrol'],
      onaylananUretimler: durumSayilari['Onaylandı'],
      tamamlananUretimler,
      detayli: durumSayilari,
      toplam: tumUretimler.length,
    })
  } catch (error) {
    console.error('Üretim istatistikleri hatası:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}




