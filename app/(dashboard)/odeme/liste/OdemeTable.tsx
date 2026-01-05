'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Edit, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import OdemeSilButton from './OdemeSilButton'

interface Odeme {
  id: string
  tur: string
  tutar: number
  paraBirimi: string
  odemeTarihi: string
  odemeYontemi: string
  aciklama: string | null
  createdAt: string
  teklif: {
    id: string
    ad: string | null
    firma: {
      ad: string
    } | null | null
  } | null
  user: {
    id: string
    username: string
    adSoyad: string | null
  }
}

interface OdemeTableProps {
  odemeler: Odeme[]
  onSelectionChange?: (selectedIds: string[]) => void
}

const turColors: Record<string, string> = {
  Gelen: 'bg-green-100 text-green-800',
  Giden: 'bg-red-100 text-red-800',
}

export default function OdemeTable({ odemeler, onSelectionChange }: OdemeTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

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
    if (selectedIds.size === odemeler.length) {
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } else {
      const allIds = new Set(odemeler.map((o) => o.id))
      setSelectedIds(allIds)
      onSelectionChange?.(Array.from(allIds))
    }
  }

  useEffect(() => {
    onSelectionChange?.(Array.from(selectedIds))
  }, [selectedIds, onSelectionChange])

  const formatParaBirimi = (paraBirimi: string) => {
    if (paraBirimi === 'EUR') return '€'
    if (paraBirimi === 'USD') return '$'
    return '₺'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
              <input
                type="checkbox"
                checked={selectedIds.size === odemeler.length && odemeler.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tür
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tutar
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Ödeme Tarihi
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Ödeme Yöntemi
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Teklif
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Oluşturan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {odemeler.map((odeme) => (
            <tr key={odeme.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedIds.has(odeme.id)}
                  onChange={() => toggleSelection(odeme.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    turColors[odeme.tur] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {odeme.tur}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`font-semibold ${
                    odeme.tur === 'Gelen' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {odeme.tur === 'Giden' ? '-' : '+'}
                  {formatCurrency(odeme.tutar)} {formatParaBirimi(odeme.paraBirimi)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(new Date(odeme.odemeTarihi))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {odeme.odemeYontemi}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {odeme.teklif ? (
                  <Link
                    href={`/teklif/${odeme.teklif.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {odeme.teklif.ad || odeme.teklif.firma?.ad || 'Firma Yok'}
                  </Link>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {odeme.user.adSoyad || odeme.user.username}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/odeme/${odeme.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={18} />
                  </Link>
                  <OdemeSilButton odemeId={odeme.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}



















