import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Package,
  FileText,
  ShoppingCart,

export const dynamic = 'force-dynamic'
  ArrowRight,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function FinansPage() {
  // Tüm teklifleri getir (gelirler)
  const teklifler = await prisma.teklif.findMany({
    include: {
      firma: true,
      sozlesme: true,
    },
  })

  // Tüm satın almaları getir (giderler)
  const satinAlmalar = await prisma.satinAlma.findMany({
    include: {
      uretim: {
        include: {
          teklif: true,
        },
      },
    },
  })

  // Genel gider satın almaları
  const genelGiderler = satinAlmalar.filter((sa) => sa.genelGider)
  const projeGiderleri = satinAlmalar.filter((sa) => !sa.genelGider)

  // İstatistikler
  const toplamGelir = teklifler.reduce((sum, t) => sum + t.toplamFiyat, 0)
  const toplamProjeGideri = projeGiderleri.reduce((sum, sa) => sum + sa.toplamFiyat, 0)
  const toplamGenelGider = genelGiderler.reduce((sum, sa) => sum + sa.toplamFiyat, 0)
  const toplamGider = toplamProjeGideri + toplamGenelGider
  const netKar = toplamGelir - toplamGider

  // Yaklaşan ödemeler (30 gün içinde)
  const bugun = new Date()
  const otuzGunSonra = new Date()
  otuzGunSonra.setDate(bugun.getDate() + 30)

  const yaklasanOdemeler = satinAlmalar
    .filter((sa) => {
      if (!sa.teslimTarihi) return false
      const teslimTarihi = new Date(sa.teslimTarihi)
      return teslimTarihi >= bugun && teslimTarihi <= otuzGunSonra
    })
    .sort((a, b) => {
      const tarihA = a.teslimTarihi ? new Date(a.teslimTarihi).getTime() : 0
      const tarihB = b.teslimTarihi ? new Date(b.teslimTarihi).getTime() : 0
      return tarihA - tarihB
    })
    .slice(0, 10)

  const yaklasanOdemelerToplam = yaklasanOdemeler.reduce(
    (sum, sa) => sum + sa.toplamFiyat,
    0
  )

  // Proje bazlı finansal durum
  const projeFinansalDurum = teklifler.map((teklif) => {
    const projeSatınAlmalar = projeGiderleri.filter(
      (sa) => sa.uretim?.teklifId === teklif.id
    )
    const projeGideri = projeSatınAlmalar.reduce((sum, sa) => sum + sa.toplamFiyat, 0)
    const projeKar = teklif.toplamFiyat - projeGideri
    const karMarji = teklif.toplamFiyat > 0 ? (projeKar / teklif.toplamFiyat) * 100 : 0

    return {
      teklif,
      gelir: teklif.toplamFiyat,
      gider: projeGideri,
      kar: projeKar,
      karMarji,
      satınAlmaSayisi: projeSatınAlmalar.length,
    }
  })

  // En karlı projeler
  const enKarliProjeler = [...projeFinansalDurum]
    .sort((a, b) => b.kar - a.kar)
    .slice(0, 5)

  // En çok gider olan projeler
  const enCokGiderProjeler = [...projeFinansalDurum]
    .sort((a, b) => b.gider - a.gider)
    .slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Finans & Nakit Akışı</h1>
        <p className="text-gray-600 mt-1">Finansal durumunuzu tek bir yerden görüntüleyin</p>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-100">Toplam Gelir</h3>
            <TrendingUp size={20} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(toplamGelir)}</p>
          <p className="text-sm text-green-100 mt-2">
            {teklifler.length} teklif toplamı
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-red-100">Toplam Gider</h3>
            <TrendingDown size={20} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(toplamGider)}</p>
          <div className="text-sm text-red-100 mt-2 space-y-1">
            <p>Proje: {formatCurrency(toplamProjeGideri)}</p>
            <p>Genel: {formatCurrency(toplamGenelGider)}</p>
          </div>
        </div>

        <div
          className={`rounded-lg shadow-lg p-6 text-white ${
            netKar >= 0
              ? 'bg-gradient-to-br from-blue-500 to-blue-600'
              : 'bg-gradient-to-br from-orange-500 to-orange-600'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Net Kar/Zarar</h3>
            {netKar >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          </div>
          <p className="text-3xl font-bold">{formatCurrency(netKar)}</p>
          <p className="text-sm mt-2">
            Kar marjı: {toplamGelir > 0 ? ((netKar / toplamGelir) * 100).toFixed(1) : 0}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-purple-100">Yaklaşan Ödemeler</h3>
            <Calendar size={20} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(yaklasanOdemelerToplam)}</p>
          <p className="text-sm text-purple-100 mt-2">
            {yaklasanOdemeler.length} ödeme (30 gün)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Yaklaşan Ödemeler */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Yaklaşan Ödemeler</h2>
            <Link
              href="/finans/yaklasan-odemeler"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Tümünü Gör
              <ArrowRight size={16} />
            </Link>
          </div>
          {yaklasanOdemeler.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="mx-auto mb-2 text-gray-400" size={32} />
              <p>Yaklaşan ödeme bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-3">
              {yaklasanOdemeler.map((odeme) => (
                <div
                  key={odeme.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
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
                            {odeme.uretim?.teklif?.ad || 'Bilinmeyen Proje'}
                          </p>
                        )}
                        {odeme.tedarikciFirma && (
                          <p>Tedarikçi: {odeme.tedarikciFirma}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">
                        {formatCurrency(odeme.toplamFiyat)}
                      </p>
                      {odeme.teslimTarihi && (
                        <p className="text-sm text-gray-500">
                          {formatDate(odeme.teslimTarihi)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Genel Giderler Özeti */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Genel Giderler Özeti</h2>
            <Link
              href="/finans/genel-giderler"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Detaylı Gör
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Toplam Genel Gider</span>
                <span className="text-2xl font-bold text-purple-600">
                  {formatCurrency(toplamGenelGider)}
                </span>
              </div>
              <p className="text-xs text-gray-600">{genelGiderler.length} kayıt</p>
            </div>
            {genelGiderler.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900">Son Genel Giderler</h3>
                {genelGiderler.slice(0, 5).map((gider) => (
                  <div
                    key={gider.id}
                    className="flex items-center justify-between text-sm border-b border-gray-100 pb-2"
                  >
                    <span className="text-gray-700">{gider.urunAdi}</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(gider.toplamFiyat)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Proje Bazlı Finansal Durum */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Proje Bazlı Finansal Durum</h2>
          <Link
            href="/finans/projeler"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Detaylı Gör
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Proje
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Firma
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Gelir
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Gider
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Kar/Zarar
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Kar Marjı
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projeFinansalDurum.map((proje) => (
                <tr key={proje.teklif.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/projeler/${proje.teklif.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {proje.teklif.ad || 'İsimsiz Proje'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {proje.teklif.firma?.ad || 'Firma Yok'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">
                    {formatCurrency(proje.gelir)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-red-600">
                    {formatCurrency(proje.gider)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-bold ${
                      proje.kar >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(proje.kar)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        proje.karMarji >= 20
                          ? 'bg-green-100 text-green-800'
                          : proje.karMarji >= 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {proje.karMarji.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hızlı Erişim */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/finans/projeler"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500"
        >
          <div className="flex items-center gap-3 mb-3">
            <FileText className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Proje Bazlı Planlama</h3>
          </div>
          <p className="text-sm text-gray-600">
            Her projenin finansal durumunu detaylı olarak görüntüleyin
          </p>
        </Link>

        <Link
          href="/finans/genel-giderler"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-purple-500"
        >
          <div className="flex items-center gap-3 mb-3">
            <ShoppingCart className="text-purple-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Genel Giderler</h3>
          </div>
          <p className="text-sm text-gray-600">
            Genel giderlerinizi takip edin ve analiz edin
          </p>
        </Link>

        <Link
          href="/finans/yaklasan-odemeler"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-orange-500"
        >
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="text-orange-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Yaklaşan Ödemeler</h3>
          </div>
          <p className="text-sm text-gray-600">
            Önümüzdeki dönemde yapılacak ödemeleri görüntüleyin
          </p>
        </Link>
      </div>
    </div>
  )
}
