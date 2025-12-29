'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Upload } from 'lucide-react'

interface Firma {
  id: string
  ad: string
}

interface Makina {
  id: string
  ad: string
  model: string | null
  fotograf: string | null
}

type IskontoTuru = 'yuzde' | 'tutar'

interface TeklifUrun {
  urunAdi: string
  birim: string
  miktar: number
  birimMaliyet: number
  birimFiyat: number
  kdv: number
  iskonto: number
  iskontoTuru: IskontoTuru
  toplamMaliyet: number
  toplamFiyat: number
  aciklama: string
}

interface Attachment {
  name: string
  url: string
}

export default function TeklifOlusturPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [firmalar, setFirmalar] = useState<Firma[]>([])
  const [makinalar, setMakinalar] = useState<Makina[]>([])
  const [formData, setFormData] = useState({
    ad: '',
    firmaId: '',
    makinaId: '',
    konu: '',
    not: '',
    odemeSekli: '',
    paraBirimi: 'TRY',
    aciklama: '',
    teklifTarihi: '',
  })
  const [iletisim, setIletisim] = useState({
    ticariUnvan: '',
    yetkiliAdSoyad: '',
    telefon: '',
    email: '',
    vergiKimlikNo: '',
    vergiDairesi: '',
    adres: '',
  })
  const [urunler, setUrunler] = useState<TeklifUrun[]>([
    {
      urunAdi: '',
      birim: 'Adet',
      miktar: 1,
      birimMaliyet: 0,
      birimFiyat: 0,
      kdv: 0,
      iskonto: 0,
      iskontoTuru: 'yuzde',
      toplamMaliyet: 0,
      toplamFiyat: 0,
      aciklama: '',
    },
  ])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [genelIskonto, setGenelIskonto] = useState(0)
  const [genelIskontoTuru, setGenelIskontoTuru] = useState<IskontoTuru>('yuzde')

  useEffect(() => {
    fetch('/api/firma')
      .then((res) => {
        if (!res.ok) throw new Error('Firmalar yüklenemedi')
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data)) setFirmalar(data)
      })
      .catch(() => setFirmalar([]))

    fetch('/api/makina')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMakinalar(data)
      })
      .catch(() => setMakinalar([]))
  }, [])

  const currencySymbol = useMemo(() => {
    if (formData.paraBirimi === 'EUR') return '€'
    if (formData.paraBirimi === 'USD') return '$'
    return '₺'
  }, [formData.paraBirimi])

  const calcTotals = (urun: TeklifUrun) => {
    const baseFiyat = (urun.birimFiyat || 0) * (urun.miktar || 0)
    const baseMaliyet = (urun.birimMaliyet || 0) * (urun.miktar || 0)

    const iskontoTutar =
      urun.iskontoTuru === 'tutar'
        ? urun.iskonto
        : (baseFiyat * (urun.iskonto || 0)) / 100

    const fiyatSon = Math.max(0, baseFiyat - (iskontoTutar || 0))
    const kdvTutar = (fiyatSon * (urun.kdv || 0)) / 100
    const toplamFiyat = fiyatSon + kdvTutar

    return {
      toplamFiyat,
      toplamMaliyet: baseMaliyet,
    }
  }

  const addUrun = () => {
    setUrunler((prev) => [
      ...prev,
      {
        urunAdi: '',
        birim: 'Adet',
        miktar: 1,
        birimMaliyet: 0,
        birimFiyat: 0,
        kdv: 0,
        iskonto: 0,
        iskontoTuru: 'yuzde',
        toplamMaliyet: 0,
        toplamFiyat: 0,
        aciklama: '',
      },
    ])
  }

  const removeUrun = (index: number) => {
    setUrunler((prev) => prev.filter((_, i) => i !== index))
  }

  const updateUrun = (index: number, field: keyof TeklifUrun, value: any) => {
    setUrunler((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      const totals = calcTotals(updated[index])
      updated[index].toplamFiyat = totals.toplamFiyat
      updated[index].toplamMaliyet = totals.toplamMaliyet
      return updated
    })
  }

  const toplamMaliyet = useMemo(
    () => urunler.reduce((sum, u) => sum + (u.toplamMaliyet || 0), 0),
    [urunler]
  )

  const toplamFiyatBrut = useMemo(
    () => urunler.reduce((sum, u) => sum + (u.toplamFiyat || 0), 0),
    [urunler]
  )

  const genelIskontoTutari =
    genelIskontoTuru === 'tutar'
      ? genelIskonto
      : (toplamFiyatBrut * (genelIskonto || 0)) / 100

  const toplamFiyatNet = Math.max(0, toplamFiyatBrut - genelIskontoTutari)

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const uploads = await Promise.all(
        Array.from(files).map(async (file) => {
          const body = new FormData()
          body.append('file', file)
          const res = await fetch('/api/upload', { method: 'POST', body })
          if (!res.ok) throw new Error('Dosya yüklenemedi')
          const data = await res.json()
          return { name: file.name, url: data.url as string }
        })
      )
      setAttachments((prev) => [...prev, ...uploads])
    } catch (error) {
      alert('Dosya yüklenirken sorun oluştu')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firmaId || urunler.length === 0) {
      alert('Lütfen firma seçin ve en az bir ürün ekleyin')
      return
    }

    setLoading(true)

    try {
      const meta = {
        iletisim,
        odemeSekli: formData.odemeSekli,
        konu: formData.konu,
        not: formData.not,
        paraBirimi: formData.paraBirimi,
        toplamMaliyet,
        toplamFiyatBrut,
        genelIskonto,
        genelIskontoTuru,
        toplamFiyatNet,
        attachments,
        urunDetay: urunler.map((u) => ({
          birim: u.birim,
          birimMaliyet: u.birimMaliyet,
          kdv: u.kdv,
          iskonto: u.iskonto,
          iskontoTuru: u.iskontoTuru,
          toplamMaliyet: u.toplamMaliyet,
        })),
      }

      const response = await fetch('/api/teklif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad: formData.ad || formData.konu || null,
          firmaId: formData.firmaId,
          makinaId: formData.makinaId || null,
          toplamFiyat: Number(toplamFiyatNet) || 0,
          aciklama: JSON.stringify(meta),
          teklifTarihi: formData.teklifTarihi || null,
          urunler: urunler
            .filter((u) => u.urunAdi && u.urunAdi.trim() !== '')
            .map((u) => ({
              urunAdi: String(u.urunAdi).trim(),
              miktar: parseInt(String(u.miktar || 1), 10),
              birimFiyat: parseFloat(String(u.birimFiyat || 0)),
              toplamFiyat: parseFloat(String(u.toplamFiyat || 0)),
              aciklama: u.aciklama && String(u.aciklama).trim() !== '' ? String(u.aciklama).trim() : null,
            })),
        }),
      })

      if (response.ok) {
        router.push('/teklif/liste?durum=tum')
        router.refresh()
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(
          `Teklif oluşturulurken bir hata oluştu: ${
            errorData.details || errorData.error || 'Bilinmeyen hata'
          }`
        )
      }
    } catch (error) {
      console.error('Teklif oluşturma hatası:', error)
      alert(`Bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">Yönetici</p>
          <h1 className="text-2xl font-bold text-gray-900">Teklif Oluştur</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Firma (Ticari Ünvan) *
              </label>
              <select
                required
                value={formData.firmaId}
                onChange={(e) => setFormData({ ...formData, firmaId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Firma seçin</option>
                {firmalar.length === 0 && <option value="" disabled>Firma yükleniyor...</option>}
                {firmalar.map((firma) => (
                  <option key={firma.id} value={firma.id}>
                    {firma.ad}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yetkili Ad Soyad *
              </label>
              <input
                type="text"
                required
                value={iletisim.yetkiliAdSoyad}
                onChange={(e) => setIletisim({ ...iletisim, yetkiliAdSoyad: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Yetkili kişi adı"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
              <input
                type="tel"
                required
                value={iletisim.telefon}
                onChange={(e) => setIletisim({ ...iletisim, telefon: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="05xx xxx xx xx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta *</label>
              <input
                type="email"
                required
                value={iletisim.email}
                onChange={(e) => setIletisim({ ...iletisim, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="ornek@mail.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Kimlik No</label>
              <input
                type="text"
                value={iletisim.vergiKimlikNo}
                onChange={(e) => setIletisim({ ...iletisim, vergiKimlikNo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Dairesi</label>
              <input
                type="text"
                value={iletisim.vergiDairesi}
                onChange={(e) => setIletisim({ ...iletisim, vergiDairesi: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres *</label>
              <textarea
                required
                rows={2}
                value={iletisim.adres}
                onChange={(e) => setIletisim({ ...iletisim, adres: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Şekli *</label>
                <input
                  type="text"
                  required
                  value={formData.odemeSekli}
                  onChange={(e) => setFormData({ ...formData, odemeSekli: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Havale / Kredi Kartı / Nakit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
                <select
                  value={formData.paraBirimi}
                  onChange={(e) => setFormData({ ...formData, paraBirimi: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TRY">₺ TRY</option>
                  <option value="EUR">€ EUR</option>
                  <option value="USD">$ USD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konu *</label>
              <input
                type="text"
                required
                value={formData.konu}
                onChange={(e) => setFormData({ ...formData, konu: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Teklif konusu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Not</label>
              <input
                type="text"
                value={formData.not}
                onChange={(e) => setFormData({ ...formData, not: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ek notlar"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teklif Adı (opsiyonel)
              </label>
              <input
                type="text"
                value={formData.ad}
                onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="İç referans adı"
              />
              <p className="text-xs text-gray-500 mt-1">
                Boş bırakırsanız konu başlığı teklif adı olarak kullanılır.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Makina (Opsiyonel)</label>
              <select
                value={formData.makinaId}
                onChange={(e) => setFormData({ ...formData, makinaId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Makina seçin (opsiyonel)</option>
                {makinalar.map((makina) => (
                  <option key={makina.id} value={makina.id}>
                    {makina.ad} {makina.model ? `- ${makina.model}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teklif Tarihi (opsiyonel)
            </label>
            <input
              type="date"
              value={formData.teklifTarihi}
              onChange={(e) => setFormData({ ...formData, teklifTarihi: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Boş bırakırsanız bugünün tarihi kullanılır. Geriye yönelik tarih seçebilirsiniz.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Ürün / Hizmet</h2>
            <button
              type="button"
              onClick={addUrun}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Ekle
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Ürün / Hizmet</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 w-24">Birim</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 w-24">B. Maliyet</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 w-24">B. Fiyat</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 w-20">Miktar</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 w-28">T. Maliyet</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 w-28">T. Fiyat</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 w-20">KDV %</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 w-24">İskonto</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 w-16">#</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {urunler.map((urun, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        required
                        value={urun.urunAdi}
                        onChange={(e) => updateUrun(index, 'urunAdi', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        placeholder="Ürün / Hizmet"
                      />
                      <input
                        type="text"
                        value={urun.aciklama}
                        onChange={(e) => updateUrun(index, 'aciklama', e.target.value)}
                        className="w-full mt-1 px-2 py-1 border border-dashed border-gray-200 rounded text-xs"
                        placeholder="Not / Açıklama"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={urun.birim}
                        onChange={(e) => updateUrun(index, 'birim', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={urun.birimMaliyet}
                        onChange={(e) =>
                          updateUrun(index, 'birimMaliyet', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={urun.birimFiyat}
                        onChange={(e) =>
                          updateUrun(index, 'birimFiyat', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="1"
                        value={urun.miktar}
                        onChange={(e) =>
                          updateUrun(index, 'miktar', parseInt(e.target.value) || 1)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-3 py-2 text-gray-800">{urun.toplamMaliyet.toFixed(2)}</td>
                    <td className="px-3 py-2 text-gray-800">{urun.toplamFiyat.toFixed(2)}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={urun.kdv}
                        onChange={(e) => updateUrun(index, 'kdv', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <input
                          type="number"
                          min="0"
                          value={urun.iskonto}
                          onChange={(e) =>
                            updateUrun(index, 'iskonto', parseFloat(e.target.value) || 0)
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                        <select
                          value={urun.iskontoTuru}
                          onChange={(e) =>
                            updateUrun(index, 'iskontoTuru', e.target.value as IskontoTuru)
                          }
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                        >
                          <option value="yuzde">%</option>
                          <option value="tutar">Tutar</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {urunler.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeUrun(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Teknik Dosyalar</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg cursor-pointer hover:bg-gray-200">
                  <Upload size={18} />
                  Dosya Yükle
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </label>
                {uploading && <span className="text-sm text-gray-500">Yükleniyor...</span>}
              </div>
              {attachments.length > 0 && (
                <ul className="text-sm text-gray-700 space-y-1">
                  {attachments.map((file, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span className="truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Kaldır
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">İskonto</label>
                <input
                  type="number"
                  min="0"
                  value={genelIskonto}
                  onChange={(e) => setGenelIskonto(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Türü</label>
                <select
                  value={genelIskontoTuru}
                  onChange={(e) => setGenelIskontoTuru(e.target.value as IskontoTuru)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="yuzde">%</option>
                  <option value="tutar">Tutar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Toplam Maliyet</label>
                <div className="px-3 py-2 border rounded bg-gray-50">
                  {toplamMaliyet.toFixed(2)} {currencySymbol}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Toplam Fiyat</label>
                <div className="px-3 py-2 border rounded bg-gray-50">
                  {toplamFiyatNet.toFixed(2)} {currencySymbol}
                </div>
                <p className="text-xs text-gray-500">
                  İskonto sonrası tutar (KDV dahil).
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
            {loading ? 'Kaydediliyor...' : 'Teklif Oluştur'}
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

