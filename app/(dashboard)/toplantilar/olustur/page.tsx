'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Building2, User, ArrowLeft } from 'lucide-react'

interface Firma {
  id: string
  ad: string
  yetkiliKisiler: Array<{
    id: string
    adSoyad: string
    telefon?: string
    email?: string
    pozisyon?: string
  }>
}

export default function ToplantiOlusturPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [firmalar, setFirmalar] = useState<Firma[]>([])
  const [selectedFirmaId, setSelectedFirmaId] = useState('')
  const [selectedYetkiliId, setSelectedYetkiliId] = useState('')
  const [formData, setFormData] = useState({
    toplantiTarihi: '',
    konu: '',
    notlar: '',
  })

  useEffect(() => {
    const loadFirmalar = async () => {
      try {
        const response = await fetch('/api/firma')
        if (response.ok) {
          const data = await response.json()
          setFirmalar(data)
        }
      } catch (error) {
        console.error('Firmalar yüklenirken hata:', error)
      }
    }
    loadFirmalar()
  }, [])

  const selectedFirma = firmalar.find((f) => f.id === selectedFirmaId)
  const yetkiliKisiler = selectedFirma?.yetkiliKisiler || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/toplanti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firmaId: selectedFirmaId,
          yetkiliKisiId: selectedYetkiliId || null,
          toplantiTarihi: formData.toplantiTarihi,
          konu: formData.konu || null,
          notlar: formData.notlar || null,
        }),
      })

      if (response.ok) {
        router.push('/toplantilar')
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Toplantı oluşturulurken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Toplantı</h1>
          <p className="text-gray-600 mt-1">Toplantı bilgilerini girin</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 size={16} className="inline mr-2" />
            Firma *
          </label>
          <select
            required
            value={selectedFirmaId}
            onChange={(e) => {
              setSelectedFirmaId(e.target.value)
              setSelectedYetkiliId('') // Firma değiştiğinde yetkili kişiyi sıfırla
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Firma Seçin</option>
            {firmalar.map((firma) => (
              <option key={firma.id} value={firma.id}>
                {firma.ad}
              </option>
            ))}
          </select>
        </div>

        {selectedFirma && yetkiliKisiler.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              Görüşülen Firma Yetkilisi
            </label>
            <select
              value={selectedYetkiliId}
              onChange={(e) => setSelectedYetkiliId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Yetkili Kişi Seçin (Opsiyonel)</option>
              {yetkiliKisiler.map((yetkili) => (
                <option key={yetkili.id} value={yetkili.id}>
                  {yetkili.adSoyad} {yetkili.pozisyon ? `- ${yetkili.pozisyon}` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar size={16} className="inline mr-2" />
            Toplantı Tarihi *
          </label>
          <input
            type="datetime-local"
            required
            value={formData.toplantiTarihi}
            onChange={(e) => setFormData({ ...formData, toplantiTarihi: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Konu
          </label>
          <input
            type="text"
            value={formData.konu}
            onChange={(e) => setFormData({ ...formData, konu: e.target.value })}
            placeholder="Toplantı konusu"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Toplantı Notları
          </label>
          <textarea
            value={formData.notlar}
            onChange={(e) => setFormData({ ...formData, notlar: e.target.value })}
            rows={8}
            placeholder="Toplantı notlarınızı buraya yazın..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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


