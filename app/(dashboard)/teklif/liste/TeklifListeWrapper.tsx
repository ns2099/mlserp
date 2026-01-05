'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, FileText, History } from 'lucide-react'
import TeklifTable from './TeklifTable'
import TeklifExcelExport from './TeklifExcelExport'

interface Teklif {
  id: string
  ad: string | null
  durum: number
  toplamFiyat: number
  createdAt: Date | string
  firma: {
    ad: string
  } | null
  makina: {
    ad: string
  } | null
  user: {
    adSoyad: string | null
  }
  teklifUrunler?: Array<{
    urunAdi: string
    miktar: number
    birimFiyat: number
    toplamFiyat: number
  }>
}

export default function TeklifListeWrapper({
  teklifler,
  durumText,
}: {
  teklifler: Teklif[]
  durumText: string
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{durumText}</h1>
        <div className="flex items-center gap-3">
          <TeklifExcelExport teklifler={teklifler} selectedIds={selectedIds} />
          <Link
            href="/duzenleme-gecmisi?tablo=Teklif"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <History size={20} />
            Düzenleme Geçmişi
          </Link>
          <Link
            href="/teklif/olustur"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Yeni Teklif
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {teklifler.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Henüz teklif bulunmuyor</p>
            <Link
              href="/teklif/olustur"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700"
            >
              İlk teklifi oluştur
            </Link>
          </div>
        ) : (
          <TeklifTable teklifler={teklifler} onSelectionChange={setSelectedIds} />
        )}
      </div>
    </div>
  )
}








