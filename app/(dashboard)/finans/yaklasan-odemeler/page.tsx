import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function FinansYaklasanOdemelerPage() {
  // Tüm satın almaları getir
  const satinAlmalar = await prisma.satinAlma.findMany({
    include: {
      uretim: {
        include: {
          teklif: {
            include: {
              firma: true,
            },
          },
        },
      },
    },
    orderBy: { teslimTarihi: 'asc' },
  })

  const bugun = new Date()
  bugun.setHours(0, 0, 0, 0)

  // Yaklaşan ödemeleri kategorize et
  const yaklasanOdemeler = satinAlmalar
    .filter((sa) => {
      if (!sa.teslimTarihi) return false
      const teslimTarihi = new Date(sa.teslimTarihi)
      teslimTarihi.setHours(0, 0, 0, 0)
      return teslimTarihi >= bugun
    })
    .map((sa) => {
      const teslimTarihi = sa.teslimTarihi ? new Date(sa.teslimTarihi) : null
      const gunFarki = teslimTarihi
        ? Math.ceil((teslimTarihi.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24))
        : null

      return {
        ...sa,
        gunFarki,
        aciliyet:
          gunFarki === null
            ? 'belirsiz'
            : gunFarki <= 7
              ? 'acil'
              : gunFarki <= 14
                ? 'yakın'
                : gunFarki <= 30
                  ? 'normal'
                  : 'uzak',
      }
    })
    .sort((a, b) => {
      if (!a.teslimTarihi) return 1
      if (!b.teslimTarihi) return -1
      return new Date(a.teslimTarihi).getTime() - new Date(b.teslimTarihi).getTime()
    })

  // Aciliyet durumlarına göre grupla
  const acilOdemeler = yaklasanOdemeler.filter((o) => o.aciliyet === 'acil')
  const yakinOdemeler = yaklasanOdemeler.filter((o) => o.aciliyet === 'yakın')
  const normalOdemeler = yaklasanOdemeler.filter((o) => o.aciliyet === 'normal')
  const uzakOdemeler = yaklasanOdemeler.filter((o) => o.aciliyet === 'uzak')

  // Toplamlar
  const toplamTutar = yaklasanOdemeler.reduce((sum, o) => sum + o.toplamFiyat, 0)
  const acilToplam = acilOdemeler.reduce((sum, o) => sum + o.toplamFiyat, 0)
  const yakinToplam = yakinOdemeler.reduce((sum, o) => sum + o.toplamFiyat, 0)

  const aciliyetRenkleri: Record<string, string> = {
    acil: 'bg-red-100 text-red-800 border-red-300',
    yakın: 'bg-orange-100 text-orange-800 border-orange-300',
    normal: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    uzak: 'bg-blue-100 text-blue-800 border-blue-300',
    belirsiz: 'bg-gray-100 text-gray-800 border-gray-300',
  }

  const aciliyetEtiketleri: Record<string, string> = {
    acil: 'Acil (7 gün içinde)',
    yakın: 'Yakın (14 gün içinde)',
    normal: 'Normal (30 gün içinde)',
    uzak: 'Uzak (30+ gün)',
    belirsiz: 'Belirsiz',
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          href="/finans"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={18} />
          Finansal Özete Dön
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Yaklaşan Ödemeler</h1>
        <p className="text-gray-600 mt-1">Önümüzdeki dönemde yapılacak ödemeleri görüntüleyin</p>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-red-100">Acil Ödemeler</h3>
            <Clock size={20} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(acilToplam)}</p>
          <p className="text-sm text-red-100 mt-2">{acilOdemeler.length} ödeme</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-orange-100">Yakın Ödemeler</h3>
            <Calendar size={20} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(yakinToplam)}</p>
          <p className="text-sm text-orange-100 mt-2">{yakinOdemeler.length} ödeme</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-100">Toplam Ödeme</h3>
            <DollarSign size={20} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(toplamTutar)}</p>
          <p className="text-sm text-blue-100 mt-2">{yaklasanOdemeler.length} ödeme</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-purple-100">Ortalama</h3>
            <DollarSign size={20} />
          </div>
          <p className="text-3xl font-bold">
            {formatCurrency(
              yaklasanOdemeler.length > 0 ? toplamTutar / yaklasanOdemeler.length : 0
            )}
          </p>
          <p className="text-sm text-purple-100 mt-2">Ödeme başına</p>
        </div>
      </div>

      {/* Aciliyet Durumlarına Göre Listeler */}
      <div className="space-y-6">
        {/* Acil Ödemeler */}
        {acilOdemeler.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <h2 className="text-xl font-semibold text-gray-900">
                Acil Ödemeler (7 gün içinde)
              </h2>
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                {acilOdemeler.length}
              </span>
            </div>
            <div className="space-y-3">
              {acilOdemeler.map((odeme) => (
                <div
                  key={odeme.id}
                  className="border-2 border-red-300 rounded-lg p-4 bg-red-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{odeme.urunAdi}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        {odeme.genelGider ? (
                          <p className="text-purple-600 font-medium">Genel Gider</p>
                        ) : (
                          <p>
                            Proje:{' '}
                            {odeme.uretim?.teklif?.ad || 'Bilinmeyen Proje'} -{' '}
                            {odeme.uretim?.teklif?.firma?.ad}
                          </p>
                        )}
                        {odeme.tedarikciFirma && <p>Tedarikçi: {odeme.tedarikciFirma}</p>}
                        {odeme.aciklama && <p>Açıklama: {odeme.aciklama}</p>}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-gray-900 text-lg">
                        {formatCurrency(odeme.toplamFiyat)}
                      </p>
                      {odeme.teslimTarihi && (
                        <div className="mt-2">
                          <p className="text-sm font-semibold text-red-600">
                            {formatDate(odeme.teslimTarihi)}
                          </p>
                          {odeme.gunFarki !== null && (
                            <p className="text-xs text-red-600">
                              {odeme.gunFarki} gün sonra
                            </p>
                          )}
                        </div>
                      )}
                      <Link
                        href={`/satin-alma/${odeme.id}`}
                        className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
                      >
                        Detay →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Yakın Ödemeler */}
        {yakinOdemeler.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <h2 className="text-xl font-semibold text-gray-900">
                Yakın Ödemeler (14 gün içinde)
              </h2>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded">
                {yakinOdemeler.length}
              </span>
            </div>
            <div className="space-y-3">
              {yakinOdemeler.map((odeme) => (
                <div
                  key={odeme.id}
                  className="border border-orange-300 rounded-lg p-4 hover:bg-orange-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{odeme.urunAdi}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        {odeme.genelGider ? (
                          <p className="text-purple-600 font-medium">Genel Gider</p>
                        ) : (
                          <p>
                            Proje: {odeme.uretim?.teklif?.ad || 'Bilinmeyen Proje'}
                          </p>
                        )}
                        {odeme.tedarikciFirma && <p>Tedarikçi: {odeme.tedarikciFirma}</p>}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-gray-900">
                        {formatCurrency(odeme.toplamFiyat)}
                      </p>
                      {odeme.teslimTarihi && (
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(odeme.teslimTarihi)}
                        </p>
                      )}
                      <Link
                        href={`/satin-alma/${odeme.id}`}
                        className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
                      >
                        Detay →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Normal ve Uzak Ödemeler */}
        {(normalOdemeler.length > 0 || uzakOdemeler.length > 0) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Diğer Ödemeler</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ürün/Hizmet
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tip
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Proje
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Tutar
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Teslim Tarihi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kalan Gün
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[...normalOdemeler, ...uzakOdemeler].map((odeme) => (
                    <tr key={odeme.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{odeme.urunAdi}</td>
                      <td className="px-4 py-3">
                        {odeme.genelGider ? (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            Genel Gider
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            Proje
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {odeme.genelGider
                          ? '-'
                          : odeme.uretim?.teklif?.ad || 'Bilinmeyen Proje'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(odeme.toplamFiyat)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {odeme.teslimTarihi ? formatDate(odeme.teslimTarihi) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {odeme.gunFarki !== null ? (
                          <span className="text-sm text-gray-600">{odeme.gunFarki} gün</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/satin-alma/${odeme.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Detay
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {yaklasanOdemeler.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600">Yaklaşan ödeme bulunmuyor</p>
          </div>
        )}
      </div>
    </div>
  )
}















