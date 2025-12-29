import { prisma } from '@/lib/prisma'
import UretimTamamlananWrapper from './UretimTamamlananWrapper'

export default async function UretimTamamlananPage() {
  const uretimlerRaw = await prisma.uretim.findMany({
    where: { durum: 'Onaylandı' },
    include: {
      teklif: {
        include: {
          firma: true,
        },
      },
      user: true,
    },
    orderBy: { bitisTarihi: 'desc' },
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
      ad: u.teklif.ad || null,
      firma: {
        ad: u.teklif.firma.ad,
      },
      toplamFiyat: u.teklif.toplamFiyat,
    },
    user: {
      adSoyad: u.user.adSoyad,
    },
  }))

  return <UretimTamamlananWrapper uretimler={uretimler} />
}

