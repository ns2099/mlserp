'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GelistirmeNotuSilButtonProps {
  notId: string
}

export default function GelistirmeNotuSilButton({ notId }: GelistirmeNotuSilButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/gelistirme-notlari/${notId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Not silinirken bir hata oluştu')
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
      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Notu Sil"
    >
      <Trash2 size={16} />
    </button>
  )
}
