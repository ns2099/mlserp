'use client'

import { FileDown } from 'lucide-react'
import { exportToPdf } from '@/lib/pdf-export'

interface Uretim {
  id: string
  durum: string
  baslangicTarihi: string
  bitisTarihi: string | null
  aciklama: string | null
  teklif: {
    ad: string | null
    firma: {
      ad: string
    } | null
    toplamFiyat: number
  }
  user: {
    adSoyad: string | null
  }
}

export default function UretimPdfExport({
  uretimler,
  selectedIds,
}: {
  uretimler: Uretim[]
  selectedIds?: string[]
}) {
  const handleExport = async () => {
    const exportUretimler = selectedIds
      ? uretimler.filter((u) => selectedIds.includes(u.id))
      : uretimler

    if (exportUretimler.length === 0) {
      alert('PDF için üretim seçilmedi')
      return
    }

    const rows = exportUretimler.map((uretim) => ({
      teklif: uretim.teklif.ad || '-',
      firma: uretim.teklif.firma?.ad || 'Firma Yok',
      baslangic: new Date(uretim.baslangicTarihi).toLocaleDateString('tr-TR'),
      bitis: uretim.bitisTarihi
        ? new Date(uretim.bitisTarihi).toLocaleDateString('tr-TR')
        : '-',
      sorumlu: uretim.user.adSoyad || '',
      durum: uretim.durum,
      fiyat: `${uretim.teklif.toplamFiyat.toFixed(2)} €`,
    }))

    await exportToPdf(
      rows,
      [
        { header: 'Teklif', key: 'teklif' },
        { header: 'Firma', key: 'firma' },
        { header: 'Başlangıç', key: 'baslangic' },
        { header: 'Bitiş', key: 'bitis' },
        { header: 'Sorumlu', key: 'sorumlu' },
        { header: 'Durum', key: 'durum' },
        { header: 'Toplam Fiyat', key: 'fiyat' },
      ],
      selectedIds ? 'secili_uretimler' : 'uretimler_listesi',
      {
        title: 'Üretimde Olanlar',
        orientation: 'l',
      }
    )
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
    >
      <FileDown size={20} />
      {selectedIds && selectedIds.length > 0
        ? `Seçili Üretimleri PDF Aktar (${selectedIds.length})`
        : 'Tümünü PDF Aktar'}
    </button>
  )
}


