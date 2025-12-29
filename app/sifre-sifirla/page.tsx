'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function SifreSifirlaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [yeniSifre, setYeniSifre] = useState('')
  const [sifreTekrar, setSifreTekrar] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Geçersiz token. Lütfen e-postanızdaki linki kullanın.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Geçersiz token')
      return
    }

    if (yeniSifre.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      return
    }

    if (yeniSifre !== sifreTekrar) {
      setError('Şifreler eşleşmiyor')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/sifre-degistir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          yeniSifre,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(data.error || 'Şifre değiştirilemedi')
        setLoading(false)
      }
    } catch (error: any) {
      console.error('Şifre değiştirme hatası:', error)
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Şifre Başarıyla Değiştirildi!</h2>
            <p className="text-gray-600">Yeni şifrenizle giriş yapabilirsiniz.</p>
          </div>
          <p className="text-sm text-gray-500">Giriş sayfasına yönlendiriliyorsunuz...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/mlsmakina.png"
              alt="MLS Makina Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Şifre Sıfırlama</h1>
          <p className="text-gray-600">Yeni şifrenizi belirleyin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="yeniSifre" className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Şifre
            </label>
            <div className="relative">
              <input
                id="yeniSifre"
                type={showPassword ? 'text' : 'password'}
                value={yeniSifre}
                onChange={(e) => setYeniSifre(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
            <label htmlFor="sifreTekrar" className="block text-sm font-medium text-gray-700 mb-2">
              Şifre Tekrar
            </label>
            <div className="relative">
              <input
                id="sifreTekrar"
                type={showPasswordRepeat ? 'text' : 'password'}
                value={sifreTekrar}
                onChange={(e) => setSifreTekrar(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Şifreyi tekrar girin"
              />
              <button
                type="button"
                onClick={() => setShowPasswordRepeat(!showPasswordRepeat)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswordRepeat ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Şifre değiştiriliyor...' : 'Şifreyi Değiştir'}
          </button>
        </form>
      </div>
    </div>
  )
}




