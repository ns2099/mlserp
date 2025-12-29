import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, DollarSign, Calendar } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function FinansGenelGiderlerPage() {
  // Genel gider satın almaları
  const genelGiderler = await prisma.satinAlma.findMany({
    where: {
      genelGider: true,
    },
    orderBy: [
      { tekrarlayanMi: 'desc' },
      { sonrakiTekrarTarihi: 'asc' },
      { createdAt: 'desc' },
    ],
  })

  // İstatistikler
  const toplamGenelGider = genelGiderler.reduce((sum, g) => sum + g.toplamFiyat, 0)
  const aylikOrtalama = genelGiderler.length > 0 ? toplamGenelGider / genelGiderler.length : 0

  // Kategorilere göre grupla (ürün adına göre)
  const kategoriler = genelGiderler.reduce((acc: any, gider) => {
    const kategori = gider.urunAdi
    if (!acc[kategori]) {
      acc[kategori] = {
        ad: kategori,
        toplam: 0,
        sayi: 0,
        giderler: [],
      }
    }
    acc[kategori].toplam += gider.toplamFiyat
    acc[kategori].sayi += 1
    acc[kategori].giderler.push(gider)
    return acc
  }, {})

  const kategoriListesi = Object.values(kategoriler).sort(
    (a: any, b: any) => b.toplam - a.toplam
  )

  // Yaklaşan ödemeler (30 gün içinde)
  const bugun = new Date()
  const otuzGunSonra = new Date()
  otuzGunSonra.setDate(bugun.getDate() + 30)

  const yaklasanOdemeler = genelGiderler.filter((gider) => {
    if (!gider.teslimTarihi) return false
    const teslimTarihi = new Date(gider.teslimTarihi)
    return teslimTarihi >= bugun && teslimTarihi <= otuzGunSonra
  })

  const yaklasanOdemelerToplam = yaklasanOdemeler.reduce(
    (sum, g) => sum + g.toplamFiyat,
    0
  )

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
        <h1 className="text-3xl font-bold text-gray-900">Genel Giderler Takibi</h1>
        <p className="text-gray-600 mt-1">Genel giderlerinizi kategorilere göre görüntüleyin ve analiz edin</p>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-purple-100">Toplam Genel Gider</h3>
            <DollarSign size={20} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(toplamGenelGider)}</p>
          <p className="text-sm text-purple-100 mt-2">{genelGiderler.length} kayıt</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-100">Kategori Sayısı</h3>
            <ShoppingCart size={20} />
          </div>
          <p className="text-3xl font-bold">{kategoriListesi.length}</p>
          <p className="text-sm text-blue-100 mt-2">Farklı kategori</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-100">Tekrarlayan Giderler</h3>
            <Calendar size={20} />
          </div>
          <p className="text-3xl font-bold">
            {genelGiderler.filter((g) => g.tekrarlayanMi).length}
          </p>
          <p className="text-sm text-green-100 mt-2">Aktif tekrarlayan</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-orange-100">Yaklaşan Ödemeler</h3>
            <Calendar size={20} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(yaklasanOdemelerToplam)}</p>
          <p className="text-sm text-orange-100 mt-2">
            {yaklasanOdemeler.length} ödeme (30 gün)
          </p>
        </div>
      </div>

      {/* Tekrarlayan Giderler */}
      {genelGiderler.filter((g) => g.tekrarlayanMi).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tekrarlayan Giderler</h2>
          <div className="space-y-3">
            {genelGiderler
              .filter((g) => g.tekrarlayanMi)
              .map((gider) => (
                <div
                  key={gider.id}
                  className="border border-green-200 rounded-lg p-4 bg-green-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{gider.urunAdi}</h3>
                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-semibold rounded">
                          Tekrarlayan
                        </span>
                        {gider.tekrarlamaSuresi && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                            {gider.tekrarlamaSuresi}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div>
                          <span>Tutar:</span>{' '}
                          <span className="font-medium">{formatCurrency(gider.toplamFiyat)}</span>
                        </div>
                        {gider.tedarikciFirma && (
                          <div>
                            <span>Tedarikçi:</span> {gider.tedarikciFirma}
                          </div>
                        )}
                        {gider.teslimTarihi && (
                          <div>
                            <span>Son Ödeme:</span>{' '}
                            <span className="font-medium">{formatDate(gider.teslimTarihi)}</span>
                          </div>
                        )}
                        {gider.sonrakiTekrarTarihi && (
                          <div>
                            <span>Sonraki:</span>{' '}
                            <span className="font-medium text-green-700">
                              {formatDate(gider.sonrakiTekrarTarihi)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/satin-alma/${gider.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 ml-4"
                    >
                      Detay →
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Kategorilere Göre Dağılım */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Kategorilere Göre Dağılım</h2>
        <div className="space-y-4">
          {kategoriListesi.map((kategori: any) => {
            const yuzde = (kategori.toplam / toplamGenelGider) * 100
            return (
              <div key={kategori.ad} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{kategori.ad}</h3>
                  <span className="text-lg font-bold text-purple-600">
                    {formatCurrency(kategori.toplam)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{kategori.sayi} kayıt</span>
                  <span>{yuzde.toFixed(1)}%</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${yuzde}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tüm Genel Giderler Listesi */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tüm Genel Giderler</h2>
        {genelGiderler.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ShoppingCart className="mx-auto mb-4 text-gray-400" size={48} />
            <p>Henüz genel gider kaydı bulunmuyor</p>
            <Link
              href="/satin-alma/olustur"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800"
            >
              İlk genel gideri ekle
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ürün/Hizmet
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tedarikçi
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Miktar
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Birim Fiyat
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Toplam
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Teslim Tarihi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tekrarlama
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {genelGiderler.map((gider) => (
                  <tr key={gider.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{gider.urunAdi}</div>
                      {gider.aciklama && (
                        <div className="text-xs text-gray-500 mt-1">{gider.aciklama}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {gider.tedarikciFirma || '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {gider.miktar} {gider.birim}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {formatCurrency(gider.birimFiyat)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(gider.toplamFiyat)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          gider.durum === 'Teslim Edildi'
                            ? 'bg-green-100 text-green-800'
                            : gider.durum === 'Sipariş Verildi'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {gider.durum}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {gider.teslimTarihi ? formatDate(gider.teslimTarihi) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {gider.tekrarlayanMi ? (
                        <div className="space-y-1">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded block w-fit">
                            {gider.tekrarlamaSuresi || 'Tekrarlayan'}
                          </span>
                          {gider.sonrakiTekrarTarihi && (
                            <p className="text-xs text-gray-500">
                              Sonraki: {formatDate(gider.sonrakiTekrarTarihi)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Tek seferlik</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/satin-alma/${gider.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Detay
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900">
                    Toplam:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    {formatCurrency(toplamGenelGider)}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

