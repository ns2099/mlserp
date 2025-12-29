'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Save, ShoppingCart, Package, Calendar, Factory, FileText } from 'lucide-react'
import Link from 'next/link'

interface Uretim {
  id: string
  teklif: {
    id: string
    ad: string | null
    firma: {
      ad: string
    }
  }
}

interface UretimPlanlamaAdimi {
  id: string
  adimAdi: string
  siraNo: number
  teklif: {
    id: string
    ad: string | null
    firma: {
      ad: string
    }
  }
}

export default function SatinAlmaOlusturPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isGenelGider, setIsGenelGider] = useState(false)
  const [uretimler, setUretimler] = useState<Uretim[]>([])
  const [selectedUretimId, setSelectedUretimId] = useState('')
  const [planlamaAdimlari, setPlanlamaAdimlari] = useState<UretimPlanlamaAdimi[]>([])
  const [selectedAdimId, setSelectedAdimId] = useState('')
  const [teklifler, setTeklifler] = useState<
    Array<{
      tedarikciAdi: string
      teklifNo: string
      birimFiyat: string
      toplamFiyat: string
      teslimSuresi: string
      odemeKosullari: string
      aciklama: string
      durum: string
    }>
  >([])
  const [formData, setFormData] = useState({
    urunAdi: '',
    miktar: '',
    birim: 'Adet',
    birimFiyat: '',
    tedarikciFirma: '',
    tedarikciIletisim: '',
    durum: 'Planlandı',
    siparisTarihi: '',
    teslimTarihi: '',
    faturaNo: '',
    aciklama: '',
  })
  const [tekrarlayanMi, setTekrarlayanMi] = useState(false)
  const [tekrarlamaSuresi, setTekrarlamaSuresi] = useState('Aylık')

  useEffect(() => {
    // Üretimleri yükle
    fetch('/api/uretim')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUretimler(data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    // URL'den uretimId al
    const uretimIdParam = searchParams.get('uretimId')
    if (uretimIdParam) {
      setSelectedUretimId(uretimIdParam)
    }
  }, [searchParams])

  useEffect(() => {
    // Üretim seçildiğinde planlama adımlarını yükle
    if (selectedUretimId) {
      fetch(`/api/uretim-planlama?teklifId=${uretimler.find((u) => u.id === selectedUretimId)?.teklif.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setPlanlamaAdimlari(data)
          }
        })
        .catch(() => {})
    } else {
      setPlanlamaAdimlari([])
      setSelectedAdimId('')
    }
  }, [selectedUretimId, uretimler])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Genel gider değilse üretim seçimi zorunlu
    if (!isGenelGider && !selectedUretimId) {
      alert('Lütfen bir üretim seçin veya "Genel Gider" seçeneğini işaretleyin')
      return
    }

    // Planlama adımı seçimi zorunlu değil (bağımsız olabilir)

    if (!formData.urunAdi || !formData.miktar || !formData.birimFiyat) {
      alert('Lütfen ürün adı, miktar ve birim fiyat alanlarını doldurun')
      return
    }

    const miktar = parseFloat(formData.miktar)
    const birimFiyat = parseFloat(formData.birimFiyat)
    const toplamFiyat = miktar * birimFiyat

    setSaving(true)
    try {
      const response = await fetch('/api/satin-alma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genelGider: isGenelGider,
          tekrarlayanMi: isGenelGider ? tekrarlayanMi : false,
          tekrarlamaSuresi: isGenelGider && tekrarlayanMi ? tekrarlamaSuresi : null,
          uretimId: isGenelGider ? null : selectedUretimId,
          uretimPlanlamaAdimiId: isGenelGider ? null : (selectedAdimId || null),
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
        const data = await response.json()
        const satinAlmaId = data.id

        // Eğer teklifler varsa, her birini ekle
        if (teklifler.length > 0) {
          const teklifPromises = teklifler
            .filter((t) => t.tedarikciAdi && t.birimFiyat && t.toplamFiyat) // Sadece dolu olanları ekle
            .map((teklif) =>
              fetch(`/api/satin-alma/${satinAlmaId}/teklifler`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  tedarikciAdi: teklif.tedarikciAdi,
                  teklifNo: teklif.teklifNo || null,
                  birimFiyat: parseFloat(teklif.birimFiyat),
                  toplamFiyat: parseFloat(teklif.toplamFiyat),
                  teslimSuresi: teklif.teslimSuresi ? parseInt(teklif.teslimSuresi) : null,
                  odemeKosullari: teklif.odemeKosullari || null,
                  aciklama: teklif.aciklama || null,
                  durum: teklif.durum || 'Beklemede',
                }),
              })
            )

          try {
            await Promise.all(teklifPromises)
          } catch (teklifError) {
            console.error('Teklif ekleme hatası:', teklifError)
            // Satın alma oluşturuldu ama teklifler eklenemedi - kullanıcıya bilgi ver
            alert(
              'Satın alma kaydı oluşturuldu ancak bazı teklifler eklenemedi. Detay sayfasından tekrar deneyebilirsiniz.'
            )
          }
        }

        alert('Satın alma kaydı ve teklifler başarıyla oluşturuldu')
        router.push(`/satin-alma/${satinAlmaId}`)
        router.refresh()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Satın alma kaydı oluşturulurken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const addTeklif = () => {
    setTeklifler([
      ...teklifler,
      {
        tedarikciAdi: '',
        teklifNo: '',
        birimFiyat: '',
        toplamFiyat: '',
        teslimSuresi: '',
        odemeKosullari: '',
        aciklama: '',
        durum: 'Beklemede',
      },
    ])
  }

  const removeTeklif = (index: number) => {
    setTeklifler(teklifler.filter((_, i) => i !== index))
  }

  const updateTeklif = (index: number, field: string, value: string) => {
    const updated = [...teklifler]
    updated[index] = { ...updated[index], [field]: value }
    setTeklifler(updated)
  }

  const selectedUretim = uretimler.find((u) => u.id === selectedUretimId)
  const selectedAdim = planlamaAdimlari.find((a) => a.id === selectedAdimId)
  const miktar = parseFloat(formData.miktar) || 0
  const birimFiyat = parseFloat(formData.birimFiyat) || 0
  const toplamFiyat = miktar * birimFiyat

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Satın Alma Oluştur</h1>
        <Link href="/satin-alma/liste" className="text-gray-600 hover:text-gray-900 text-sm">
          ← Satın Alma Listesine Dön
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Genel Gider / Üretim Seçimi */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Factory className="text-gray-700" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Satın Alma Türü</h2>
            </div>
            
            {/* Genel Gider Checkbox */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGenelGider}
                  onChange={(e) => {
                    setIsGenelGider(e.target.checked)
                    if (e.target.checked) {
                      setSelectedUretimId('')
                      setSelectedAdimId('')
                      setPlanlamaAdimlari([])
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Genel Gider (Herhangi bir üretime bağlı değil)
                </span>
              </label>
              {isGenelGider && (
                <>
                  <p className="text-sm text-gray-500 mt-2 ml-6">
                    Bu satın alma genel gider olarak kaydedilecek ve herhangi bir üretime bağlı olmayacak.
                  </p>
                  
                  {/* Tekrarlayan Gider Seçenekleri */}
                  <div className="ml-6 mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tekrarlayanMi}
                        onChange={(e) => setTekrarlayanMi(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Tekrarlayan Gider
                      </span>
                    </label>
                    
                    {tekrarlayanMi && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Tekrarlama Süresi
                        </label>
                        <select
                          value={tekrarlamaSuresi}
                          onChange={(e) => setTekrarlamaSuresi(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="Günlük">Günlük</option>
                          <option value="Haftalık">Haftalık</option>
                          <option value="Aylık">Aylık</option>
                          <option value="Üç Aylık">Üç Aylık</option>
                          <option value="Altı Aylık">Altı Aylık</option>
                          <option value="Yıllık">Yıllık</option>
                        </select>
                        <p className="text-xs text-gray-600">
                          Bu gider seçilen süre içinde otomatik olarak tekrarlanacaktır. Sonraki tekrar tarihi teslim tarihine göre hesaplanacaktır.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Üretim Seçimi - Genel Gider değilse göster */}
            {!isGenelGider && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Üretim <span className="text-red-500">*</span>
                </label>
            <select
              value={selectedUretimId}
              onChange={(e) => {
                setSelectedUretimId(e.target.value)
                setSelectedAdimId('')
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">-- Üretim Seçin --</option>
              {uretimler.map((uretim) => (
                <option key={uretim.id} value={uretim.id}>
                  {uretim.teklif.ad || 'İsimsiz Teklif'} - {uretim.teklif.firma.ad}
                </option>
              ))}
            </select>
            {uretimler.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Henüz üretim kaydı bulunmuyor. Önce üretim oluşturmanız gerekiyor.
              </p>
            )}
                {selectedUretim && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Seçilen Üretim</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Teklif:</span>{' '}
                        <span className="font-medium">
                          {selectedUretim.teklif.ad || 'İsimsiz Teklif'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Firma:</span>{' '}
                        <span className="font-medium">{selectedUretim.teklif.firma.ad}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Üretim Planlama Adımı Seçimi */}
          {!isGenelGider && selectedUretimId && (
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Üretim Planlama Adımı
              </label>
              <select
                value={selectedAdimId}
                onChange={(e) => setSelectedAdimId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!selectedUretimId}
              >
                <option value="">Bağımsız (Planlama adımı yok)</option>
                {planlamaAdimlari.map((adim) => (
                  <option key={adim.id} value={adim.id}>
                    Adım {adim.siraNo}: {adim.adimAdi}
                  </option>
                ))}
              </select>
              {planlamaAdimlari.length === 0 && selectedUretimId && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    Bu üretim için üretim planlama adımı bulunmuyor. "Bağımsız" seçeneği ile
                    satın alma kaydı oluşturabilirsiniz.
                  </p>
                </div>
              )}
              {selectedAdim && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Seçilen Adım</h3>
                  <div className="text-sm">
                    <span className="text-gray-600">Adım:</span>{' '}
                    <span className="font-medium">
                      {selectedAdim.siraNo}. {selectedAdim.adimAdi}
                    </span>
                  </div>
                </div>
              )}
              {!selectedAdimId && planlamaAdimlari.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    Bağımsız seçeneği seçildi. Bu satın alma herhangi bir planlama adımına
                    bağlı olmayacak.
                  </p>
                </div>
              )}
            </div>
          )}

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
                  type="text"
                  value={new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  }).format(toplamFiyat)}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-green-600"
                />
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
                  onChange={(e) =>
                    setFormData({ ...formData, tedarikciIletisim: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Telefon, Email vb."
                />
              </div>
            </div>
          </div>

          {/* Alınan Teklifler */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="text-gray-700" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">Alınan Teklifler</h2>
              </div>
              <button
                type="button"
                onClick={addTeklif}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <Plus size={16} />
                Teklif Ekle
              </button>
            </div>

            {teklifler.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-sm text-gray-600 mb-3">Henüz teklif eklenmedi</p>
                <button
                  type="button"
                  onClick={addTeklif}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  İlk Teklifi Ekle
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {teklifler.map((teklif, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Teklif #{index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeTeklif(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Kaldır
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tedarikçi Adı <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={teklif.tedarikciAdi}
                          onChange={(e) =>
                            updateTeklif(index, 'tedarikciAdi', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Teklif No
                        </label>
                        <input
                          type="text"
                          value={teklif.teklifNo}
                          onChange={(e) => updateTeklif(index, 'teklifNo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Durum
                        </label>
                        <select
                          value={teklif.durum}
                          onChange={(e) => updateTeklif(index, 'durum', e.target.value)}
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
                          value={teklif.birimFiyat}
                          onChange={(e) =>
                            updateTeklif(index, 'birimFiyat', e.target.value)
                          }
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
                          value={teklif.toplamFiyat}
                          onChange={(e) =>
                            updateTeklif(index, 'toplamFiyat', e.target.value)
                          }
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
                          value={teklif.teslimSuresi}
                          onChange={(e) =>
                            updateTeklif(index, 'teslimSuresi', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ödeme Koşulları
                        </label>
                        <input
                          type="text"
                          value={teklif.odemeKosullari}
                          onChange={(e) =>
                            updateTeklif(index, 'odemeKosullari', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Örn: %30 peşin, %70 teslimatta"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Açıklama
                        </label>
                        <textarea
                          value={teklif.aciklama}
                          onChange={(e) => updateTeklif(index, 'aciklama', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              href="/satin-alma/liste"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={saving || (!isGenelGider && !selectedUretimId)}
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
