'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Upload, Save, X } from 'lucide-react'
import Link from 'next/link'

interface Teklif {
  id: string
  ad: string | null
  toplamFiyat: number
  firma: {
    ad: string
  }
  user: {
    adSoyad: string | null
  }
}

export default function SozlesmeOlusturPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [onaylananTeklifler, setOnaylananTeklifler] = useState<Teklif[]>([])
  const [selectedTeklifId, setSelectedTeklifId] = useState('')
  const [notlar, setNotlar] = useState('')
  const [dosyaUrl, setDosyaUrl] = useState<string | null>(null)
  const [mevcutSozlesme, setMevcutSozlesme] = useState<any>(null)

  useEffect(() => {
    // Onaylanan teklifleri yükle (durum=2)
    fetch('/api/teklif?durum=2')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOnaylananTeklifler(data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    // Seçilen teklif için mevcut sözleşmeyi kontrol et
    if (selectedTeklifId) {
      fetch(`/api/teklif/${selectedTeklifId}/sozlesme`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setMevcutSozlesme(data)
            setNotlar(data.notlar || '')
            setDosyaUrl(data.dosyaUrl || null)
          } else {
            setMevcutSozlesme(null)
            setNotlar('')
            setDosyaUrl(null)
          }
        })
        .catch(() => {
          setMevcutSozlesme(null)
          setNotlar('')
          setDosyaUrl(null)
        })
    }
  }, [selectedTeklifId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setDosyaUrl(data.url)
      } else {
        alert('Dosya yüklenirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeklifId) {
      alert('Lütfen bir teklif seçin')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/teklif/${selectedTeklifId}/sozlesme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dosyaUrl: dosyaUrl || null,
          notlar: notlar || null,
        }),
      })

      if (response.ok) {
        alert(mevcutSozlesme ? 'Sözleşme güncellendi' : 'Sözleşme oluşturuldu')
        router.push('/sozlesme/liste')
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Sözleşme kaydedilirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteFile = () => {
    if (confirm('Dosyayı silmek istediğinize emin misiniz?')) {
      setDosyaUrl(null)
    }
  }

  const selectedTeklif = onaylananTeklifler.find((t) => t.id === selectedTeklifId)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sözleşme Oluştur</h1>
        <Link
          href="/sozlesme/liste"
          className="text-gray-600 hover:text-gray-900 text-sm"
        >
          ← Sözleşme Listesine Dön
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
                  {teklif.ad || 'İsimsiz Teklif'} - {teklif.firma.ad} -{' '}
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
          </div>

          {/* Seçilen Teklif Bilgileri */}
          {selectedTeklif && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Teklif Bilgileri</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Teklif Adı:</span>{' '}
                  <span className="font-medium">{selectedTeklif.ad || 'İsimsiz Teklif'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Firma:</span>{' '}
                  <span className="font-medium">{selectedTeklif.firma.ad}</span>
                </div>
                <div>
                  <span className="text-gray-600">Toplam Fiyat:</span>{' '}
                  <span className="font-medium">
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    }).format(selectedTeklif.toplamFiyat)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Oluşturan:</span>{' '}
                  <span className="font-medium">{selectedTeklif.user.adSoyad || '-'}</span>
                </div>
              </div>
              {mevcutSozlesme && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-700">
                    ⚠️ Bu teklif için zaten bir sözleşme mevcut. Güncelleme yapıyorsunuz.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Dosya Yükleme */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sözleşme Dosyası
            </label>
            {dosyaUrl ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="text-blue-500" size={20} />
                <div className="flex-1">
                  <a
                    href={dosyaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Dosyayı Görüntüle
                  </a>
                  <p className="text-xs text-gray-500 mt-1">{dosyaUrl.split('/').pop()}</p>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteFile}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                  title="Sil"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                  disabled={!selectedTeklifId || uploading}
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer flex flex-col items-center gap-2 ${
                    !selectedTeklifId || uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? (
                    <div className="text-gray-600">Yükleniyor...</div>
                  ) : (
                    <>
                      <Upload className="text-gray-400" size={32} />
                      <span className="text-sm text-gray-600">
                        Dosya yüklemek için tıklayın
                      </span>
                      <span className="text-xs text-gray-500">PDF, DOC, DOCX, TXT</span>
                    </>
                  )}
                </label>
              </div>
            )}
            {!selectedTeklifId && (
              <p className="text-xs text-gray-500 mt-2">
                Önce bir teklif seçmeniz gerekiyor
              </p>
            )}
          </div>

          {/* Notlar */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sözleşme Notları
            </label>
            <textarea
              value={notlar}
              onChange={(e) => setNotlar(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Sözleşme ile ilgili notlarınızı buraya yazabilirsiniz..."
              disabled={!selectedTeklifId}
            />
            {!selectedTeklifId && (
              <p className="text-xs text-gray-500 mt-2">
                Önce bir teklif seçmeniz gerekiyor
              </p>
            )}
          </div>

          {/* Kaydet Butonu */}
          <div className="flex justify-end gap-3">
            <Link
              href="/sozlesme/liste"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={saving || !selectedTeklifId || uploading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {saving ? 'Kaydediliyor...' : mevcutSozlesme ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
















