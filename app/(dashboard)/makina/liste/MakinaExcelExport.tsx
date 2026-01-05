'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { exportToExcel } from '@/lib/excel-export'

interface Makina {
  id: string
  ad: string
  model: string | null
  durum: string
  toplamMaliyet: number
  createdAt: Date | string
  makinaBilesenleri?: Array<{
    ad: string
    miktar: number
    birimMaliyet: number
    paraBirimi: string
    toplamMaliyet: number
  }>
}

export default function MakinaExcelExport({
  makinalar,
  selectedIds,
}: {
  makinalar: Makina[]
  selectedIds?: string[]
}) {
  const handleExport = () => {
    const exportMakinalar = selectedIds
      ? makinalar.filter((m) => selectedIds.includes(m.id))
      : makinalar

    if (exportMakinalar.length === 0) {
      alert('Dışa aktarılacak makina seçilmedi')
      return
    }

    const data = exportMakinalar.map((makina) => ({
      'Makina Adı': makina.ad,
      'Model': makina.model || '',
      'Durum': makina.durum,
      'Toplam Maliyet (EUR)': makina.toplamMaliyet.toFixed(2),
      'Oluşturulma Tarihi': new Date(makina.createdAt).toLocaleDateString('tr-TR'),
    }))

    exportToExcel(
      data,
      [
        { header: 'Makina Adı', key: 'Makina Adı' },
        { header: 'Model', key: 'Model' },
        { header: 'Durum', key: 'Durum' },
        { header: 'Toplam Maliyet (EUR)', key: 'Toplam Maliyet (EUR)' },
        { header: 'Oluşturulma Tarihi', key: 'Oluşturulma Tarihi' },
      ],
      selectedIds ? 'secili_makinalar' : 'makinalar_listesi'
    )
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      <Download size={20} />
      {selectedIds && selectedIds.length > 0
        ? `Seçili Makinaları Aktar (${selectedIds.length})`
        : 'Tümünü Excel\'e Aktar'}
    </button>
  )
}

