'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Edit } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import TeklifSilButton from './TeklifSilButton'
import TeklifDurumDegistir from './TeklifDurumDegistir'

const durumLabels: Record<number, string> = {
  1: 'Bekleyen',
  2: 'Onaylanan',
  3: 'Reddedilen',
  4: 'Tamamlanan',
}

const durumColors: Record<number, string> = {
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-green-100 text-green-800',
  3: 'bg-red-100 text-red-800',
  4: 'bg-blue-100 text-blue-800',
}

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

interface TeklifTableProps {
  teklifler: Teklif[]
  onSelectionChange?: (selectedIds: string[]) => void
}

export default function TeklifTable({ teklifler, onSelectionChange }: TeklifTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

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
    if (selectedIds.size === teklifler.length) {
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } else {
      const allIds = new Set(teklifler.map((t) => t.id))
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
                checked={selectedIds.size === teklifler.length && teklifler.length > 0}
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
              Toplam Fiyat
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Durum
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Oluşturan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tarih
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {teklifler.map((teklif) => {
            const isExpanded = expandedRows.has(teklif.id)
            return (
              <React.Fragment key={teklif.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(teklif.id)}
                      onChange={() => toggleSelection(teklif.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleRow(teklif.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {teklif.ad || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {teklif.firma?.ad || 'Firma Yok'}
                    </div>
                    {teklif.makina && (
                      <div className="text-xs text-gray-500">
                        Makina: {teklif.makina.ad}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(teklif.toplamFiyat)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          durumColors[teklif.durum]
                        }`}
                      >
                        {durumLabels[teklif.durum]}
                      </span>
                      <TeklifDurumDegistir teklifId={teklif.id} mevcutDurum={teklif.durum} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{teklif.user.adSoyad}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(teklif.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/teklif/${teklif.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Detay
                      </Link>
                      <Link
                        href={`/teklif/${teklif.id}/duzenle`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                      >
                        <Edit size={14} />
                        Düzenle
                      </Link>
                      {teklif.durum === 2 && (
                        <Link
                          href={`/uretim/olustur?teklifId=${teklif.id}`}
                          className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                        >
                          Üretime Ekle
                        </Link>
                      )}
                      <TeklifSilButton teklifId={teklif.id} />
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Teklif ID:</span>{' '}
                            <span className="text-gray-900">{teklif.id}</span>
                          </div>
                          {teklif.makina && (
                            <div>
                              <span className="font-medium text-gray-700">Makina:</span>{' '}
                              <span className="text-gray-900">{teklif.makina.ad}</span>
                            </div>
                          )}
                        </div>
                        {teklif.teklifUrunler && teklif.teklifUrunler.length > 0 && (
                          <div>
                            <span className="font-medium text-gray-700 mb-2 block">Ürünler:</span>
                            <div className="space-y-1">
                              {teklif.teklifUrunler.map((urun, idx) => (
                                <div key={idx} className="text-sm text-gray-600">
                                  • {urun.urunAdi} - {urun.miktar} adet -{' '}
                                  {formatCurrency(urun.toplamFiyat)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="pt-2 border-t">
                          <Link
                            href={`/teklif/${teklif.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Detaylı Görüntüle →
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

