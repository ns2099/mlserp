'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [emailSent, setEmailSent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        if (data.requiresPasswordReset) {
          // İlk giriş - şifre sıfırlama gerekiyor
          setError('')
          setSuccess('')
          // Email gönderildi mi kontrol et
          if (data.emailSent) {
            setEmailSent(data.user?.email || 'e-posta adresinize')
          } else {
            // Email gönderilemediyse hata göster
            setError(data.emailError || 'Email gönderilemedi. Lütfen yönetici ile iletişime geçin.')
            setEmailSent('')
          }
          setLoading(false)
        } else {
          // Normal giriş - dashboard'a yönlendir
          window.location.href = '/dashboard'
        }
      } else {
        setError(data.error || 'Kullanıcı adı veya şifre hatalı!')
        setSuccess('')
        setEmailSent('')
        setLoading(false)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/mlsmakina.png"
              alt="MLS MAKİNA Logo"
              width={120}
              height={120}
              className="object-contain"
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">MLS Makina</h1>
          <p className="text-sm text-gray-600 mb-6">Ürün Yönetim Sistemi</p>
          <p className="text-gray-600">Üretim Yönetim Sistemi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {emailSent && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
              <p className="font-semibold mb-1">📧 E-posta Gönderildi!</p>
              <p className="text-sm">
                Şifre sıfırlama linki <strong>{emailSent}</strong> adresine gönderilmiştir.
              </p>
              <p className="text-sm mt-2">
                Lütfen e-postanızı kontrol edin ve linke tıklayarak yeni şifrenizi belirleyin.
              </p>
              <p className="text-xs mt-2 text-blue-600">
                💡 Eğer email gelmediyse spam klasörünü kontrol edin.
              </p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Kullanıcı Adı
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white text-gray-900 placeholder-gray-500"
              placeholder="Kullanıcı adınızı girin"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white text-gray-900 placeholder-gray-500"
              placeholder="Şifrenizi girin"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Hesabınız yok mu?{' '}
              <a href="/kayit" className="text-blue-600 hover:text-blue-700 font-medium">
                Kayıt Ol
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

