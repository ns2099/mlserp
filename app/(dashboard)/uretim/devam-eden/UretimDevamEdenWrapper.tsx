'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Factory, Plus } from 'lucide-react'
import UretimTable from './UretimTable'
import UretimExcelExport from './UretimExcelExport'
import UretimPdfExport from './UretimPdfExport'

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

export default function UretimDevamEdenWrapper({ uretimler }: { uretimler: Uretim[] }) {
  const [items, setItems] = useState<Uretim[]>(uretimler)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const hasSelection = selectedIds.length > 0

  // Sayfa yüklendiğinde verileri yeniden çek
  const refreshData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/uretim')
      if (response.ok) {
        const data = await response.json()
        // "Üretimde" ve "Son Kontrol" durumundaki kayıtları filtrele
        const devamEdenler = data.filter((u: Uretim) => u.durum === 'Üretimde' || u.durum === 'Son Kontrol')
        setItems(devamEdenler)
      }
    } catch (error) {
      console.error('Veri yenileme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  // Component mount olduğunda verileri yenile
  useEffect(() => {
    refreshData()
  }, [])

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
      // Verileri yeniden çek
      await refreshData()
    } catch (error) {
      console.error('Üretim silme hatası', error)
      alert('Silme işleminde bir sorun oluştu')
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/uretim/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ durum: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Durum güncelleme başarısız')
      }

      const updatedUretim = await response.json()
      
      // Liste güncelle - eğer durum "Onaylandı" ise listeden kaldır (çünkü bu sayfa sadece "Üretimde" ve "Son Kontrol" olanları gösteriyor)
      if (newStatus === 'Onaylandı') {
        setItems((prev) => prev.filter((item) => item.id !== id))
        // Verileri yeniden çek
        await refreshData()
      } else {
        // "Üretimde" veya "Son Kontrol" durumunda listede kal
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, durum: newStatus } : item
          )
        )
      }
    } catch (error) {
      console.error('Durum güncelleme hatası', error)
      alert('Durum güncellenirken bir sorun oluştu')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Üretimi Devam Edenler</h1>
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
        {loading ? (
          <div className="p-12 text-center">
            <Factory className="mx-auto text-gray-400 mb-4 animate-pulse" size={48} />
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Factory className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Şu anda üretimde olan ürün bulunmuyor</p>
          </div>
        ) : (
          <UretimTable
            uretimler={items}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onDelete={(id) => handleDelete([id])}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </div>
  )
}


