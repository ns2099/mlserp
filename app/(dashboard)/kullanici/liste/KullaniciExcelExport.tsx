'use client'

import { Download } from 'lucide-react'
import { exportToExcel } from '@/lib/excel-export'

interface Kullanici {
  id: string
  username: string
  adSoyad: string | null
  yetki: string
  createdAt: Date | string
}

export default function KullaniciExcelExport({ kullanicilar }: { kullanicilar: Kullanici[] }) {
  const handleExport = () => {
    const data = kullanicilar.map((kullanici) => ({
      'Kullanıcı Adı': kullanici.username,
      'Ad Soyad': kullanici.adSoyad || '',
      'Yetki': kullanici.yetki,
      'Oluşturulma Tarihi': new Date(kullanici.createdAt).toLocaleDateString('tr-TR'),
    }))

    exportToExcel(
      data,
      [
        { header: 'Kullanıcı Adı', key: 'Kullanıcı Adı' },
        { header: 'Ad Soyad', key: 'Ad Soyad' },
        { header: 'Yetki', key: 'Yetki' },
        { header: 'Oluşturulma Tarihi', key: 'Oluşturulma Tarihi' },
      ],
      'kullanicilar_listesi'
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








