'use client'

import { useState, useEffect } from 'react'
import { User, Settings, DollarSign, Euro } from 'lucide-react'
import Link from 'next/link'

interface SessionData {
  id: string
  username: string
  name: string
  role: string
}

interface DovizKuru {
  usd: { try: number }
  eur: { try: number }
  success: boolean
}

export default function Header() {
  const [session, setSession] = useState<SessionData | null>(null)
  const [dovizKuru, setDovizKuru] = useState<DovizKuru | null>(null)

  useEffect(() => {
    // Session bilgisini cookie'den al
    const loadSession = () => {
      fetch('/api/auth/session')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setSession(data.user)
          }
        })
        .catch(() => {})
    }

    // İlk yükleme
    loadSession()

    // Her 60 saniyede bir güncelle (daha seyrek)
    const sessionInterval = setInterval(loadSession, 60000)

    // Döviz kurlarını yükle
    const loadDovizKuru = () => {
      fetch('/api/doviz-kuru')
        .then((res) => res.json())
        .then((data: DovizKuru) => {
          setDovizKuru(data)
        })
        .catch(() => {})
    }

    loadDovizKuru()
    // Her 5 dakikada bir güncelle
    const dovizInterval = setInterval(loadDovizKuru, 5 * 60 * 1000)

    return () => {
      clearInterval(sessionInterval)
      clearInterval(dovizInterval)
    }
  }, [])

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-64 z-30">
      <div className="px-6 py-4 flex items-center justify-end">
        <div className="flex items-center gap-4">
          {/* Döviz Kurları */}
          {dovizKuru && (
            <div className="flex items-center gap-4 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-900">
                  USD: <span className="text-blue-600">{dovizKuru.usd.try.toFixed(2)} ₺</span>
                </span>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <Euro size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-900">
                  EUR: <span className="text-blue-600">{dovizKuru.eur.try.toFixed(2)} ₺</span>
                </span>
              </div>
            </div>
          )}

          <Link
            href="/ayarlar"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings size={20} />
          </Link>
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
            <User size={20} className="text-gray-600" />
            <div className="text-sm">
              <p className="font-medium text-gray-900">{session?.name || 'Kullanıcı'}</p>
              <p className="text-xs text-gray-500">{session?.role || 'Kullanıcı'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

