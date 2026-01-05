'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Trash2, Save, Calendar, User, Wrench, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface Teklif {
  id: string
  ad: string | null
  toplamFiyat: number
  firma: {
    ad: string
  }
}

interface Kullanici {
  id: string
  adSoyad: string | null
  username: string
}

interface Makina {
  id: string
  ad: string
  model: string | null
}

interface PlanlamaAdimi {
  adimAdi: string
  siraNo: number
  kullaniciId: string
  makinaId: string | null
  baslangicTarihi: string
  bitisTarihi: string
  isMaliyeti: number
  durum: string
  aciklama: string
}

export default function UretimPlanlamaOlusturPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [onaylananTeklifler, setOnaylananTeklifler] = useState<Teklif[]>([])
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>([])
  const [selectedTeklifId, setSelectedTeklifId] = useState('')
  const [adimlar, setAdimlar] = useState<PlanlamaAdimi[]>([])
  
  // Sabit tezgah/makina listesi
  const tezgahlar = [
    'CNC Tezgah 1',
    'CNC Tezgah 2',
    'CNC Tezgah 3',
    'CNC Tezgah 4',
    'CNC Tezgah 5',
  ]

  useEffect(() => {
    // URL'den teklifId al
    const teklifIdParam = searchParams.get('teklifId')
    if (teklifIdParam) {
      setSelectedTeklifId(teklifIdParam)
    }
  }, [searchParams])

  useEffect(() => {
    // Onaylanan teklifleri yükle
    fetch('/api/teklif?durum=2')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOnaylananTeklifler(data)
        }
      })
      .catch(() => {})

    // Kullanıcıları yükle
    fetch('/api/kullanici')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setKullanicilar(data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    // Seçilen teklif için mevcut planlamayı yükle
    if (selectedTeklifId) {
      fetch(`/api/uretim-planlama?teklifId=${selectedTeklifId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setAdimlar(
              data.map((adim: any) => ({
                adimAdi: adim.adimAdi,
                siraNo: adim.siraNo,
                kullaniciId: adim.kullaniciId,
                makinaId: adim.tezgahAdi || adim.makinaId || '', // Önce tezgahAdi, yoksa makinaId
                baslangicTarihi: adim.baslangicTarihi.split('T')[0] + 'T' + adim.baslangicTarihi.split('T')[1]?.split('.')[0] || '',
                bitisTarihi: adim.bitisTarihi.split('T')[0] + 'T' + adim.bitisTarihi.split('T')[1]?.split('.')[0] || '',
                isMaliyeti: adim.isMaliyeti,
                durum: adim.durum,
                aciklama: adim.aciklama || '',
              }))
            )
          } else {
            setAdimlar([])
          }
        })
        .catch(() => setAdimlar([]))
    } else {
      setAdimlar([])
    }
  }, [selectedTeklifId])

  const addAdim = () => {
    const yeniSiraNo = adimlar.length > 0 ? Math.max(...adimlar.map((a) => a.siraNo)) + 1 : 1
    setAdimlar([
      ...adimlar,
      {
        adimAdi: '',
        siraNo: yeniSiraNo,
        kullaniciId: '',
        makinaId: '',
        baslangicTarihi: '',
        bitisTarihi: '',
        isMaliyeti: 0,
        durum: 'Planlandı',
        aciklama: '',
      },
    ])
  }

  const removeAdim = (index: number) => {
    setAdimlar(adimlar.filter((_, i) => i !== index))
  }

  const updateAdim = (index: number, field: keyof PlanlamaAdimi, value: any) => {
    const updated = [...adimlar]
    updated[index] = { ...updated[index], [field]: value }
    setAdimlar(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeklifId) {
      alert('Lütfen bir teklif seçin')
      return
    }

    if (adimlar.length === 0) {
      alert('En az bir planlama adımı eklemelisiniz')
      return
    }

    // Validasyon
    for (let i = 0; i < adimlar.length; i++) {
      const adim = adimlar[i]
      if (!adim.adimAdi || !adim.kullaniciId || !adim.baslangicTarihi || !adim.bitisTarihi) {
        alert(`Lütfen ${i + 1}. adımın tüm zorunlu alanlarını doldurun`)
        return
      }
      if (new Date(adim.baslangicTarihi) >= new Date(adim.bitisTarihi)) {
        alert(`${i + 1}. adımın bitiş tarihi başlangıç tarihinden sonra olmalıdır`)
        return
      }
    }

    setSaving(true)
    try {
      const response = await fetch('/api/uretim-planlama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teklifId: selectedTeklifId,
          adimlar: adimlar.map((adim) => ({
            ...adim,
            makinaId: adim.makinaId || null,
          })),
        }),
      })

      if (response.ok) {
        alert('Üretim planlama başarıyla kaydedildi')
        router.push('/uretim-planlama/liste')
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Planlama kaydedilirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const selectedTeklif = onaylananTeklifler.find((t) => t.id === selectedTeklifId)
  const toplamMaliyet = adimlar.reduce((sum, adim) => sum + (adim.isMaliyeti || 0), 0)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Üretim Planlama Oluştur</h1>
        <Link
          href="/uretim-planlama/liste"
          className="text-gray-600 hover:text-gray-900 text-sm"
        >
          ← Planlama Listesine Dön
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Teklif Seçimi */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teklif Seçin <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTeklifId}
              onChange={(e) => setSelectedTeklifId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">-- Teklif Seçin --</option>
              {onaylananTeklifler.map((teklif) => (
                <option key={teklif.id} value={teklif.id}>
                  {teklif.ad || 'İsimsiz Teklif'} - {teklif.firma?.ad || 'Firma Yok'} -{' '}
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  }).format(teklif.toplamFiyat)}
                </option>
              ))}
            </select>
            {onaylananTeklifler.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Onaylanan teklif bulunmuyor. Önce bir teklifi onaylamanız gerekiyor.
              </p>
            )}
            {selectedTeklif && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Teklif Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Teklif Adı:</span>{' '}
                    <span className="font-medium">{selectedTeklif.ad || 'İsimsiz Teklif'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Firma:</span>{' '}
                    <span className="font-medium">{selectedTeklif.firma?.ad || 'Firma Yok'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Planlama Adımları */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Planlama Adımları</h2>
              <button
                type="button"
                onClick={addAdim}
                disabled={!selectedTeklifId}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} />
                Adım Ekle
              </button>
            </div>

            {adimlar.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Henüz adım eklenmedi. "Adım Ekle" butonuna tıklayarak adım ekleyin.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {adimlar.map((adim, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Adım {adim.siraNo}</h3>
                      <button
                        type="button"
                        onClick={() => removeAdim(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adım Adı <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={adim.adimAdi}
                          onChange={(e) => updateAdim(index, 'adimAdi', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sıra No
                        </label>
                        <input
                          type="number"
                          value={adim.siraNo}
                          onChange={(e) => updateAdim(index, 'siraNo', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <User size={16} className="inline mr-1" />
                          Sorumlu Kullanıcı <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={adim.kullaniciId}
                          onChange={(e) => updateAdim(index, 'kullaniciId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">-- Seçin --</option>
                          {kullanicilar.map((kullanici) => (
                            <option key={kullanici.id} value={kullanici.id}>
                              {kullanici.adSoyad || kullanici.username}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Wrench size={16} className="inline mr-1" />
                          Tezgah/Makina
                        </label>
                        <select
                          value={adim.makinaId || ''}
                          onChange={(e) => updateAdim(index, 'makinaId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-- Seçin (Opsiyonel) --</option>
                          {tezgahlar.map((tezgah) => (
                            <option key={tezgah} value={tezgah}>
                              {tezgah}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Calendar size={16} className="inline mr-1" />
                          Başlangıç Tarihi <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={adim.baslangicTarihi}
                          onChange={(e) => updateAdim(index, 'baslangicTarihi', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Calendar size={16} className="inline mr-1" />
                          Bitiş Tarihi <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={adim.bitisTarihi}
                          onChange={(e) => updateAdim(index, 'bitisTarihi', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <DollarSign size={16} className="inline mr-1" />
                          İş Maliyeti (TRY)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={adim.isMaliyeti}
                          onChange={(e) => updateAdim(index, 'isMaliyeti', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Durum
                        </label>
                        <select
                          value={adim.durum}
                          onChange={(e) => updateAdim(index, 'durum', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Planlandı">Planlandı</option>
                          <option value="Başladı">Başladı</option>
                          <option value="Tamamlandı">Tamamlandı</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Açıklama
                        </label>
                        <textarea
                          value={adim.aciklama}
                          onChange={(e) => updateAdim(index, 'aciklama', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adimlar.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Toplam İş Maliyeti:</span>
                  <span className="text-lg font-bold text-green-700">
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    }).format(toplamMaliyet)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Kaydet Butonu */}
          <div className="flex justify-end gap-3">
            <Link
              href="/uretim-planlama/liste"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={saving || !selectedTeklifId || adimlar.length === 0}
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

