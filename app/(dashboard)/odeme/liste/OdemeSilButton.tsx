'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function OdemeSilButton({ odemeId }: { odemeId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Bu ödemeyi silmek istediğinizden emin misiniz?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/odeme/${odemeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Ödeme silinemedi')
      }
    } catch (error) {
      console.error('Ödeme silme hatası:', error)
      alert('Ödeme silinirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      <Trash2 size={18} />
    </button>
  )
}




















