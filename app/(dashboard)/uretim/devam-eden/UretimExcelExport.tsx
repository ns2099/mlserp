'use client'

import { Download } from 'lucide-react'
import { exportToExcel } from '@/lib/excel-export'

interface Uretim {
  id: string
  durum: string
  baslangicTarihi: string
  bitisTarihi: string | null
  aciklama: string | null
  teklif: {
    id: string
    ad: string | null
    firma: {
      ad: string
    }
    toplamFiyat: number
  }
  user: {
    adSoyad: string
  }
}

export default function UretimExcelExport({
  uretimler,
  selectedIds,
}: {
  uretimler: Uretim[]
  selectedIds?: string[]
}) {
  const handleExport = () => {
    const exportUretimler = selectedIds
      ? uretimler.filter((u) => selectedIds.includes(u.id))
      : uretimler

    if (exportUretimler.length === 0) {
      alert('Dışa aktarılacak üretim seçilmedi')
      return
    }

    const data = exportUretimler.map((uretim) => ({
      'Teklif Adı': uretim.teklif.ad || '',
      'Firma': uretim.teklif.firma.ad,
      'Durum': uretim.durum,
      'Başlangıç Tarihi': uretim.baslangicTarihi,
      'Bitiş Tarihi': uretim.bitisTarihi || '',
      'Sorumlu': uretim.user.adSoyad,
      'Toplam Fiyat': uretim.teklif.toplamFiyat,
      'Açıklama': uretim.aciklama || '',
    }))

    exportToExcel(
      data,
      [
        { header: 'Teklif Adı', key: 'Teklif Adı' },
        { header: 'Firma', key: 'Firma' },
        { header: 'Durum', key: 'Durum' },
        { header: 'Başlangıç Tarihi', key: 'Başlangıç Tarihi' },
        { header: 'Bitiş Tarihi', key: 'Bitiş Tarihi' },
        { header: 'Sorumlu', key: 'Sorumlu' },
        { header: 'Toplam Fiyat', key: 'Toplam Fiyat' },
        { header: 'Açıklama', key: 'Açıklama' },
      ],
      selectedIds ? 'secili_uretimler' : 'uretimler_listesi',
      {
        // Tekil format kuralları: tarih, para birimi ve sayı alanlarını netleştirir
        rules: [
          { key: 'Başlangıç Tarihi', type: 'date', locale: 'tr-TR' },
          { key: 'Bitiş Tarihi', type: 'date', locale: 'tr-TR' },
          { key: 'Toplam Fiyat', type: 'currency', currency: 'EUR', locale: 'tr-TR' },
        ],
      }
    )
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      <Download size={20} />
      {selectedIds && selectedIds.length > 0
        ? `Seçili Üretimleri Aktar (${selectedIds.length})`
        : 'Tümünü Excel\'e Aktar'}
    </button>
  )
}


