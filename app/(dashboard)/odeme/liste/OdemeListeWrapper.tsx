'use client'

import { useState } from 'react'
import OdemeTable from './OdemeTable'
import OdemeExcelExport from './OdemeExcelExport'

interface Odeme {
  id: string
  tur: string
  tutar: number
  paraBirimi: string
  odemeTarihi: Date | string
  odemeYontemi: string
  aciklama: string | null
  createdAt: Date | string
  teklif: {
    id: string
    ad: string | null
    firma: {
      ad: string
    } | null
  } | null
  user: {
    id: string
    username: string
    adSoyad: string | null
  }
}

interface OdemeListeWrapperProps {
  odemeler: Odeme[]
}

export default function OdemeListeWrapper({ odemeler }: OdemeListeWrapperProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids)
  }

  // Date objelerini string'e çevir
  const formattedOdemeler = odemeler.map((odeme) => ({
    ...odeme,
    odemeTarihi: odeme.odemeTarihi instanceof Date ? odeme.odemeTarihi.toISOString() : odeme.odemeTarihi,
    createdAt: odeme.createdAt instanceof Date ? odeme.createdAt.toISOString() : odeme.createdAt,
  }))

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Toplam {odemeler.length} ödeme kaydı
        </div>
        {selectedIds.length > 0 && (
          <OdemeExcelExport odemeler={formattedOdemeler} selectedIds={selectedIds} />
        )}
      </div>
      <OdemeTable odemeler={formattedOdemeler} onSelectionChange={handleSelectionChange} />
    </div>
  )
}
