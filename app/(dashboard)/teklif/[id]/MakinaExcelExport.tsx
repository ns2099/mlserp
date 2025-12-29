'use client'

import { Download } from 'lucide-react'
import { exportToExcel } from '@/lib/excel-export'

interface MakinaBilesen {
  ad: string
  aciklama: string | null
  miktar: number
  birimMaliyet: number
  paraBirimi: string
  toplamMaliyet: number
}

interface Makina {
  id: string
  ad: string
  model: string | null
  durum: string
  aciklama: string | null
  toplamMaliyet: number
  makinaBilesenleri: MakinaBilesen[]
}

export default function MakinaExcelExport({ makina }: { makina: Makina | null }) {
  if (!makina) return null

  const handleExport = () => {
    const data = makina.makinaBilesenleri.map((bilesen) => ({
      'Bileşen Adı': bilesen.ad,
      'Açıklama': bilesen.aciklama || '',
      'Miktar': bilesen.miktar,
      'Para Birimi': bilesen.paraBirimi,
      'Birim Maliyet': bilesen.birimMaliyet.toFixed(2),
      'Toplam Maliyet (EUR)': bilesen.toplamMaliyet.toFixed(2),
    }))

    exportToExcel(
      data,
      [
        { header: 'Bileşen Adı', key: 'Bileşen Adı' },
        { header: 'Açıklama', key: 'Açıklama' },
        { header: 'Miktar', key: 'Miktar' },
        { header: 'Para Birimi', key: 'Para Birimi' },
        { header: 'Birim Maliyet', key: 'Birim Maliyet' },
        { header: 'Toplam Maliyet (EUR)', key: 'Toplam Maliyet (EUR)' },
      ],
      `${makina.ad}_${makina.model || 'makina'}_bilesenler`
    )
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      <Download size={16} />
      Makine Bileşenlerini Excel'e Aktar
    </button>
  )
}








