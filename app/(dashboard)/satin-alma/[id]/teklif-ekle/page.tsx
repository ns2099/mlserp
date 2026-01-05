'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Save, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TeklifEklePage() {
  const router = useRouter()
  const params = useParams()
  const satinAlmaId = params.id as string
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    tedarikciAdi: '',
    teklifNo: '',
    birimFiyat: '',
    toplamFiyat: '',
    teslimSuresi: '',
    odemeKosullari: '',
    aciklama: '',
    durum: 'Beklemede',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.tedarikciAdi || !formData.birimFiyat || !formData.toplamFiyat) {
      alert('Lütfen tedarikçi adı, birim fiyat ve toplam fiyat alanlarını doldurun')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/satin-alma/${satinAlmaId}/teklifler`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tedarikciAdi: formData.tedarikciAdi,
          teklifNo: formData.teklifNo || null,
          birimFiyat: parseFloat(formData.birimFiyat),
          toplamFiyat: parseFloat(formData.toplamFiyat),
          teslimSuresi: formData.teslimSuresi ? parseInt(formData.teslimSuresi) : null,
          odemeKosullari: formData.odemeKosullari || null,
          aciklama: formData.aciklama || null,
          durum: formData.durum,
        }),
      })

      if (response.ok) {
        alert('Teklif başarıyla eklendi')
        router.push(`/satin-alma/${satinAlmaId}`)
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Teklif eklenirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/satin-alma/${satinAlmaId}`}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Teklif Ekle</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-gray-700" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Tedarikçi Teklif Bilgileri</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tedarikçi Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.tedarikciAdi}
                onChange={(e) => setFormData({ ...formData, tedarikciAdi: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teklif No</label>
              <input
                type="text"
                value={formData.teklifNo}
                onChange={(e) => setFormData({ ...formData, teklifNo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
              <select
                value={formData.durum}
                onChange={(e) => setFormData({ ...formData, durum: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Beklemede">Beklemede</option>
                <option value="Seçildi">Seçildi</option>
                <option value="Reddedildi">Reddedildi</option>
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
                Toplam Fiyat (TRY) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.toplamFiyat}
                onChange={(e) => setFormData({ ...formData, toplamFiyat: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teslim Süresi (Gün)
              </label>
              <input
                type="number"
                value={formData.teslimSuresi}
                onChange={(e) => setFormData({ ...formData, teslimSuresi: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ödeme Koşulları
              </label>
              <input
                type="text"
                value={formData.odemeKosullari}
                onChange={(e) => setFormData({ ...formData, odemeKosullari: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: %30 peşin, %70 teslimatta"
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

        <div className="flex justify-end gap-3">
          <Link
            href={`/satin-alma/${satinAlmaId}`}
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
    </div>
  )
}
















