'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, ChevronUp, Edit } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import MakinaSilButton from './MakinaSilButton'

interface MakinaTableProps {
  makinalar: Makina[]
  onSelectionChange?: (selectedIds: string[]) => void
}

const durumColors: Record<string, string> = {
  Aktif: 'bg-green-100 text-green-800',
  Bakımda: 'bg-yellow-100 text-yellow-800',
  Pasif: 'bg-gray-100 text-gray-800',
}

interface MakinaBilesen {
  ad: string
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
  fotograf: string | null
  toplamMaliyet: number
  createdAt: string
  makinaBilesenleri: MakinaBilesen[]
}

export default function MakinaTable({ makinalar, onSelectionChange }: MakinaTableProps) {
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
    if (selectedIds.size === makinalar.length) {
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } else {
      const allIds = new Set(makinalar.map((m) => m.id))
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
                checked={selectedIds.size === makinalar.length && makinalar.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12"></th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Makina Adı
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Model
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Durum
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Oluşturulma Tarihi
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {makinalar.map((makina) => {
            const isExpanded = expandedRows.has(makina.id)
            return (
              <React.Fragment key={makina.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(makina.id)}
                      onChange={() => toggleSelection(makina.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleRow(makina.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {makina.fotograf && (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                          <Image
                            src={makina.fotograf}
                            alt={makina.ad}
                            fill
                            className="object-cover"
                            style={{ width: 'auto', height: 'auto' }}
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{makina.ad}</div>
                        {makina.model && (
                          <div className="text-xs text-gray-500">{makina.model}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{makina.model || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        durumColors[makina.durum] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {makina.durum}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(makina.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/makina/${makina.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                        Düzenle
                      </Link>
                      <MakinaSilButton makinaId={makina.id} makinaAdi={makina.ad} />
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Makina ID:</span>{' '}
                            <span className="text-gray-900">{makina.id}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Toplam Maliyet:</span>{' '}
                            <span className="text-gray-900">
                              {makina.toplamMaliyet.toFixed(2)} EUR
                            </span>
                          </div>
                          {makina.aciklama && (
                            <div className="col-span-2">
                              <span className="font-medium text-gray-700">Açıklama:</span>{' '}
                              <span className="text-gray-900">{makina.aciklama}</span>
                            </div>
                          )}
                        </div>
                        {makina.makinaBilesenleri && makina.makinaBilesenleri.length > 0 && (
                          <div>
                            <span className="font-medium text-gray-700 mb-2 block">Bileşenler:</span>
                            <div className="space-y-1">
                              {makina.makinaBilesenleri.map((bilesen, idx) => (
                                <div key={idx} className="text-sm text-gray-600">
                                  • {bilesen.ad} - {bilesen.miktar} adet -{' '}
                                  {bilesen.birimMaliyet.toFixed(2)} {bilesen.paraBirimi} -{' '}
                                  {bilesen.toplamMaliyet.toFixed(2)} EUR
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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

