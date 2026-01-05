'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Wrench, History } from 'lucide-react'
import MakinaExcelExport from './MakinaExcelExport'
import MakinaTable from './MakinaTable'

interface Makina {
  id: string
  ad: string
  model: string | null
  durum: string
  aciklama: string | null
  fotograf: string | null
  toplamMaliyet: number
  createdAt: Date | string
  makinaBilesenleri: Array<{
    ad: string
    miktar: number
    birimMaliyet: number
    paraBirimi: string
    toplamMaliyet: number
  }>
}

export default function MakinaListeWrapper({ makinalar }: { makinalar: Makina[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Makinalar</h1>
        <div className="flex items-center gap-3">
          <MakinaExcelExport makinalar={makinalar} selectedIds={selectedIds} />
          <Link
            href="/duzenleme-gecmisi?tablo=Makina"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <History size={20} />
            Düzenleme Geçmişi
          </Link>
          <Link
            href="/makina/olustur"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Yeni Makina
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {makinalar.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Henüz makina eklenmemiş</p>
            <Link
              href="/makina/olustur"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700"
            >
              İlk makineyi ekle
            </Link>
          </div>
        ) : (
          <MakinaTable makinalar={makinalar} onSelectionChange={setSelectedIds} />
        )}
      </div>
    </div>
  )
}








