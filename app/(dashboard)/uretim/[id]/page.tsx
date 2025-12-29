'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface UretimGelisme {
  id: string
  aciklama: string
  tahminiIlerleme: number
  createdAt: string
}

interface Uretim {
  id: string
  durum: string
  baslangicTarihi: string
  bitisTarihi: string | null
  aciklama: string | null
  teklif: {
    firma: {
      ad: string
    }
    toplamFiyat: number
  }
  user: {
    adSoyad: string
  }
  gelismeler: UretimGelisme[]
}

export default function UretimDetayPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uretim, setUretim] = useState<Uretim | null>(null)
  const [yeniGelisme, setYeniGelisme] = useState({
    aciklama: '',
    tahminiIlerleme: 0,
  })

  useEffect(() => {
    fetchUretim()
  }, [id])

  const fetchUretim = async () => {
    try {
      const response = await fetch(`/api/uretim/${id}`)
      if (response.ok) {
        const data = await response.json()
        setUretim(data)
      }
    } catch (error) {
      console.error('Üretim yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGelismeEkle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!yeniGelisme.aciklama.trim() || yeniGelisme.tahminiIlerleme < 0 || yeniGelisme.tahminiIlerleme > 100) {
      alert('Lütfen geçerli bir açıklama ve 0-100 arası ilerleme girin')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/uretim/${id}/gelisme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(yeniGelisme),
      })

      if (response.ok) {
        setYeniGelisme({ aciklama: '', tahminiIlerleme: 0 })
        fetchUretim()
      } else {
        alert('Gelişme eklenirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!uretim) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <p>Üretim bulunamadı</p>
        </div>
      </div>
    )
  }

  // En son gelişmeden ilerleme yüzdesini al
  const sonIlerleme = uretim.gelismeler.length > 0
    ? Math.max(...uretim.gelismeler.map((g) => g.tahminiIlerleme))
    : 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Geri Dön
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Üretim Detayı</h1>
      </div>

      {/* Üretim Bilgileri */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Firma</h3>
            <p className="text-lg font-semibold text-gray-900">{uretim.teklif.firma.ad}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Durum</h3>
            <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
              {uretim.durum}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Sorumlu</h3>
            <p className="text-lg text-gray-900">{uretim.user.adSoyad}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Toplam Fiyat</h3>
            <p className="text-lg font-semibold text-gray-900">{uretim.teklif.toplamFiyat.toFixed(2)} €</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Başlangıç Tarihi</h3>
            <p className="text-lg text-gray-900">{formatDate(uretim.baslangicTarihi)}</p>
          </div>
          {uretim.bitisTarihi && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Bitiş Tarihi</h3>
              <p className="text-lg text-gray-900">{formatDate(uretim.bitisTarihi)}</p>
            </div>
          )}
        </div>
        {uretim.aciklama && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Açıklama</h3>
            <p className="text-gray-900">{uretim.aciklama}</p>
          </div>
        )}
      </div>

      {/* İlerleme Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Genel İlerleme</h2>
          <span className="text-2xl font-bold text-blue-600">{sonIlerleme}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${sonIlerleme}%` }}
          ></div>
        </div>
      </div>

      {/* Yeni Gelişme Ekleme Formu */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Yeni Gelişme Ekle</h2>
        <form onSubmit={handleGelismeEkle} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama *
            </label>
            <textarea
              required
              value={yeniGelisme.aciklama}
              onChange={(e) => setYeniGelisme({ ...yeniGelisme, aciklama: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Üretim hakkında gelişme notları..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahmini İlerleme (%) *
            </label>
            <input
              type="number"
              required
              min="0"
              max="100"
              value={yeniGelisme.tahminiIlerleme}
              onChange={(e) =>
                setYeniGelisme({ ...yeniGelisme, tahminiIlerleme: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">0-100 arası bir değer girin</p>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            {submitting ? 'Ekleniyor...' : 'Gelişme Ekle'}
          </button>
        </form>
      </div>

      {/* Gelişmeler Listesi */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Gelişmeler</h2>
        {uretim.gelismeler.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Henüz gelişme eklenmemiş</p>
        ) : (
          <div className="space-y-4">
            {uretim.gelismeler
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((gelisme) => (
                <div key={gelisme.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-gray-900">{gelisme.aciklama}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(gelisme.createdAt)}
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-blue-600">
                          {gelisme.tahminiIlerleme}%
                        </span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${gelisme.tahminiIlerleme}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}








