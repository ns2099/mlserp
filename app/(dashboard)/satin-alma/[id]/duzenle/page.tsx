'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Save, ShoppingCart, Package, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SatinAlmaDuzenlePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    urunAdi: '',
    miktar: '',
    birim: 'Adet',
    birimFiyat: '',
    toplamFiyat: '',
    tedarikciFirma: '',
    tedarikciIletisim: '',
    durum: 'Planlandı',
    siparisTarihi: '',
    teslimTarihi: '',
    faturaNo: '',
    aciklama: '',
  })

  useEffect(() => {
    fetch(`/api/satin-alma/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setFormData({
            urunAdi: data.urunAdi || '',
            miktar: data.miktar?.toString() || '',
            birim: data.birim || 'Adet',
            birimFiyat: data.birimFiyat?.toString() || '',
            toplamFiyat: data.toplamFiyat?.toString() || '',
            tedarikciFirma: data.tedarikciFirma || '',
            tedarikciIletisim: data.tedarikciIletisim || '',
            durum: data.durum || 'Planlandı',
            siparisTarihi: data.siparisTarihi
              ? new Date(data.siparisTarihi).toISOString().split('T')[0]
              : '',
            teslimTarihi: data.teslimTarihi
              ? new Date(data.teslimTarihi).toISOString().split('T')[0]
              : '',
            faturaNo: data.faturaNo || '',
            aciklama: data.aciklama || '',
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const miktar = parseFloat(formData.miktar) || 0
    const birimFiyat = parseFloat(formData.birimFiyat) || 0
    const toplamFiyat = parseFloat(formData.toplamFiyat) || miktar * birimFiyat

    setSaving(true)
    try {
      const response = await fetch(`/api/satin-alma/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urunAdi: formData.urunAdi,
          miktar: miktar,
          birim: formData.birim,
          birimFiyat: birimFiyat,
          toplamFiyat: toplamFiyat,
          tedarikciFirma: formData.tedarikciFirma || null,
          tedarikciIletisim: formData.tedarikciIletisim || null,
          durum: formData.durum,
          siparisTarihi: formData.siparisTarihi || null,
          teslimTarihi: formData.teslimTarihi || null,
          faturaNo: formData.faturaNo || null,
          aciklama: formData.aciklama || null,
        }),
      })

      if (response.ok) {
        alert('Satın alma kaydı başarıyla güncellendi')
        router.push(`/satin-alma/${id}`)
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Satın alma kaydı güncellenirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const miktar = parseFloat(formData.miktar) || 0
  const birimFiyat = parseFloat(formData.birimFiyat) || 0
  const hesaplananToplam = miktar * birimFiyat

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/satin-alma/${id}`}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Satın Alma Düzenle</h1>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ürün Bilgileri */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="text-gray-700" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Ürün Bilgileri</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.urunAdi}
                  onChange={(e) => setFormData({ ...formData, urunAdi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Miktar <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.miktar}
                  onChange={(e) => setFormData({ ...formData, miktar: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Birim</label>
                <select
                  value={formData.birim}
                  onChange={(e) => setFormData({ ...formData, birim: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Adet">Adet</option>
                  <option value="kg">kg</option>
                  <option value="m">m</option>
                  <option value="m²">m²</option>
                  <option value="m³">m³</option>
                  <option value="Litre">Litre</option>
                  <option value="Paket">Paket</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Birim Fiyat (TRY) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.birimFiyat}
                  onChange={(e) => setFormData({ ...formData, birimFiyat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Toplam Fiyat (TRY)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.toplamFiyat || hesaplananToplam}
                  onChange={(e) => setFormData({ ...formData, toplamFiyat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Hesaplanan: {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  }).format(hesaplananToplam)}
                </p>
              </div>
            </div>
          </div>

          {/* Tedarikçi Bilgileri */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingCart className="text-gray-700" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Tedarikçi Bilgileri</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tedarikçi Firma
                </label>
                <input
                  type="text"
                  value={formData.tedarikciFirma}
                  onChange={(e) => setFormData({ ...formData, tedarikciFirma: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tedarikçi İletişim
                </label>
                <input
                  type="text"
                  value={formData.tedarikciIletisim}
                  onChange={(e) => setFormData({ ...formData, tedarikciIletisim: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Durum ve Tarihler */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="text-gray-700" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Durum ve Tarihler</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                <select
                  value={formData.durum}
                  onChange={(e) => setFormData({ ...formData, durum: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Planlandı">Planlandı</option>
                  <option value="Sipariş Verildi">Sipariş Verildi</option>
                  <option value="Teslim Edildi">Teslim Edildi</option>
                  <option value="İptal">İptal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fatura No</label>
                <input
                  type="text"
                  value={formData.faturaNo}
                  onChange={(e) => setFormData({ ...formData, faturaNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sipariş Tarihi
                </label>
                <input
                  type="date"
                  value={formData.siparisTarihi}
                  onChange={(e) => setFormData({ ...formData, siparisTarihi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teslim Tarihi</label>
                <input
                  type="date"
                  value={formData.teslimTarihi}
                  onChange={(e) => setFormData({ ...formData, teslimTarihi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea
                  value={formData.aciklama}
                  onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Kaydet Butonu */}
          <div className="flex justify-end gap-3">
            <Link
              href={`/satin-alma/${id}`}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}










