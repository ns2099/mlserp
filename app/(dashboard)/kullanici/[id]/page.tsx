'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Kullanici {
  id: string
  username: string
  adSoyad: string
  yetki: string
}

interface Session {
  id: string
  username: string
  name: string
  role: string
}

export default function KullaniciDuzenlePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    adSoyad: '',
    yetki: 'Kullanıcı',
    password: '',
  })

  useEffect(() => {
    // Session bilgisini al
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSession(data.user)
        }
      })
      .catch(() => {})

    // Kullanıcı bilgilerini al
    fetch(`/api/kullanici/${id}`)
      .then((res) => res.json())
      .then((data: Kullanici) => {
        setFormData({
          username: data.username,
          adSoyad: data.adSoyad,
          yetki: data.yetki,
          password: '',
        })
        setLoadingData(false)
      })
      .catch(() => {
        setLoadingData(false)
      })
  }, [id])

  const isAdmin = session?.username === 'admin'
  const isEditingSelf = session?.id === id
  const canEditFull = isAdmin && !isEditingSelf // Admin başkasını düzenliyorsa
  const canOnlyEditPassword = !isAdmin && isEditingSelf // Normal kullanıcı kendisini düzenliyorsa

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/kullanici/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/kullanici/liste')
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Kullanıcı güncellenirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
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

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Yetki kontrolü
  if (!isAdmin && !isEditingSelf) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Yetkisiz Erişim</p>
          <p className="text-sm mt-1">Bu işlem için admin yetkisi gereklidir.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {canOnlyEditPassword ? 'Şifre Değiştir' : 'Kullanıcı Düzenle'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        {canEditFull && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı Adı *
              </label>
              <input
                type="text"
                required
                disabled={formData.username === 'admin'} // Admin kullanıcısının kullanıcı adını değiştirmeyi engelle
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {formData.username === 'admin' && (
                <p className="text-xs text-gray-500 mt-1">Admin kullanıcısının kullanıcı adı değiştirilemez</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad *
              </label>
              <input
                type="text"
                required
                value={formData.adSoyad}
                onChange={(e) => setFormData({ ...formData, adSoyad: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yetki *
              </label>
              <select
                value={formData.yetki}
                onChange={(e) => setFormData({ ...formData, yetki: e.target.value })}
                disabled={formData.username === 'admin'} // Admin kullanıcısının yetkisini değiştirmeyi engelle
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="Kullanıcı">Kullanıcı</option>
                <option value="Yönetici">Yönetici</option>
              </select>
              {formData.username === 'admin' && (
                <p className="text-xs text-gray-500 mt-1">Admin kullanıcısının yetkisi değiştirilemez</p>
              )}
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {canOnlyEditPassword ? 'Yeni Şifre *' : 'Şifre (Değiştirmek için doldurun)'}
          </label>
          <input
            type="password"
            required={canOnlyEditPassword}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={canOnlyEditPassword ? 'Yeni şifrenizi girin' : 'Boş bırakılırsa değişmez'}
          />
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









