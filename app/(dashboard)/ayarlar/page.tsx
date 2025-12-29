'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function AyarlarPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const newPassword = formData.get('newPassword') as string

    if (newPassword && newPassword.length < 6) {
      setMessage('Yeni şifre en az 6 karakter olmalıdır')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/ayarlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          newPassword: newPassword || undefined,
        }),
      })

      if (response.ok) {
        setMessage('Ayarlar başarıyla güncellendi')
        e.currentTarget.reset()
      } else {
        const data = await response.json()
        setMessage(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      setMessage('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ayarlar</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profil Bilgileri</h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm text-gray-600">Kullanıcı Adı</label>
              <p className="text-gray-900 font-medium">{(session?.user as any)?.username}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Ad Soyad</label>
              <p className="text-gray-900 font-medium">{session?.user?.name}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Yetki</label>
              <p className="text-gray-900 font-medium">{(session?.user as any)?.role || 'Kullanıcı'}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Şifre Değiştir</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div
                className={`p-3 rounded-lg ${
                  message.includes('başarıyla')
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {message}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mevcut Şifre
              </label>
              <input
                type="password"
                name="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Şifre (Opsiyonel)
              </label>
              <input
                type="password"
                name="newPassword"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}









