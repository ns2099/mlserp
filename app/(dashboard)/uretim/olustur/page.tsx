'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

interface Teklif {
  id: string
  firma: {
    ad: string
  }
  toplamFiyat: number
}

export default function UretimOlusturPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [onaylananTeklifler, setOnaylananTeklifler] = useState<Teklif[]>([])
  const [selectedTeklifId, setSelectedTeklifId] = useState('')
  const [aciklama, setAciklama] = useState('')

  useEffect(() => {
    // URL'den teklifId al
    const params = new URLSearchParams(window.location.search)
    const teklifId = params.get('teklifId')
    if (teklifId) {
      setSelectedTeklifId(teklifId)
    }

    // Onaylanan teklifleri yükle
    fetch('/api/teklif?durum=2')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOnaylananTeklifler(data)
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeklifId) {
      alert('Lütfen bir teklif seçin')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/uretim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teklifId: selectedTeklifId,
          aciklama: aciklama || null,
        }),
      })

      if (response.ok) {
        router.push('/uretim/devam-eden')
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Üretim oluşturulurken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni Üretim Ekle</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Onaylanan Teklif *
            </label>
            <select
              required
              value={selectedTeklifId}
              onChange={(e) => setSelectedTeklifId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Teklif seçin</option>
              {onaylananTeklifler.map((teklif) => (
                <option key={teklif.id} value={teklif.id}>
                  {teklif.firma?.ad || 'Firma Yok'} - {teklif.toplamFiyat.toFixed(2)} €
                </option>
              ))}
            </select>
            {onaylananTeklifler.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Onaylanan teklif bulunmuyor. Önce bir teklifi onaylayın.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Üretim hakkında notlar..."
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || onaylananTeklifler.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Oluşturuluyor...' : 'Üretim Oluştur'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  )
}

