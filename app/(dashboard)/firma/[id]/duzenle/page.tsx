'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface FirmaData {
  id: string
  ad: string
  telefon: string | null
  email: string | null
  adres: string | null
  yetkiliKisiler?: Array<{
    id: string
    adSoyad: string
    telefon: string | null
    email: string | null
    pozisyon: string | null
  }>
}

export default function FirmaDuzenlePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    ad: '',
    telefon: '',
    email: '',
    adres: '',
  })
  const [yetkiliKisi, setYetkiliKisi] = useState({
    adSoyad: '',
    telefon: '',
    email: '',
    pozisyon: '',
  })

  useEffect(() => {
    // Firma bilgilerini yükle
    fetch(`/api/firma/${id}`)
      .then((res) => res.json())
      .then((data: FirmaData) => {
        setFormData({
          ad: data.ad || '',
          telefon: data.telefon || '',
          email: data.email || '',
          adres: data.adres || '',
        })
        
        // İlk yetkili kişiyi yükle
        if (data.yetkiliKisiler && data.yetkiliKisiler.length > 0) {
          const ilkYetkili = data.yetkiliKisiler[0]
          setYetkiliKisi({
            adSoyad: ilkYetkili.adSoyad || '',
            telefon: ilkYetkili.telefon || '',
            email: ilkYetkili.email || '',
            pozisyon: ilkYetkili.pozisyon || '',
          })
        }
        
        setLoadingData(false)
      })
      .catch(() => {
        setLoadingData(false)
      })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/firma/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          yetkiliKisi: yetkiliKisi.adSoyad ? yetkiliKisi : null,
        }),
      })

      if (response.ok) {
        router.push('/firma/liste')
        router.refresh()
      } else {
        alert('Firma güncellenirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Firma Düzenle</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Firma Adı *
          </label>
          <input
            type="text"
            required
            value={formData.ad}
            onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefon
          </label>
          <input
            type="tel"
            value={formData.telefon}
            onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-posta
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adres
          </label>
          <textarea
            value={formData.adres}
            onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Yetkili Kişi</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                value={yetkiliKisi.adSoyad}
                onChange={(e) => setYetkiliKisi({ ...yetkiliKisi, adSoyad: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                value={yetkiliKisi.telefon}
                onChange={(e) => setYetkiliKisi({ ...yetkiliKisi, telefon: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={yetkiliKisi.email}
                onChange={(e) => setYetkiliKisi({ ...yetkiliKisi, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pozisyon
              </label>
              <input
                type="text"
                value={yetkiliKisi.pozisyon}
                onChange={(e) => setYetkiliKisi({ ...yetkiliKisi, pozisyon: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: Genel Müdür, Satış Müdürü"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Güncelleniyor...' : 'Güncelle'}
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

