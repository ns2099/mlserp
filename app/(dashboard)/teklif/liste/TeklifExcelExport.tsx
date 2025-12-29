'use client'

import { Download } from 'lucide-react'
import { exportToExcel } from '@/lib/excel-export'

interface TeklifUrun {
  urunAdi: string
  miktar: number
  birimFiyat: number
  toplamFiyat: number
}

interface Teklif {
  id: string
  ad: string | null
  durum: number
  toplamFiyat: number
  createdAt: string
  firma: {
    ad: string
  }
  makina: {
    ad: string
  } | null
  user: {
    adSoyad: string
  }
  teklifUrunler?: TeklifUrun[]
}

const durumLabels: Record<number, string> = {
  1: 'Bekleyen',
  2: 'Onaylanan',
  3: 'Reddedilen',
  4: 'Tamamlanan',
}

export default function TeklifExcelExport({
  teklifler,
  selectedIds,
}: {
  teklifler: Teklif[]
  selectedIds?: string[]
}) {
  const handleExport = () => {
    const exportTeklifler = selectedIds
      ? teklifler.filter((t) => selectedIds.includes(t.id))
      : teklifler

    if (exportTeklifler.length === 0) {
      alert('Dışa aktarılacak teklif seçilmedi')
      return
    }

    // Her teklif için detaylı bilgileri içeren Excel
    const data: any[] = []

    exportTeklifler.forEach((teklif) => {
      // Ana teklif bilgisi
      data.push({
        'Teklif Adı': teklif.ad || '',
        'Firma': teklif.firma.ad,
        'Makina': teklif.makina?.ad || '',
        'Durum': durumLabels[teklif.durum],
        'Toplam Fiyat': teklif.toplamFiyat.toFixed(2),
        'Oluşturan': teklif.user.adSoyad,
        'Tarih': new Date(teklif.createdAt).toLocaleDateString('tr-TR'),
        'Ürün Adı': '',
        'Ürün Miktar': '',
        'Ürün Birim Fiyat': '',
        'Ürün Toplam': '',
      })

      // Ürünler
      if (teklif.teklifUrunler && teklif.teklifUrunler.length > 0) {
        teklif.teklifUrunler.forEach((urun) => {
          data.push({
            'Teklif Adı': '',
            'Firma': '',
            'Makina': '',
            'Durum': '',
            'Toplam Fiyat': '',
            'Oluşturan': '',
            'Tarih': '',
            'Ürün Adı': urun.urunAdi,
            'Ürün Miktar': urun.miktar,
            'Ürün Birim Fiyat': urun.birimFiyat.toFixed(2),
            'Ürün Toplam': urun.toplamFiyat.toFixed(2),
          })
        })
      }

      // Boş satır
      data.push({
        'Teklif Adı': '',
        'Firma': '',
        'Makina': '',
        'Durum': '',
        'Toplam Fiyat': '',
        'Oluşturan': '',
        'Tarih': '',
        'Ürün Adı': '',
        'Ürün Miktar': '',
        'Ürün Birim Fiyat': '',
        'Ürün Toplam': '',
      })
    })

    exportToExcel(
      data,
      [
        { header: 'Teklif Adı', key: 'Teklif Adı' },
        { header: 'Firma', key: 'Firma' },
        { header: 'Makina', key: 'Makina' },
        { header: 'Durum', key: 'Durum' },
        { header: 'Toplam Fiyat', key: 'Toplam Fiyat' },
        { header: 'Oluşturan', key: 'Oluşturan' },
        { header: 'Tarih', key: 'Tarih' },
        { header: 'Ürün Adı', key: 'Ürün Adı' },
        { header: 'Ürün Miktar', key: 'Ürün Miktar' },
        { header: 'Ürün Birim Fiyat', key: 'Ürün Birim Fiyat' },
        { header: 'Ürün Toplam', key: 'Ürün Toplam' },
      ],
      selectedIds ? 'secili_teklifler' : 'teklifler_listesi'
    )
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      <Download size={20} />
      {selectedIds && selectedIds.length > 0
        ? `Seçili Teklifleri Aktar (${selectedIds.length})`
        : 'Tümünü Excel\'e Aktar'}
    </button>
  )
}








