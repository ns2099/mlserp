import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import DashboardStats from '@/components/DashboardStats'
import DashboardCharts from '@/components/DashboardCharts'
import { formatDate } from '@/lib/utils'
import { redirect } from 'next/navigation'

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
      createdAt: true,
    },
  })

  // Ayları grupla
  const aylikMap = new Map<number, number>()
  tumTeklifler.forEach((teklif) => {
    const ay = teklif.createdAt.getMonth() + 1
    aylikMap.set(ay, (aylikMap.get(ay) || 0) + 1)
  })

  // Map'ten array'e dönüştür
  const aylikTeklifler: Array<{ ay: number; sayi: number }> = []
  for (let ay = 1; ay <= 12; ay++) {
    aylikTeklifler.push({
      ay,
      sayi: aylikMap.get(ay) || 0,
    })
  }

  // Üretilen makineleri getir
  const uretilenMakinalar = await prisma.uretim.findMany({
    where: {
      durum: { in: ['Üretimde', 'Onaylandı'] },
    },
    include: {
      teklif: {
        include: {
          makina: true,
          firma: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5, // Son 5 üretim
  })

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
      />

      <DashboardCharts aylikTeklifler={aylikTeklifler} />
    </div>
  )
}

