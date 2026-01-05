'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, DollarSign, Calendar } from 'lucide-react'
import Link from 'next/link'

interface Teklif {
  id: string
  ad: string | null
  firma: {
    ad: string
  }
}

export default function OdemeOlusturPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [teklifler, setTeklifler] = useState<Teklif[]>([])
  const [formData, setFormData] = useState({
    tur: 'Gelen',
    tutar: '',
    paraBirimi: 'TRY',
    odemeTarihi: new Date().toISOString().split('T')[0],
    odemeYontemi: 'Havale',
    aciklama: '',
    teklifId: '',
  })

  useEffect(() => {
    // Onaylanan teklifleri yükle
    fetch('/api/teklif?durum=2')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTeklifler(data)
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/odeme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tutar: parseFloat(formData.tutar) || 0,
          teklifId: formData.teklifId || null,
          odemeTarihi: new Date(formData.odemeTarihi).toISOString(),
        }),
      })

      if (response.ok) {
        router.push('/odeme/liste')
        router.refresh()
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(errorData.error || 'Ödeme oluşturulurken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/odeme/liste"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={18} />
          Ödeme Listesine Dön
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Yeni Ödeme Ekle</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tür <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.tur}
              onChange={(e) => setFormData({ ...formData, tur: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Gelen">Gelen</option>
              <option value="Giden">Giden</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign size={16} className="inline mr-1" />
              Tutar <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.tutar}
              onChange={(e) => setFormData({ ...formData, tutar: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Para Birimi</label>
            <select
              value={formData.paraBirimi}
              onChange={(e) => setFormData({ ...formData, paraBirimi: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="TRY">₺ TRY</option>
              <option value="EUR">€ EUR</option>
              <option value="USD">$ USD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Ödeme Tarihi <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.odemeTarihi}
              onChange={(e) => setFormData({ ...formData, odemeTarihi: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ödeme Yöntemi <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.odemeYontemi}
              onChange={(e) => setFormData({ ...formData, odemeYontemi: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Nakit">Nakit</option>
              <option value="Havale">Havale</option>
              <option value="EFT">EFT</option>
              <option value="Kredi Kartı">Kredi Kartı</option>
              <option value="Çek">Çek</option>
              <option value="Senet">Senet</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Teklif (Opsiyonel)</label>
            <select
              value={formData.teklifId}
              onChange={(e) => setFormData({ ...formData, teklifId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Teklif seçin (opsiyonel)</option>
              {teklifler.map((teklif) => (
                <option key={teklif.id} value={teklif.id}>
                  {teklif.ad || 'İsimsiz Teklif'} - {teklif.firma?.ad || 'Firma Yok'}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
            <textarea
              value={formData.aciklama}
              onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ödeme hakkında notlar..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Link
            href="/odeme/liste"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}
