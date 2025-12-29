'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Plus, Trash2, Edit2, X } from 'lucide-react'

interface YetkiliKisi {
  id?: string
  adSoyad: string
  telefon: string
  email: string
  pozisyon: string
}

interface Firma {
  id: string
  ad: string
  telefon: string | null
  email: string | null
  adres: string | null
  yetkiliKisiler?: YetkiliKisi[]
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
  const [yetkiliKisiler, setYetkiliKisiler] = useState<YetkiliKisi[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newYetkiliKisi, setNewYetkiliKisi] = useState<YetkiliKisi>({
    adSoyad: '',
    telefon: '',
    email: '',
    pozisyon: '',
  })

  useEffect(() => {
    // Firma bilgilerini yükle
    fetch(`/api/firma/${id}`)
      .then((res) => res.json())
      .then((data: Firma) => {
        setFormData({
          ad: data.ad,
          telefon: data.telefon || '',
          email: data.email || '',
          adres: data.adres || '',
        })
        setYetkiliKisiler(data.yetkiliKisiler || [])
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
          yetkiliKisiler,
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

  const addYetkiliKisi = () => {
    if (!newYetkiliKisi.adSoyad.trim()) {
      alert('Lütfen ad soyad girin')
      return
    }
    setYetkiliKisiler([...yetkiliKisiler, { ...newYetkiliKisi }])
    setNewYetkiliKisi({
      adSoyad: '',
      telefon: '',
      email: '',
      pozisyon: '',
    })
  }

  const removeYetkiliKisi = (index: number) => {
    setYetkiliKisiler(yetkiliKisiler.filter((_, i) => i !== index))
  }

  const startEdit = (index: number) => {
    setEditingIndex(index)
    setNewYetkiliKisi({ ...yetkiliKisiler[index] })
  }

  const saveEdit = () => {
    if (editingIndex !== null && newYetkiliKisi.adSoyad.trim()) {
      const updated = [...yetkiliKisiler]
      updated[editingIndex] = { ...newYetkiliKisi }
      setYetkiliKisiler(updated)
      setEditingIndex(null)
      setNewYetkiliKisi({
        adSoyad: '',
        telefon: '',
        email: '',
        pozisyon: '',
      })
    }
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setNewYetkiliKisi({
      adSoyad: '',
      telefon: '',
      email: '',
      pozisyon: '',
    })
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Yetkili Kişiler</h3>
          </div>

          {/* Mevcut yetkili kişiler */}
          <div className="space-y-3 mb-4">
            {yetkiliKisiler.map((kisi, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                {editingIndex === index ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        value={newYetkiliKisi.adSoyad}
                        onChange={(e) =>
                          setNewYetkiliKisi({ ...newYetkiliKisi, adSoyad: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Telefon
                        </label>
                        <input
                          type="tel"
                          value={newYetkiliKisi.telefon}
                          onChange={(e) =>
                            setNewYetkiliKisi({ ...newYetkiliKisi, telefon: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          E-posta
                        </label>
                        <input
                          type="email"
                          value={newYetkiliKisi.email}
                          onChange={(e) =>
                            setNewYetkiliKisi({ ...newYetkiliKisi, email: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Pozisyon
                      </label>
                      <input
                        type="text"
                        value={newYetkiliKisi.pozisyon}
                        onChange={(e) =>
                          setNewYetkiliKisi({ ...newYetkiliKisi, pozisyon: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Kaydet
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{kisi.adSoyad}</p>
                      {kisi.pozisyon && (
                        <p className="text-sm text-gray-600">{kisi.pozisyon}</p>
                      )}
                      <div className="mt-2 space-y-1">
                        {kisi.telefon && (
                          <p className="text-sm text-gray-500">Tel: {kisi.telefon}</p>
                        )}
                        {kisi.email && (
                          <p className="text-sm text-gray-500">E-posta: {kisi.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(index)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeYetkiliKisi(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Yeni yetkili kişi ekleme */}
          {editingIndex === null && (
            <div className="border border-gray-300 rounded-lg p-4 bg-white">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Yeni Yetkili Kişi Ekle</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    value={newYetkiliKisi.adSoyad}
                    onChange={(e) =>
                      setNewYetkiliKisi({ ...newYetkiliKisi, adSoyad: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ad Soyad"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={newYetkiliKisi.telefon}
                      onChange={(e) =>
                        setNewYetkiliKisi({ ...newYetkiliKisi, telefon: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Telefon"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      E-posta
                    </label>
                    <input
                      type="email"
                      value={newYetkiliKisi.email}
                      onChange={(e) =>
                        setNewYetkiliKisi({ ...newYetkiliKisi, email: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="E-posta"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Pozisyon
                  </label>
                  <input
                    type="text"
                    value={newYetkiliKisi.pozisyon}
                    onChange={(e) =>
                      setNewYetkiliKisi({ ...newYetkiliKisi, pozisyon: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Örn: Genel Müdür, Satış Müdürü"
                  />
                </div>
                <button
                  type="button"
                  onClick={addYetkiliKisi}
                  className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Yetkili Kişi Ekle
                </button>
              </div>
            </div>
          )}
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


