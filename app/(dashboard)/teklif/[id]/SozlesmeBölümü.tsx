'use client'

import { useState, useEffect } from 'react'
import { FileText, Upload, X, Download, Save } from 'lucide-react'

interface Sozlesme {
  id: string
  teklifId: string
  dosyaUrl: string | null
  notlar: string | null
  createdAt: string
  updatedAt: string
}

interface SozlesmeBölümüProps {
  teklifId: string
}

export default function SozlesmeBölümü({ teklifId }: SozlesmeBölümüProps) {
  const [sozlesme, setSozlesme] = useState<Sozlesme | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [notlar, setNotlar] = useState('')
  const [dosyaUrl, setDosyaUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchSozlesme()
  }, [teklifId])

  const fetchSozlesme = async () => {
    try {
      const response = await fetch(`/api/teklif/${teklifId}/sozlesme`)
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setSozlesme(data)
          setNotlar(data.notlar || '')
          setDosyaUrl(data.dosyaUrl || null)
        }
      }
    } catch (error) {
      console.error('Sözleşme yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

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
        await saveSozlesme(data.url, notlar)
      } else {
        alert('Dosya yüklenirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const saveSozlesme = async (url?: string, notes?: string) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/teklif/${teklifId}/sozlesme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dosyaUrl: url !== undefined ? url : dosyaUrl,
          notlar: notes !== undefined ? notes : notlar,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSozlesme(data)
        alert('Sözleşme kaydedildi')
      } else {
        alert('Sözleşme kaydedilirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = () => {
    saveSozlesme()
  }

  const handleDeleteFile = async () => {
    if (confirm('Dosyayı silmek istediğinize emin misiniz?')) {
      setDosyaUrl(null)
      await saveSozlesme(undefined, notlar)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="text-gray-700" size={20} />
        <h2 className="text-lg font-semibold text-gray-900">Sözleşme</h2>
      </div>

      <div className="space-y-4">
        {/* Dosya Yükleme */}
        <div>
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
                <p className="text-xs text-gray-500 mt-1">
                  {dosyaUrl.split('/').pop()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={dosyaUrl}
                  download
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                  title="İndir"
                >
                  <Download size={18} />
                </a>
                <button
                  onClick={handleDeleteFile}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                  title="Sil"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {uploading ? (
                  <div className="text-gray-600">Yükleniyor...</div>
                ) : (
                  <>
                    <Upload className="text-gray-400" size={32} />
                    <span className="text-sm text-gray-600">
                      Dosya yüklemek için tıklayın
                    </span>
                    <span className="text-xs text-gray-500">
                      PDF, DOC, DOCX, TXT
                    </span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>

        {/* Notlar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notlar
          </label>
          <textarea
            value={notlar}
            onChange={(e) => setNotlar(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Sözleşme ile ilgili notlarınızı buraya yazabilirsiniz..."
          />
        </div>

        {/* Kaydet Butonu */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>

        {/* Oluşturulma Tarihi */}
        {sozlesme && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Oluşturulma: {new Date(sozlesme.createdAt).toLocaleString('tr-TR')}
              {sozlesme.updatedAt !== sozlesme.createdAt && (
                <span className="ml-2">
                  • Güncellenme: {new Date(sozlesme.updatedAt).toLocaleString('tr-TR')}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

