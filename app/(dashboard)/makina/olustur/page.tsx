'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Upload, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface Bilesen {
  ad: string
  aciklama: string
  miktar: number
  birimMaliyet: number
  paraBirimi: string
  toplamMaliyet: number
  toplamMaliyetEUR: number
}

export default function MakinaOlusturPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    ad: '',
    model: '',
    durum: 'Aktif',
    aciklama: '',
    fotograf: '',
    toplamMaliyet: 0,
  })
  const [bilesenler, setBilesenler] = useState<Bilesen[]>([])
  const [yeniBilesen, setYeniBilesen] = useState<Bilesen>({
    ad: '',
    aciklama: '',
    miktar: 1,
    birimMaliyet: 0,
    paraBirimi: 'EUR',
    toplamMaliyet: 0,
    toplamMaliyetEUR: 0,
  })
  const [dovizKurlari, setDovizKurlari] = useState({ usd: 34.5, eur: 37.2 })

  useEffect(() => {
    // Döviz kurlarını yükle
    fetch('/api/doviz-kuru')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDovizKurlari({ usd: data.usd.try, eur: data.eur.try })
        }
      })
      .catch(() => {})
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, fotograf: data.url })
      } else {
        alert('Fotoğraf yüklenirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const hesaplaMaliyetEUR = (miktar: number, birimMaliyet: number, paraBirimi: string): number => {
    let maliyetEUR = birimMaliyet
    if (paraBirimi === 'USD') {
      maliyetEUR = birimMaliyet / (dovizKurlari.usd / dovizKurlari.eur)
    } else if (paraBirimi === 'TRY') {
      maliyetEUR = birimMaliyet / dovizKurlari.eur
    }
    return miktar * maliyetEUR
  }

  const addBilesenToList = () => {
    if (!yeniBilesen.ad.trim()) {
      alert('Lütfen bileşen adı girin')
      return
    }

    const toplamMaliyetEUR = hesaplaMaliyetEUR(
      yeniBilesen.miktar,
      yeniBilesen.birimMaliyet,
      yeniBilesen.paraBirimi
    )

    const bilesen: Bilesen = {
      ...yeniBilesen,
      toplamMaliyet: yeniBilesen.miktar * yeniBilesen.birimMaliyet,
      toplamMaliyetEUR,
    }

    setBilesenler([...bilesenler, bilesen])
    
    // Formu sıfırla
    setYeniBilesen({
      ad: '',
      aciklama: '',
      miktar: 1,
      birimMaliyet: 0,
      paraBirimi: 'EUR',
      toplamMaliyet: 0,
      toplamMaliyetEUR: 0,
    })

    // Toplam maliyeti güncelle
    const toplam = [...bilesenler, bilesen].reduce((sum, b) => sum + b.toplamMaliyetEUR, 0)
    setFormData({ ...formData, toplamMaliyet: toplam })
  }

  const removeBilesen = (index: number) => {
    const updated = bilesenler.filter((_, i) => i !== index)
    setBilesenler(updated)
    
    // Toplam maliyeti güncelle
    const toplam = updated.reduce((sum, b) => sum + b.toplamMaliyetEUR, 0)
    setFormData({ ...formData, toplamMaliyet: toplam })
  }

  const updateYeniBilesen = (field: keyof Bilesen, value: any) => {
    const updated = { ...yeniBilesen, [field]: value }
    
    if (field === 'miktar' || field === 'birimMaliyet' || field === 'paraBirimi') {
      updated.toplamMaliyet = updated.miktar * updated.birimMaliyet
      updated.toplamMaliyetEUR = hesaplaMaliyetEUR(
        updated.miktar,
        updated.birimMaliyet,
        updated.paraBirimi
      )
    }
    
    setYeniBilesen(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/makina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          bilesenler: bilesenler.map((b) => ({
            ad: b.ad,
            aciklama: b.aciklama,
            miktar: b.miktar,
            birimMaliyet: b.birimMaliyet,
            paraBirimi: b.paraBirimi,
            toplamMaliyet: b.toplamMaliyetEUR, // EUR cinsinden kaydet
          })),
        }),
      })

      if (response.ok) {
        router.push('/makina/liste')
        router.refresh()
      } else {
        alert('Makina oluşturulurken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Makina Ekle</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Makina Adı *
          </label>
          <input
            type="text"
            required
            value={formData.ad}
            onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model
          </label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durum *
          </label>
          <select
            value={formData.durum}
            onChange={(e) => setFormData({ ...formData, durum: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Aktif">Aktif</option>
            <option value="Bakımda">Bakımda</option>
            <option value="Pasif">Pasif</option>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fotoğraf
          </label>
          {formData.fotograf ? (
            <div className="space-y-2">
              <div className="relative w-48 h-48 border border-gray-300 rounded-lg overflow-hidden">
                <Image
                  src={formData.fotograf}
                  alt="Makina fotoğrafı"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, fotograf: '' })}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Fotoğrafı Kaldır
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="fotograf-upload"
              />
              <label
                htmlFor="fotograf-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload size={32} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  {uploading ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bileşenler</h3>
          </div>

          {/* Yeni Bileşen Ekleme Formu */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Yeni Bileşen Ekle</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Bileşen Adı *</label>
                <input
                  type="text"
                  value={yeniBilesen.ad}
                  onChange={(e) => updateYeniBilesen('ad', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Örn: Motor, Dişli, vb."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Miktar *</label>
                <input
                  type="number"
                  min="1"
                  value={yeniBilesen.miktar}
                  onChange={(e) => updateYeniBilesen('miktar', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Para Birimi *</label>
                <select
                  value={yeniBilesen.paraBirimi}
                  onChange={(e) => updateYeniBilesen('paraBirimi', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="EUR">EUR (Euro)</option>
                  <option value="USD">USD (Dolar)</option>
                  <option value="TRY">TRY (Türk Lirası)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">
                  Birim Maliyet ({yeniBilesen.paraBirimi}) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={yeniBilesen.birimMaliyet}
                  onChange={(e) => updateYeniBilesen('birimMaliyet', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-700 mb-1">Açıklama</label>
                <input
                  type="text"
                  value={yeniBilesen.aciklama}
                  onChange={(e) => updateYeniBilesen('aciklama', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Bileşen hakkında notlar..."
                />
              </div>
              <div className="col-span-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>Toplam: {yeniBilesen.toplamMaliyet.toFixed(2)} {yeniBilesen.paraBirimi}</span>
                  <span>≈ {yeniBilesen.toplamMaliyetEUR.toFixed(2)} EUR</span>
                </div>
                <button
                  type="button"
                  onClick={addBilesenToList}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Listeye Ekle
                </button>
              </div>
            </div>
          </div>

          {/* Eklenen Bileşenler Listesi */}
          <div className="space-y-3">
            {bilesenler.map((bilesen, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{bilesen.ad}</h4>
                  <button
                    type="button"
                    onClick={() => removeBilesen(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Miktar: {bilesen.miktar}</div>
                  <div>Para Birimi: {bilesen.paraBirimi}</div>
                  <div>Birim Maliyet: {bilesen.birimMaliyet.toFixed(2)} {bilesen.paraBirimi}</div>
                  <div className="font-semibold text-gray-900">
                    Toplam: {bilesen.toplamMaliyetEUR.toFixed(2)} EUR
                  </div>
                </div>
                {bilesen.aciklama && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Açıklama:</span> {bilesen.aciklama}
                  </div>
                )}
              </div>
            ))}
            {bilesenler.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Henüz bileşen eklenmemiş. Yukarıdaki formu doldurup "Listeye Ekle" butonuna tıklayın.
              </p>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-sm text-gray-600">Toplam Makina Maliyeti</p>
              <p className="text-2xl font-bold text-gray-900">
                {formData.toplamMaliyet.toFixed(2)} €
              </p>
            </div>
          </div>
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

