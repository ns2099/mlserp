'use client'

import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatDate } from '@/lib/utils'

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
    } | null
    toplamFiyat: number
  }
  user: {
    adSoyad: string | null
  }
}

interface UretimTableProps {
  uretimler: Uretim[]
  selectedIds?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  onDelete?: (id: string) => void
  onStatusChange?: (id: string, newStatus: string) => void
  showBitisTarihi?: boolean // Bitiş tarihi kolonunu göster
}

export default function UretimTable({
  uretimler,
  selectedIds: selectedIdsProp,
  onSelectionChange,
  onDelete,
  onStatusChange,
  showBitisTarihi = false,
}: UretimTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(selectedIdsProp ?? [])
  )

  useEffect(() => {
    if (selectedIdsProp) {
      setSelectedIds(new Set(selectedIdsProp))
    }
  }, [selectedIdsProp?.join(',')])

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
    onSelectionChange?.(Array.from(newSelected))
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === uretimler.length) {
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } else {
      const allIds = new Set(uretimler.map((u) => u.id))
      setSelectedIds(allIds)
      onSelectionChange?.(Array.from(allIds))
    }
  }

  useEffect(() => {
    onSelectionChange?.(Array.from(selectedIds))
  }, [selectedIds, onSelectionChange])

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
              <input
                type="checkbox"
                checked={selectedIds.size === uretimler.length && uretimler.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12"></th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Teklif Adı
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Firma
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Başlangıç Tarihi
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Sorumlu
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Durum
            </th>
            {showBitisTarihi && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Bitiş Tarihi
              </th>
            )}
            {onDelete && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                İşlem
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {uretimler.map((uretim) => {
            const isExpanded = expandedRows.has(uretim.id)
            return (
              <Fragment key={uretim.id}>
                <tr key={uretim.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(uretim.id)}
                      onChange={() => toggleSelection(uretim.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleRow(uretim.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {uretim.teklif.ad || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {uretim.teklif.firma?.ad || 'Firma Yok'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(uretim.baslangicTarihi)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{uretim.user.adSoyad || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {onStatusChange ? (
                      <select
                        value={uretim.durum}
                        onChange={(e) => onStatusChange(uretim.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                          uretim.durum === 'Üretimde'
                            ? 'bg-yellow-100 text-yellow-800'
                            : uretim.durum === 'Son Kontrol'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        <option value="Üretimde">Üretimde</option>
                        <option value="Son Kontrol">Son Kontrol</option>
                        <option value="Onaylandı">Teslim Edildi</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        uretim.durum === 'Üretimde'
                          ? 'bg-yellow-100 text-yellow-800'
                          : uretim.durum === 'Son Kontrol'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {uretim.durum === 'Onaylandı' ? 'Teslim Edildi' : uretim.durum}
                      </span>
                    )}
                  </td>
                  {showBitisTarihi && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {uretim.bitisTarihi ? formatDate(uretim.bitisTarihi) : '-'}
                      </div>
                    </td>
                  )}
                {onDelete && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onDelete(uretim.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Sil
                    </button>
                  </td>
                )}
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={onDelete ? (showBitisTarihi ? 9 : 8) : (showBitisTarihi ? 8 : 7)} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Teklif ID:</span>{' '}
                            <span className="text-gray-900">{uretim.teklif.id}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Toplam Fiyat:</span>{' '}
                            <span className="text-gray-900">
                              {uretim.teklif.toplamFiyat.toFixed(2)} €
                            </span>
                          </div>
                          {uretim.bitisTarihi && (
                            <div>
                              <span className="font-medium text-gray-700">Bitiş Tarihi:</span>{' '}
                              <span className="text-gray-900">
                                {formatDate(uretim.bitisTarihi)}
                              </span>
                            </div>
                          )}
                        </div>
                        {uretim.aciklama && (
                          <div>
                            <span className="font-medium text-gray-700">Açıklama:</span>{' '}
                            <span className="text-gray-900">{uretim.aciklama}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t">
                          <Link
                            href={`/uretim/${uretim.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Detaylı Görüntüle →
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

