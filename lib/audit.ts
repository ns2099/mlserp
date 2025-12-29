import { prisma } from './prisma'

interface AuditLogData {
  tablo: 'Firma' | 'Teklif' | 'Makina'
  kayitId: string
  kayitAdi?: string
  islem: 'Oluşturuldu' | 'Güncellendi' | 'Silindi'
  kullaniciId: string
  aciklama: string
  eskiDeger?: any
  yeniDeger?: any
}

export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.duzenlemeGecmisi.create({
      data: {
        tablo: data.tablo,
        kayitId: data.kayitId,
        kayitAdi: data.kayitAdi || null,
        islem: data.islem,
        kullaniciId: data.kullaniciId,
        aciklama: data.aciklama,
        eskiDeger: data.eskiDeger ? JSON.stringify(data.eskiDeger) : null,
        yeniDeger: data.yeniDeger ? JSON.stringify(data.yeniDeger) : null,
      },
    })
  } catch (error) {
    console.error('Audit log oluşturma hatası:', error)
    // Hata olsa bile işlemi durdurma
  }
}

export function generateAuditDescription(
  tablo: string,
  islem: string,
  kayitAdi: string,
  degisiklikler?: { alan: string; eski: any; yeni: any }[]
): string {
  if (islem === 'Oluşturuldu') {
    return `${tablo} "${kayitAdi}" oluşturuldu.`
  }
  
  if (islem === 'Silindi') {
    return `${tablo} "${kayitAdi}" silindi.`
  }

  if (islem === 'Güncellendi' && degisiklikler && degisiklikler.length > 0) {
    const degisiklikListesi = degisiklikler
      .map((d) => {
        if (d.alan === 'durum') {
          const durumlar: Record<string, string> = {
            '1': 'Bekleyen',
            '2': 'Onaylanan',
            '3': 'Reddedilen',
            '4': 'Tamamlanan',
          }
          return `durum "${durumlar[d.eski] || d.eski}" → "${durumlar[d.yeni] || d.yeni}"`
        }
        return `${d.alan} "${d.eski}" → "${d.yeni}"`
      })
      .join(', ')
    return `${tablo} "${kayitAdi}" güncellendi: ${degisiklikListesi}.`
  }

  return `${tablo} "${kayitAdi}" güncellendi.`
}
