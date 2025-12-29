import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import DashboardStats from '@/components/DashboardStats'
import DashboardCharts from '@/components/DashboardCharts'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // İstatistikleri getir
  const [
    toplamTeklif,
    bekleyenTeklifler,
    onaylananTeklifler,
    reddedilenTeklifler,
    tamamlananTeklifler,
    bekleyenToplam,
    onaylananToplam,
    tamamlananToplam,
    tumUretimDurumlariRaw,
  ] = await Promise.all([
    prisma.teklif.count(),
    prisma.teklif.count({ where: { durum: 1 } }),
    prisma.teklif.count({ where: { durum: 2 } }),
    prisma.teklif.count({ where: { durum: 3 } }),
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
    // Tüm üretimleri çek (durum kontrolü için)
    prisma.uretim.findMany({ select: { durum: true } }),
  ])

  // Üretim durumlarını hesapla
  const tumUretimler = tumUretimDurumlariRaw as Array<{ durum: string }>
  const durumGruplari = tumUretimler.reduce((acc, u) => {
    const durum = (u.durum || '').trim() // Boşlukları temizle ve null kontrolü yap
    if (durum) {
      acc[durum] = (acc[durum] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Debug: Gerçek üretim durumlarını kontrol et
  console.log('Dashboard - Üretim durumları (ham):', durumGruplari)
  console.log('Dashboard - Tüm üretim sayısı:', tumUretimler.length)

  // Durumları doğru şekilde say
  const aktifUretimlerSayisi = (durumGruplari['Üretimde'] || 0) + (durumGruplari['Son Kontrol'] || 0)
  const sonKontrolSayisi = durumGruplari['Son Kontrol'] || 0
  const onaylananUretimlerSayisi = durumGruplari['Onaylandı'] || 0
  const tamamlananUretimlerSayisi = durumGruplari['Onaylandı'] || 0 // Sistemde "Onaylandı" = tamamlanmış

  console.log('Dashboard - Hesaplanan değerler:')
  console.log('  Aktif üretimler:', aktifUretimlerSayisi)
  console.log('  Son kontrol:', sonKontrolSayisi)
  console.log('  Onaylanan üretimler:', onaylananUretimlerSayisi)
  console.log('  Tamamlanan üretimler:', tamamlananUretimlerSayisi)

  // Tüm teklifleri çek ve JavaScript tarafında aylara göre grupla
  // Bu şekilde DashboardStats ile aynı veri kaynağını kullanmış oluyoruz
  const tumTeklifler = await prisma.teklif.findMany({
    select: {
      durum: true,
      createdAt: true,
      teklifTarihi: true,
    },
  })

  // Debug: Kaç teklif geldi?
  console.log('Dashboard - Toplam teklif sayısı:', tumTeklifler.length)
  console.log('Dashboard - İlk teklif örneği:', tumTeklifler[0])

  // Aylık verileri durumlara göre grupla
  const aylikTekliflerDurumluMap = new Map<string, number>()
  
  tumTeklifler.forEach((teklif) => {
    try {
      // teklifTarihi varsa onu kullan, yoksa createdAt kullan
      const tarih = teklif.teklifTarihi || teklif.createdAt
      if (!tarih) {
        console.warn('Teklif tarihi bulunamadı:', teklif)
        return
      }
      
      const ay = tarih.getMonth() + 1 // JavaScript'te ay 0-11 arası, biz 1-12 istiyoruz
      const durum = teklif.durum
      const key = `${ay}-${durum}`

      // Map'te sayıyı artır
      const mevcutSayi = aylikTekliflerDurumluMap.get(key) || 0
      aylikTekliflerDurumluMap.set(key, mevcutSayi + 1)
    } catch (error) {
      console.error('Teklif işlenirken hata:', error, teklif)
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

  // Debug: İşlenmiş veri
  console.log('Dashboard - İşlenmiş aylık veri:', JSON.stringify(aylikTekliflerDurumlu, null, 2))
  console.log('Dashboard - İşlenmiş veri uzunluğu:', aylikTekliflerDurumlu.length)

  // Next.js serialize sorununu önlemek için veriyi JSON-safe hale getir
  // Sadece sayılar içerdiği için direkt kullanabiliriz ama yine de güvenli hale getirelim
  const aylikTekliflerDurumluSerialized: Array<{ ay: number; durum: number; sayi: number }> = 
    JSON.parse(JSON.stringify(aylikTekliflerDurumlu.map(item => ({
      ay: Number(item.ay),
      durum: Number(item.durum),
      sayi: Number(item.sayi),
    }))))
  
  console.log('Dashboard - Serialize edilmiş veri:', JSON.stringify(aylikTekliflerDurumluSerialized, null, 2))
  console.log('Dashboard - Serialize edilmiş veri uzunluğu:', aylikTekliflerDurumluSerialized.length)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Anasayfa</h1>
        <p className="text-gray-600 mt-1">Hoşgeldin, {session?.user?.name}</p>
      </div>

      <DashboardStats
        toplamTeklif={toplamTeklif ?? 0}
        bekleyenTeklifler={bekleyenTeklifler ?? 0}
        onaylananTeklifler={onaylananTeklifler ?? 0}
        tamamlananTeklifler={tamamlananTeklifler ?? 0}
        bekleyenToplam={bekleyenToplam._sum.toplamFiyat || 0}
        onaylananToplam={onaylananToplam._sum.toplamFiyat || 0}
        tamamlananToplam={tamamlananToplam._sum.toplamFiyat || 0}
        uretimdeOlanlar={aktifUretimlerSayisi ?? 0}
        sonKontrol={sonKontrolSayisi ?? 0}
        onaylananUretimler={onaylananUretimlerSayisi ?? 0}
        tamamlananUretimler={tamamlananUretimlerSayisi ?? 0}
      />

      <DashboardCharts 
        aylikTekliflerDurumlu={aylikTekliflerDurumluSerialized} 
      />
    </div>
  )
}
