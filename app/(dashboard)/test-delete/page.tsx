'use client'

import { useState } from 'react'

export default function TestDeletePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!confirm('Tüm "Üretimde" durumundaki kayıtları silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/uretim/delete-all-devam-eden', {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(`Başarılı: ${data.message}`)
      } else {
        setResult(`Hata: ${data.error || 'Bilinmeyen hata'}`)
      }
    } catch (error) {
      setResult(`Hata: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Üretimde Olan Kayıtları Sil</h1>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-yellow-800">
          <strong>Uyarı:</strong> Bu işlem tüm "Üretimde" durumundaki üretim kayıtlarını ve ilişkili kayıtları (giderler, gelişmeler, makina atamaları) kalıcı olarak silecektir. Bu işlem geri alınamaz!
        </p>
      </div>
      
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Siliniyor...' : 'Tüm Üretimde Olan Kayıtları Sil'}
      </button>

      {result && (
        <div className={`mt-4 p-4 rounded-lg ${result.includes('Başarılı') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {result}
        </div>
      )}

      <div className="mt-6">
        <a href="/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Dashboard'a Dön
        </a>
      </div>
    </div>
  )
}

