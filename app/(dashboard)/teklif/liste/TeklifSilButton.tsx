'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface TeklifSilButtonProps {
  teklifId: string
}

export default function TeklifSilButton({ teklifId }: TeklifSilButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Bu teklifi silmek istediğinize emin misiniz?')) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/teklif/${teklifId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Teklif silinirken bir hata oluştu')
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
      className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
    >
      <Trash2 size={14} />
      Sil
    </button>
  )
}


