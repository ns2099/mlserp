import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, FileText, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function FinansProjelerPage() {
  // Tüm teklifleri getir
  const teklifler = await prisma.teklif.findMany({
    include: {
      firma: true,
      uretimler: {
        include: {
          satinAlmalar: {
            where: {
              genelGider: false,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Her proje için finansal durum hesapla
  const projeFinansalDurum = teklifler.map((teklif) => {
    const projeSatınAlmalar = teklif.uretimler.flatMap((u) => u.satinAlmalar)
    const toplamGider = projeSatınAlmalar.reduce((sum, sa) => sum + sa.toplamFiyat, 0)
    const kar = teklif.toplamFiyat - toplamGider
    const karMarji = teklif.toplamFiyat > 0 ? (kar / teklif.toplamFiyat) * 100 : 0

    // Yaklaşan ödemeler (30 gün içinde)
    const bugun = new Date()
    const otuzGunSonra = new Date()
    otuzGunSonra.setDate(bugun.getDate() + 30)

    const yaklasanOdemeler = projeSatınAlmalar.filter((sa) => {
      if (!sa.teslimTarihi) return false
      const teslimTarihi = new Date(sa.teslimTarihi)
      return teslimTarihi >= bugun && teslimTarihi <= otuzGunSonra
    })

    const yaklasanOdemelerToplam = yaklasanOdemeler.reduce(
      (sum, sa) => sum + sa.toplamFiyat,
      0
    )

    return {
      teklif,
      gelir: teklif.toplamFiyat,
      gider: toplamGider,
      kar,
      karMarji,
      satınAlmaSayisi: projeSatınAlmalar.length,
      yaklasanOdemeler: yaklasanOdemeler.length,
      yaklasanOdemelerToplam,
      satınAlmalar: projeSatınAlmalar,
    }
  })

  // Toplam istatistikler
  const toplamGelir = projeFinansalDurum.reduce((sum, p) => sum + p.gelir, 0)
  const toplamGider = projeFinansalDurum.reduce((sum, p) => sum + p.gider, 0)
  const toplamKar = toplamGelir - toplamGider

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
        <h1 className="text-3xl font-bold text-gray-900">Proje Bazlı Finansal Planlama</h1>
        <p className="text-gray-600 mt-1">Her projenin finansal durumunu detaylı olarak görüntüleyin</p>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-100">Toplam Gelir</h3>
            <TrendingUp size={20} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(toplamGelir)}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-red-100">Toplam Gider</h3>
            <TrendingDown size={20} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(toplamGider)}</p>
        </div>

        <div
          className={`rounded-lg shadow-lg p-6 text-white ${
            toplamKar >= 0
              ? 'bg-gradient-to-br from-blue-500 to-blue-600'
              : 'bg-gradient-to-br from-orange-500 to-orange-600'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Net Kar</h3>
            {toplamKar >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          </div>
          <p className="text-3xl font-bold">{formatCurrency(toplamKar)}</p>
        </div>
      </div>

      {/* Proje Listesi */}
      <div className="space-y-6">
        {projeFinansalDurum.map((proje) => (
          <div key={proje.teklif.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Link
                  href={`/projeler/${proje.teklif.id}`}
                  className="text-xl font-semibold text-blue-600 hover:text-blue-800"
                >
                  {proje.teklif.ad || 'İsimsiz Proje'}
                </Link>
                <p className="text-sm text-gray-600 mt-1">{proje.teklif.firma.ad}</p>
              </div>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  proje.kar >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {proje.kar >= 0 ? 'Karlı' : 'Zararlı'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Gelir</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(proje.gelir)}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Gider</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(proje.gider)}
                </p>
              </div>
              <div
                className={`rounded-lg p-4 ${
                  proje.kar >= 0 ? 'bg-blue-50' : 'bg-orange-50'
                }`}
              >
                <p className="text-xs text-gray-600 mb-1">Kar/Zarar</p>
                <p
                  className={`text-lg font-bold ${
                    proje.kar >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`}
                >
                  {formatCurrency(proje.kar)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Kar Marjı</p>
                <p className="text-lg font-bold text-gray-900">
                  {proje.karMarji.toFixed(1)}%
                </p>
              </div>
            </div>

            {proje.yaklasanOdemeler > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">
                      Yaklaşan Ödemeler
                    </p>
                    <p className="text-xs text-yellow-700">
                      {proje.yaklasanOdemeler} ödeme, toplam{' '}
                      {formatCurrency(proje.yaklasanOdemelerToplam)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {proje.satınAlmalar.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Satın Almalar ({proje.satınAlmalar.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Ürün
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Tedarikçi
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                          Tutar
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Durum
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Teslim Tarihi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {proje.satınAlmalar.map((sa) => (
                        <tr key={sa.id}>
                          <td className="px-3 py-2 text-gray-900">{sa.urunAdi}</td>
                          <td className="px-3 py-2 text-gray-600">
                            {sa.tedarikciFirma || '-'}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-gray-900">
                            {formatCurrency(sa.toplamFiyat)}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                sa.durum === 'Teslim Edildi'
                                  ? 'bg-green-100 text-green-800'
                                  : sa.durum === 'Sipariş Verildi'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {sa.durum}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {sa.teslimTarihi ? formatDate(sa.teslimTarihi) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}









