'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

interface Odeme {
  id: string
  tur: string
  tutar: number
  paraBirimi: string
  odemeTarihi: string
  odemeYontemi: string
  aciklama: string | null
  teklif: {
    ad: string | null
    firma: {
      ad: string
    } | null
  } | null
  user: {
    adSoyad: string | null
    username: string
  }
}

export default function OdemeExcelExport({
  odemeler,
  selectedIds,
}: {
  odemeler: Odeme[]
  selectedIds: string[]
}) {
  const [loading, setLoading] = useState(false)

  const exportToExcel = () => {
    setLoading(true)
    try {
      const dataToExport =
        selectedIds.length > 0
          ? odemeler.filter((o) => selectedIds.includes(o.id))
          : odemeler

      // CSV formatına dönüştür
      const headers = [
        'Tür',
        'Tutar',
        'Para Birimi',
        'Ödeme Tarihi',
        'Ödeme Yöntemi',
        'Teklif',
        'Firma',
        'Oluşturan',
        'Açıklama',
      ]

      const rows = dataToExport.map((odeme) => [
        odeme.tur,
        odeme.tutar.toString(),
        odeme.paraBirimi,
        new Date(odeme.odemeTarihi).toLocaleDateString('tr-TR'),
        odeme.odemeYontemi,
        odeme.teklif?.ad || '-',
        odeme.teklif?.firma?.ad || '-',
        odeme.user.adSoyad || odeme.user.username,
        odeme.aciklama || '-',
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n')

      // BOM ekle (Excel'de Türkçe karakterler için)
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `odemeler_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export hatası:', error)
      alert('Excel export sırasında bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={exportToExcel}
      disabled={loading || odemeler.length === 0}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download size={20} />
      {loading ? 'Export ediliyor...' : 'Excel\'e Aktar'}
    </button>
  )
}



















