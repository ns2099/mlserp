'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CheckCircle, Circle } from 'lucide-react'

interface GelistirmeNotu {
  id: string
  baslik: string
  icerik: string
  cozum: string | null
  durum: string
  userId: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    username: string
    adSoyad: string
  }
}

export default function GelistirmeNotuDuzenlePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    baslik: '',
    icerik: '',
    cozum: '',
    durum: 'Açık',
  })

  useEffect(() => {
    fetch(`/api/gelistirme-notlari/${id}`)
      .then((res) => res.json())
      .then((data: GelistirmeNotu) => {
        setFormData({
          baslik: data.baslik || '',
          icerik: data.icerik || '',
          cozum: data.cozum || '',
          durum: data.durum || 'Açık',
        })
        setLoadingData(false)
      })
      .catch(() => {
        setLoadingData(false)
      })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.baslik || !formData.icerik) {
      alert('Lütfen başlık ve içerik girin')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/gelistirme-notlari/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/gelistirme-notlari')
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Not güncellenirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const markAsSolved = () => {
    setFormData({ ...formData, durum: 'Çözüldü' })
  }

  const markAsOpen = () => {
    setFormData({ ...formData, durum: 'Açık' })
  }

  if (loadingData) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Geliştirme Notu Düzenle</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Durum:</span>
            {formData.durum === 'Çözüldü' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <CheckCircle size={16} />
                Çözüldü
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                <Circle size={16} />
                Açık
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {formData.durum === 'Açık' ? (
              <button
                type="button"
                onClick={markAsSolved}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Çözüldü Olarak İşaretle
              </button>
            ) : (
              <button
                type="button"
                onClick={markAsOpen}
                className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
              >
                Açık Olarak İşaretle
              </button>
            )}
          </div>
        </div>

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
            Sorun / İçerik *
          </label>
          <textarea
            required
            value={formData.icerik}
            onChange={(e) => setFormData({ ...formData, icerik: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Sorun veya not içeriği..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Çözüm
            <span className="text-gray-500 font-normal ml-2">(Sorun nasıl çözüldü?)</span>
          </label>
          <textarea
            value={formData.cozum}
            onChange={(e) => setFormData({ ...formData, cozum: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Çözüm açıklaması... (Sorun çözüldüğünde doldurun)"
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
