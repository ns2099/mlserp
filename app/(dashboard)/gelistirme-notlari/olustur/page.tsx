'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GelistirmeNotuOlusturPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    baslik: '',
    icerik: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.baslik || !formData.icerik) {
      alert('Lütfen başlık ve içerik girin')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/gelistirme-notlari', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/gelistirme-notlari')
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Not oluşturulurken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni Geliştirme Notu</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Başlık *
          </label>
          <input
            type="text"
            required
            value={formData.baslik}
            onChange={(e) => setFormData({ ...formData, baslik: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Not başlığı"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İçerik *
          </label>
          <textarea
            required
            value={formData.icerik}
            onChange={(e) => setFormData({ ...formData, icerik: e.target.value })}
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Not içeriği..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
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
