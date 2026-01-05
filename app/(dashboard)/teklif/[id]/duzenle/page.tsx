'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Plus, X } from 'lucide-react'

interface Firma {
  id: string
  ad: string
}

interface TeklifUrun {
  id?: string
  urunAdi: string
  miktar: number
  birimFiyat: number
  toplamFiyat: number
  aciklama: string
}

interface Teklif {
  id: string
  ad: string | null
  firmaId: string
  aciklama: string | null
  toplamFiyat: number
  durum: number
  teklifUrunler: TeklifUrun[]
}

export default function TeklifDuzenlePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [firmalar, setFirmalar] = useState<Firma[]>([])
  const [formData, setFormData] = useState({
    ad: '',
    firmaId: '',
    aciklama: '',
    durum: 1,
  })
  const [urunler, setUrunler] = useState<TeklifUrun[]>([])

  useEffect(() => {
    // Firmaları yükle
    fetch('/api/firma')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFirmalar(data)
        }
      })

    // Teklif bilgilerini yükle
    fetch(`/api/teklif/${id}`)
      .then((res) => res.json())
      .then((data: Teklif) => {
        setFormData({
          ad: data.ad || '',
          firmaId: data.firmaId,
          aciklama: data.aciklama || '',
          durum: data.durum,
        })
        setUrunler(
          data.teklifUrunler.map((u) => ({
            ...u,
            toplamFiyat: u.miktar * u.birimFiyat,
          }))
        )
        setLoadingData(false)
      })
      .catch(() => {
        setLoadingData(false)
      })
  }, [id])

  const addUrun = () => {
    setUrunler([
      ...urunler,
      { urunAdi: '', miktar: 1, birimFiyat: 0, toplamFiyat: 0, aciklama: '' },
    ])
  }

  const removeUrun = (index: number) => {
    setUrunler(urunler.filter((_, i) => i !== index))
  }

  const updateUrun = (index: number, field: keyof TeklifUrun, value: any) => {
    const updated = [...urunler]
    updated[index] = { ...updated[index], [field]: value }
    if (field === 'miktar' || field === 'birimFiyat') {
      updated[index].toplamFiyat = updated[index].miktar * updated[index].birimFiyat
    }
    setUrunler(updated)
  }

  const toplamFiyat = urunler.reduce((sum, u) => sum + u.toplamFiyat, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firmaId || urunler.length === 0) {
      alert('Lütfen firma seçin ve en az bir ürün ekleyin')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/teklif/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          toplamFiyat: toplamFiyat,
          urunler: urunler.filter((u) => u.urunAdi),
        }),
      })

      if (response.ok) {
        router.push(`/teklif/${id}`)
        router.refresh()
      } else {
        alert('Teklif güncellenirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Teklif Düzenle</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teklif Adı *
            </label>
            <input
              type="text"
              required
              value={formData.ad}
              onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Teklif için bir isim verin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Firma *
            </label>
            <select
              required
              value={formData.firmaId}
              onChange={(e) => setFormData({ ...formData, firmaId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Firma seçin</option>
              {firmalar.map((firma) => (
                <option key={firma.id} value={firma.id}>
                  {firma.ad}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durum *
            </label>
            <select
              value={formData.durum}
              onChange={(e) => setFormData({ ...formData, durum: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Bekleyen</option>
              <option value={2}>Onaylanan</option>
              <option value={3}>Reddedilen</option>
              <option value={4}>Tamamlanan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={formData.aciklama}
              onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Ürünler</h2>
            <button
              type="button"
              onClick={addUrun}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Ürün Ekle
            </button>
          </div>

          <div className="space-y-4">
            {urunler.map((urun, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Ürün {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeUrun(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Ürün Adı *</label>
                    <input
                      type="text"
                      required
                      value={urun.urunAdi}
                      onChange={(e) => updateUrun(index, 'urunAdi', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Miktar *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={urun.miktar}
                      onChange={(e) => updateUrun(index, 'miktar', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Birim Fiyat (€) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={urun.birimFiyat}
                      onChange={(e) =>
                        updateUrun(index, 'birimFiyat', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Toplam Fiyat (€)</label>
                    <input
                      type="text"
                      value={urun.toplamFiyat.toFixed(2)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Açıklama</label>
                  <input
                    type="text"
                    value={urun.aciklama}
                    onChange={(e) => updateUrun(index, 'aciklama', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-600">Toplam Fiyat</p>
                <p className="text-2xl font-bold text-gray-900">
                  {toplamFiyat.toFixed(2)} €
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
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

