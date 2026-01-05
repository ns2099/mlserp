import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Calendar, CheckCircle, Clock, ShoppingCart, ArrowRight, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function PlanlamaPage() {
  const planlamalar = await prisma.planlama.findMany({
    include: {
      teklif: {
        include: {
          firma: true,
        },
      },
    },
    orderBy: { baslangicTarihi: 'asc' },
  })

  const durumColors: Record<string, string> = {
    Planlandı: 'bg-blue-100 text-blue-800',
    Başladı: 'bg-yellow-100 text-yellow-800',
    Tamamlandı: 'bg-green-100 text-green-800',
  }

  const planlananPlanlamalar = planlamalar.filter((p) => p.durum === 'Planlandı')
  const devamEdenPlanlamalar = planlamalar.filter((p) => p.durum === 'Başladı')
  const tamamlananPlanlamalar = planlamalar.filter((p) => p.durum === 'Tamamlandı')

  return (
    <div>
      {/* Satın Alma Bölümü */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="text-gray-700" size={24} />
            <h1 className="text-2xl font-bold text-gray-900">Satın Alma</h1>
          </div>
          <Link
            href="/satin-alma/liste"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Tüm Satın Almaları Gör →
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-2">
                Üretim planlama adımları için satın alma kayıtları oluşturabilirsiniz.
              </p>
              <p className="text-sm text-gray-500">
                Her üretim aşaması için gerekli hammadde ve malzemelerin satın alma süreçlerini
                takip edin.
              </p>
            </div>
            <Link
              href="/satin-alma/olustur"
              className="ml-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ShoppingCart size={18} />
              Yeni Satın Alma
            </Link>
          </div>
        </div>
      </div>

      {/* Üretim Bölümü */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="text-gray-700" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Üretim</h1>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Planlanan</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {planlananPlanlamalar.length}
                </p>
              </div>
              <Calendar className="text-blue-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Devam Eden</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {devamEdenPlanlamalar.length}
                </p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tamamlanan</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {tamamlananPlanlamalar.length}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>
        </div>

        {/* Üretim Planlama - Adım Adım */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Üretim Planlama</h2>
        
        {planlamalar.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Henüz planlama bulunmuyor</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Adım 1: Planlandı */}
            {planlananPlanlamalar.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full font-bold">
                      1
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Planlandı</h3>
                    <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {planlananPlanlamalar.length} adet
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {planlananPlanlamalar.map((planlama) => (
                    <div key={planlama.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {planlama.teklif.firma?.ad || 'Firma Yok'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Başlangıç: {formatDate(planlama.baslangicTarihi)} • Bitiş: {formatDate(planlama.bitisTarihi)}
                          </div>
                          {planlama.aciklama && (
                            <div className="text-xs text-gray-600 mt-2">{planlama.aciklama}</div>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <Link
                              href={`/satin-alma/liste?teklifId=${planlama.teklifId}`}
                              className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                            >
                              <ShoppingCart size={12} />
                              Satın Almalar
                            </Link>
                            <Link
                              href={`/uretim-planlama/olustur?teklifId=${planlama.teklifId}`}
                              className="text-xs text-purple-600 hover:text-purple-800 inline-flex items-center gap-1"
                            >
                              <Eye size={12} />
                              Üretim Planlama
                            </Link>
                          </div>
                        </div>
                        <ArrowRight className="text-gray-400 ml-4" size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Adım 2: Başladı */}
            {devamEdenPlanlamalar.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full font-bold">
                      2
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Başladı</h3>
                    <span className="ml-auto px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      {devamEdenPlanlamalar.length} adet
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {devamEdenPlanlamalar.map((planlama) => (
                    <div key={planlama.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {planlama.teklif.firma?.ad || 'Firma Yok'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Başlangıç: {formatDate(planlama.baslangicTarihi)} • Bitiş: {formatDate(planlama.bitisTarihi)}
                          </div>
                          {planlama.aciklama && (
                            <div className="text-xs text-gray-600 mt-2">{planlama.aciklama}</div>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <Link
                              href={`/satin-alma/liste?teklifId=${planlama.teklifId}`}
                              className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                            >
                              <ShoppingCart size={12} />
                              Satın Almalar
                            </Link>
                            <Link
                              href={`/uretim-planlama/olustur?teklifId=${planlama.teklifId}`}
                              className="text-xs text-purple-600 hover:text-purple-800 inline-flex items-center gap-1"
                            >
                              <Eye size={12} />
                              Üretim Planlama
                            </Link>
                          </div>
                        </div>
                        <ArrowRight className="text-gray-400 ml-4" size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Adım 3: Tamamlandı */}
            {tamamlananPlanlamalar.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full font-bold">
                      3
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Tamamlandı</h3>
                    <span className="ml-auto px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {tamamlananPlanlamalar.length} adet
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {tamamlananPlanlamalar.map((planlama) => (
                    <div key={planlama.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {planlama.teklif.firma?.ad || 'Firma Yok'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Başlangıç: {formatDate(planlama.baslangicTarihi)} • Bitiş: {formatDate(planlama.bitisTarihi)}
                          </div>
                          {planlama.aciklama && (
                            <div className="text-xs text-gray-600 mt-2">{planlama.aciklama}</div>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <Link
                              href={`/satin-alma/liste?teklifId=${planlama.teklifId}`}
                              className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                            >
                              <ShoppingCart size={12} />
                              Satın Almalar
                            </Link>
                            <Link
                              href={`/uretim-planlama/olustur?teklifId=${planlama.teklifId}`}
                              className="text-xs text-purple-600 hover:text-purple-800 inline-flex items-center gap-1"
                            >
                              <Eye size={12} />
                              Üretim Planlama
                            </Link>
                          </div>
                        </div>
                        <CheckCircle className="text-green-500 ml-4" size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}









