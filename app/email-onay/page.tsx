'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'

function EmailOnayContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    username: '',
    adSoyad: '',
    password: '',
    passwordConfirm: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Geçersiz token. Lütfen e-postanızdaki linki kullanın.')
      setTokenValid(false)
    } else {
      // Token'ı kontrol et
      checkToken()
    }
  }, [token])

  const checkToken = async () => {
    try {
      const response = await fetch(`/api/auth/email-onay-kontrol?token=${token}`)
      const data = await response.json()
      
      if (response.ok && data.valid) {
        setTokenValid(true)
        setFormData({
          username: data.username || '',
          adSoyad: '',
          password: '',
          passwordConfirm: '',
        })
      } else {
        setTokenValid(false)
        setError(data.error || 'Geçersiz veya süresi dolmuş token')
      }
    } catch (error) {
      setTokenValid(false)
      setError('Token kontrol edilirken bir hata oluştu')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validasyon
    if (!formData.username || !formData.adSoyad || !formData.password || !formData.passwordConfirm) {
      setError('Tüm alanlar gerekli')
      return
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      return
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('Şifreler eşleşmiyor')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/email-onay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          username: formData.username,
          adSoyad: formData.adSoyad,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(data.error || 'Hesap onaylanırken bir hata oluştu')
        setLoading(false)
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      setLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Token kontrol ediliyor...</p>
        </div>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <XCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Geçersiz Token</h1>
            <p className="text-gray-600">{error}</p>
          </div>
          <a
            href="/login"
            className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Giriş Sayfasına Dön
          </a>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Hesap Onaylandı!</h1>
            <p className="text-gray-600 mb-6">Hesabınız başarıyla aktifleştirildi. Giriş sayfasına yönlendiriliyorsunuz...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="/mlsmakina.png"
            alt="MLS Makina"
            width={64}
            height={64}
            className="mx-auto mb-4"
            priority
            style={{ width: 'auto', height: 'auto' }}
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Hesap Onayı</h1>
          <p className="text-sm text-gray-600 mb-6">Hesabınızı aktifleştirmek için bilgilerinizi girin</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Kullanıcı Adı
            </label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="kullaniciadi"
            />
          </div>

          <div>
            <label htmlFor="adSoyad" className="block text-sm font-medium text-gray-700 mb-2">
              Ad Soyad
            </label>
            <input
              id="adSoyad"
              type="text"
              value={formData.adSoyad}
              onChange={(e) => setFormData({ ...formData, adSoyad: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Ad Soyad"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Şifre
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-10"
                placeholder="En az 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-2">
              Şifre Tekrar
            </label>
            <div className="relative">
              <input
                id="passwordConfirm"
                type={showPasswordConfirm ? 'text' : 'password'}
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-10"
                placeholder="Şifrenizi tekrar girin"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Lock size={20} />
            {loading ? 'Onaylanıyor...' : 'Hesabımı Onayla'}
          </button>

          <div className="text-center">
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Zaten hesabınız var mı? Giriş yapın
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function EmailOnayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    }>
      <EmailOnayContent />
    </Suspense>
  )
}