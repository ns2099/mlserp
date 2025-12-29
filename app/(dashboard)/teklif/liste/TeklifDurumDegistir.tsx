'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TeklifDurumDegistirProps {
  teklifId: string
  mevcutDurum: number
}

const durumLabels: Record<number, string> = {
  1: 'Bekleyen',
  2: 'Onaylanan',
  3: 'Reddedilen',
  4: 'Tamamlanan',
}

export default function TeklifDurumDegistir({
  teklifId,
  mevcutDurum,
}: TeklifDurumDegistirProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDurumChange = async (yeniDurum: number) => {
    if (yeniDurum === mevcutDurum) return

    setLoading(true)

    try {
      const response = await fetch(`/api/teklif/${teklifId}/durum`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durum: yeniDurum }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Durum değiştirilirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <select
      value={mevcutDurum}
      onChange={(e) => handleDurumChange(parseInt(e.target.value))}
      disabled={loading}
      className="text-xs px-2 py-1 border border-gray-300 rounded bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
    >
      <option value={1}>Bekleyen</option>
      <option value={2}>Onaylanan</option>
      <option value={3}>Reddedilen</option>
      <option value={4}>Tamamlanan</option>
    </select>
  )
}









