import { prisma } from '@/lib/prisma'
import UretimDevamEdenWrapper from './UretimDevamEdenWrapper'

export const dynamic = 'force-dynamic'

export default async function UretimDevamEdenPage() {
  const uretimlerRaw = await prisma.uretim.findMany({
    where: { 
      durum: { in: ['Üretimde', 'Son Kontrol'] }
    },
    include: {
      teklif: {
        include: {
          firma: true,
        },
      },
      user: true,
    },
    orderBy: { baslangicTarihi: 'desc' },
  })

  // Date'leri string'e çevir
  const uretimler = uretimlerRaw.map((u) => ({
    id: u.id,
    durum: u.durum,
    baslangicTarihi: u.baslangicTarihi.toISOString(),
    bitisTarihi: u.bitisTarihi?.toISOString() || null,
    aciklama: u.aciklama,
    teklif: {
      id: u.teklif.id,
      ad: (u.teklif as any).ad || null,
      firma: {
        ad: u.teklif.firma?.ad || 'Firma Yok',
      },
      toplamFiyat: u.teklif.toplamFiyat,
    },
    user: {
      adSoyad: u.user.adSoyad,
    },
  }))

  return <UretimDevamEdenWrapper uretimler={uretimler} />
}
