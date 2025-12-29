'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface FirmaSilButtonProps {
  firmaId: string
  firmaAdi: string
}

export default function FirmaSilButton({ firmaId, firmaAdi }: FirmaSilButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`"${firmaAdi}" firmasını silmek istediğinize emin misiniz?`)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/firma/${firmaId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Firma silinirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
    >
      <Trash2 size={16} />
      Sil
    </button>
  )
}


