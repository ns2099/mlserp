'use client'

import { Download } from 'lucide-react'
import { exportToExcel } from '@/lib/excel-export'

interface Firma {
  id: string
  ad: string
  telefon: string | null
  email: string | null
  adres: string | null
  createdAt: Date
  updatedAt: Date
}

export default function FirmaExcelExport({ firmalar }: { firmalar: Firma[] }) {
  const handleExport = () => {
    const data = firmalar.map((firma) => ({
      'Firma Adı': firma.ad,
      'Telefon': firma.telefon || '',
      'E-posta': firma.email || '',
      'Adres': firma.adres || '',
      'Oluşturulma Tarihi': firma.createdAt instanceof Date 
        ? firma.createdAt.toLocaleDateString('tr-TR')
        : new Date(firma.createdAt).toLocaleDateString('tr-TR'),
    }))

    exportToExcel(
      data,
      [
        { header: 'Firma Adı', key: 'Firma Adı' },
        { header: 'Telefon', key: 'Telefon' },
        { header: 'E-posta', key: 'E-posta' },
        { header: 'Adres', key: 'Adres' },
        { header: 'Oluşturulma Tarihi', key: 'Oluşturulma Tarihi' },
      ],
      'firmalar_listesi'
    )
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      <Download size={20} />
      Excel'e Aktar
    </button>
  )
}








