'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Calendar, Building2, User, ArrowLeft, Edit, Trash2, Save, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Toplanti {
  id: string
  firmaId: string
  yetkiliKisiId?: string
  toplantiTarihi: string
  konu?: string
  notlar?: string
  firma: {
    id: string
    ad: string
    yetkiliKisiler: Array<{
      id: string
      adSoyad: string
      telefon?: string
      email?: string
      pozisyon?: string
    }>
  }
  yetkiliKisi?: {
    id: string
    adSoyad: string
    telefon?: string
    email?: string
    pozisyon?: string
  }
  user: {
    id: string
    username: string
    adSoyad?: string
  }
}

interface Firma {
  id: string
  ad: string
  yetkiliKisiler: Array<{
    id: string
    adSoyad: string
    telefon?: string
    email?: string
    pozisyon?: string
  }>
}

export default function ToplantiDetayPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [toplanti, setToplanti] = useState<Toplanti | null>(null)
  const [firmalar, setFirmalar] = useState<Firma[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firmaId: '',
    yetkiliKisiId: '',
    toplantiTarihi: '',
    konu: '',
    notlar: '',
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [toplantiRes, firmalarRes] = await Promise.all([
          fetch(`/api/toplanti/${id}`),
          fetch('/api/firma'),
        ])

        if (toplantiRes.ok) {
          const toplantiData = await toplantiRes.json()
          setToplanti(toplantiData)
          
          // Form verilerini doldur
          const tarih = new Date(toplantiData.toplantiTarihi)
          const tarihStr = `${tarih.getFullYear()}-${String(tarih.getMonth() + 1).padStart(2, '0')}-${String(tarih.getDate()).padStart(2, '0')}T${String(tarih.getHours()).padStart(2, '0')}:${String(tarih.getMinutes()).padStart(2, '0')}`
          
          setFormData({
            firmaId: toplantiData.firmaId,
            yetkiliKisiId: toplantiData.yetkiliKisiId || '',
            toplantiTarihi: tarihStr,
            konu: toplantiData.konu || '',
            notlar: toplantiData.notlar || '',
          })
        }

        if (firmalarRes.ok) {
          const firmalarData = await firmalarRes.json()
          setFirmalar(firmalarData)
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/toplanti/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firmaId: formData.firmaId,
          yetkiliKisiId: formData.yetkiliKisiId || null,
          toplantiTarihi: formData.toplantiTarihi,
          konu: formData.konu || null,
          notlar: formData.notlar || null,
        }),
      })

      if (response.ok) {
        const updatedToplanti = await response.json()
        setToplanti(updatedToplanti)
        setIsEditing(false)
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Toplantı güncellenirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu toplantıyı silmek istediğinize emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/toplanti/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/toplantilar')
        router.refresh()
      } else {
        alert('Toplantı silinirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!toplanti) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Toplantı bulunamadı
        </div>
      </div>
    )
  }

  const selectedFirma = firmalar.find((f) => f.id === formData.firmaId)
  const yetkiliKisiler = selectedFirma?.yetkiliKisiler || []

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {toplanti.konu || 'Toplantı Detayı'}
            </h1>
            <p className="text-gray-600 mt-1">{formatDate(toplanti.toplantiTarihi)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit size={16} />
                <span>Düzenle</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
                <span>Sil</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Save size={16} />
                <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  // Form verilerini sıfırla
                  const tarih = new Date(toplanti.toplantiTarihi)
                  const tarihStr = `${tarih.getFullYear()}-${String(tarih.getMonth() + 1).padStart(2, '0')}-${String(tarih.getDate()).padStart(2, '0')}T${String(tarih.getHours()).padStart(2, '0')}:${String(tarih.getMinutes()).padStart(2, '0')}`
                  setFormData({
                    firmaId: toplanti.firmaId,
                    yetkiliKisiId: toplanti.yetkiliKisiId || '',
                    toplantiTarihi: tarihStr,
                    konu: toplanti.konu || '',
                    notlar: toplanti.notlar || '',
                  })
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X size={16} />
                <span>İptal</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 size={16} className="inline mr-2" />
            Firma
          </label>
          {isEditing ? (
            <select
              required
              value={formData.firmaId}
              onChange={(e) => {
                setFormData({ ...formData, firmaId: e.target.value, yetkiliKisiId: '' })
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Firma Seçin</option>
              {firmalar.map((firma) => (
                <option key={firma.id} value={firma.id}>
                  {firma.ad}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-gray-900">{toplanti.firma?.ad}</p>
          )}
        </div>

        {selectedFirma && yetkiliKisiler.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              Görüşülen Firma Yetkilisi
            </label>
            {isEditing ? (
              <select
                value={formData.yetkiliKisiId}
                onChange={(e) => setFormData({ ...formData, yetkiliKisiId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Yetkili Kişi Seçin (Opsiyonel)</option>
                {yetkiliKisiler.map((yetkili) => (
                  <option key={yetkili.id} value={yetkili.id}>
                    {yetkili.adSoyad} {yetkili.pozisyon ? `- ${yetkili.pozisyon}` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900">
                {toplanti.yetkiliKisi?.adSoyad || '-'}
                {toplanti.yetkiliKisi?.pozisyon && (
                  <span className="text-gray-500 ml-2">({toplanti.yetkiliKisi.pozisyon})</span>
                )}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar size={16} className="inline mr-2" />
            Toplantı Tarihi
          </label>
          {isEditing ? (
            <input
              type="datetime-local"
              required
              value={formData.toplantiTarihi}
              onChange={(e) => setFormData({ ...formData, toplantiTarihi: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900">{formatDate(toplanti.toplantiTarihi)}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Konu
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.konu}
              onChange={(e) => setFormData({ ...formData, konu: e.target.value })}
              placeholder="Toplantı konusu"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900">{toplanti.konu || '-'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Toplantı Notları
          </label>
          {isEditing ? (
            <textarea
              value={formData.notlar}
              onChange={(e) => setFormData({ ...formData, notlar: e.target.value })}
              rows={10}
              placeholder="Toplantı notlarınızı buraya yazın..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap">
                {toplanti.notlar || 'Not bulunmuyor'}
              </p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Oluşturan: {toplanti.user?.adSoyad || toplanti.user?.username}
          </p>
        </div>
      </div>
    </div>
  )
}


