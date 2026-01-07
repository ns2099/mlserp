import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import DashboardStats from '@/components/DashboardStats'
import DashboardCharts from '@/components/DashboardCharts'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  // İstatistikleri getir
  const [
    toplamTeklif,
    bekleyenTeklifler,
    onaylananTeklifler,
    tamamlananTeklifler,
    bekleyenToplam,
    onaylananToplam,
    tamamlananToplam,
  ] = await Promise.all([
    prisma.teklif.count(),
    prisma.teklif.count({ where: { durum: 1 } }),
    prisma.teklif.count({ where: { durum: 2 } }),
    prisma.teklif.count({ where: { durum: 4 } }),
    prisma.teklif.aggregate({
      where: { durum: 1 },
      _sum: { toplamFiyat: true },
    }),
    prisma.teklif.aggregate({
      where: { durum: 2 },
      _sum: { toplamFiyat: true },
    }),
    prisma.teklif.aggregate({
      where: { durum: 4 },
      _sum: { toplamFiyat: true },
    }),
  ])

  // Aylık teklif verilerini getir (Prisma ile - database agnostic)
  const tumTeklifler = await prisma.teklif.findMany({
    where: {
      createdAt: {
        gte: new Date(new Date().getFullYear(), 0, 1), // Bu yılın başı
      },
    },
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

  // Serialize
  const aylikTekliflerDurumluSerialized: Array<{ ay: number; durum: number; sayi: number }> = 
    JSON.parse(JSON.stringify(aylikTekliflerDurumlu.map(item => ({
      ay: Number(item.ay),
      durum: Number(item.durum),
      sayi: Number(item.sayi),
    }))))

  // Üretim durumlarını hesapla
  const tumUretimler = await prisma.uretim.findMany({ select: { durum: true } })
  const durumGruplari = tumUretimler.reduce((acc, u) => {
    const durum = (u.durum || '').trim()
    if (durum) {
      acc[durum] = (acc[durum] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const aktifUretimlerSayisi = (durumGruplari['Üretimde'] || 0) + (durumGruplari['Son Kontrol'] || 0)
  const sonKontrolSayisi = durumGruplari['Son Kontrol'] || 0
  const onaylananUretimlerSayisi = durumGruplari['Onaylandı'] || 0
  const tamamlananUretimlerSayisi = durumGruplari['Onaylandı'] || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Anasayfa</h1>
        <p className="text-gray-600 mt-1">
          Hoşgeldin, {session.name || 'Admin'}
        </p>
      </div>

      <DashboardStats
        toplamTeklif={toplamTeklif}
        bekleyenTeklifler={bekleyenTeklifler}
        onaylananTeklifler={onaylananTeklifler}
        tamamlananTeklifler={tamamlananTeklifler}
        bekleyenToplam={bekleyenToplam._sum.toplamFiyat || 0}
        onaylananToplam={onaylananToplam._sum.toplamFiyat || 0}
        tamamlananToplam={tamamlananToplam._sum.toplamFiyat || 0}
        uretimdeOlanlar={aktifUretimlerSayisi}
        sonKontrol={sonKontrolSayisi}
        onaylananUretimler={onaylananUretimlerSayisi}
        tamamlananUretimler={tamamlananUretimlerSayisi}
      />

      <DashboardCharts aylikTekliflerDurumlu={aylikTekliflerDurumluSerialized} />
    </div>
  )
}
