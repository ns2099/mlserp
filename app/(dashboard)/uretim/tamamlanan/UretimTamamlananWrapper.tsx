'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Plus } from 'lucide-react'
import UretimTable from '../devam-eden/UretimTable'
import UretimExcelExport from '../devam-eden/UretimExcelExport'
import UretimPdfExport from '../devam-eden/UretimPdfExport'

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

export default function UretimTamamlananWrapper({ uretimler }: { uretimler: Uretim[] }) {
  const [items, setItems] = useState<Uretim[]>(uretimler)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const hasSelection = selectedIds.length > 0

  const handleDelete = async (ids: string[]) => {
    if (ids.length === 0) {
      alert('Silinecek üretim seçilmedi')
      return
    }

    const confirmText =
      ids.length === 1
        ? 'Seçili üretimi silmek istediğinize emin misiniz?'
        : `${ids.length} üretimi silmek istediğinize emin misiniz?`

    if (!window.confirm(confirmText)) return

    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/uretim/${id}`, {
            method: 'DELETE',
          })
        )
      )
      setItems((prev) => prev.filter((item) => !ids.includes(item.id)))
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)))
    } catch (error) {
      console.error('Üretim silme hatası', error)
      alert('Silme işleminde bir sorun oluştu')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Üretimi Tamamlananlar</h1>
        <div className="flex items-center gap-3">
          <UretimPdfExport uretimler={items} selectedIds={selectedIds} />
          <UretimExcelExport uretimler={items} selectedIds={selectedIds} />
          {hasSelection && (
            <button
              onClick={() => handleDelete(selectedIds)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Seçili Üretimleri Sil ({selectedIds.length})
            </button>
          )}
          <Link
            href="/uretim/olustur"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Yeni Üretim Ekle
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Tamamlanan üretim bulunmuyor</p>
          </div>
        ) : (
          <UretimTable
            uretimler={items}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onDelete={(id) => handleDelete([id])}
            showBitisTarihi={true}
          />
        )}
      </div>
    </div>
  )
}

