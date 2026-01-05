import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  FileText,
  Factory,
  ShoppingCart,
  FileCheck,
  Calendar,
  Package,
  User,
  DollarSign,
  Settings,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const durumLabels: Record<number, string> = {
  1: 'Bekleyen',
  2: 'Onaylanan',
  3: 'Reddedilen',
  4: 'Tamamlanan',
}

const durumColors: Record<number, string> = {
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-green-100 text-green-800',
  3: 'bg-red-100 text-red-800',
  4: 'bg-blue-100 text-blue-800',
}

export default async function ProjeDetayPage({ params }: { params: { id: string } }) {
  const proje = await prisma.teklif.findUnique({
    where: { id: params.id },
    include: {
      firma: {
        include: {
          yetkiliKisiler: true,
        },
      },
      makina: {
        include: {
          makinaBilesenleri: true,
        },
      },
      user: true,
      teklifUrunler: true,
      sozlesme: true,
      uretimler: {
        include: {
          user: true,
          makinaAtamalar: {
            include: {
              makina: true,
            },
          },
          satinAlmalar: {
            where: {
              genelGider: false,
            },
            include: {
              uretimPlanlamaAdimi: true,
              teklifler: true,
            },
          },
        },
      },
      uretimPlanlamaAdimlari: {
        include: {
          kullanici: true,
          makina: true,
        },
        orderBy: {
          siraNo: 'asc',
        },
      },
    },
  })

  if (!proje) {
    notFound()
  }

  // Genel gider satın almaları da getir
  const genelGiderSatınAlmalar = await prisma.satinAlma.findMany({
    where: {
      genelGider: true,
    },
    include: {
      teklifler: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // İstatistikler
  const toplamSatınAlma = proje.uretimler.reduce(
    (sum, uretim) =>
      sum + uretim.satinAlmalar.reduce((s, sa) => s + sa.toplamFiyat, 0),
    0
  )

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/projeler"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={18} />
          Projelere Dön
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {proje.ad || 'İsimsiz Proje'}
            </h1>
            <p className="text-gray-600 mt-1">Proje Detayları ve Yönetimi</p>
          </div>
          <span
            className={`px-4 py-2 text-sm font-semibold rounded-full ${
              durumColors[proje.durum]
            }`}
          >
            {durumLabels[proje.durum]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Taraf - Ana Bilgiler */}
        <div className="lg:col-span-2 space-y-6">
          {/* Firma Bilgileri */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="text-blue-600" size={20} />
              <h2 className="text-xl font-semibold text-gray-900">Firma Bilgileri</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Firma Adı</label>
                <p className="text-gray-900 font-medium">{proje.firma?.ad || 'Firma Yok'}</p>
              </div>
              {proje.firma?.telefon && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Telefon</label>
                  <p className="text-gray-900">{proje.firma?.telefon || '-'}</p>
                </div>
              )}
              {proje.firma?.email && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <p className="text-gray-900">{proje.firma?.email || '-'}</p>
                </div>
              )}
              {proje.firma?.adres && (
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Adres</label>
                  <p className="text-gray-900">{proje.firma?.adres || '-'}</p>
                </div>
              )}
            </div>
            {proje.firma?.yetkiliKisiler && proje.firma.yetkiliKisiler.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Yetkili Kişiler</h3>
                <div className="space-y-2">
                  {proje.firma.yetkiliKisiler.map((yetkili) => (
                    <div key={yetkili.id} className="text-sm">
                      <span className="font-medium text-gray-900">{yetkili.adSoyad}</span>
                      {yetkili.pozisyon && (
                        <span className="text-gray-600"> - {yetkili.pozisyon}</span>
                      )}
                      {yetkili.telefon && (
                        <span className="text-gray-500 ml-2">({yetkili.telefon})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Teklif Bilgileri */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="text-green-600" size={20} />
                <h2 className="text-xl font-semibold text-gray-900">Teklif Bilgileri</h2>
              </div>
              <Link
                href={`/teklif/${proje.id}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Detayları Gör →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Toplam Fiyat</label>
                <p className="text-gray-900 font-semibold text-lg">
                  {formatCurrency(proje.toplamFiyat)}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Oluşturan</label>
                <p className="text-gray-900">{proje.user.adSoyad}</p>
              </div>
              {proje.teklifTarihi && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Teklif Tarihi</label>
                  <p className="text-gray-900">{formatDate(proje.teklifTarihi)}</p>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Oluşturulma</label>
                <p className="text-gray-900">{formatDate(proje.createdAt)}</p>
              </div>
            </div>
            {proje.aciklama && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Açıklama</label>
                <p className="text-gray-900">{proje.aciklama}</p>
              </div>
            )}
            {proje.teklifUrunler.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Ürünler</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Ürün
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Miktar
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Birim Fiyat
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Toplam
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {proje.teklifUrunler.map((urun) => (
                        <tr key={urun.id}>
                          <td className="px-3 py-2 text-gray-900">{urun.urunAdi}</td>
                          <td className="px-3 py-2 text-gray-500">{urun.miktar}</td>
                          <td className="px-3 py-2 text-gray-500">
                            {formatCurrency(urun.birimFiyat)}
                          </td>
                          <td className="px-3 py-2 font-medium text-gray-900">
                            {formatCurrency(urun.toplamFiyat)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Makina Bilgileri */}
          {proje.makina && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Factory className="text-purple-600" size={20} />
                  <h2 className="text-xl font-semibold text-gray-900">Makina Bilgileri</h2>
                </div>
                <Link
                  href={`/makina/${proje.makina.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Detayları Gör →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Makina Adı</label>
                  <p className="text-gray-900 font-medium">{proje.makina.ad}</p>
                </div>
                {proje.makina.model && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Model</label>
                    <p className="text-gray-900">{proje.makina.model}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Durum</label>
                  <p className="text-gray-900">{proje.makina.durum}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Toplam Maliyet</label>
                  <p className="text-gray-900 font-semibold">
                    {formatCurrency(proje.makina.toplamMaliyet)}
                  </p>
                </div>
              </div>
              {proje.makina.makinaBilesenleri.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Bileşenler</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                            Bileşen
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                            Miktar
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                            Birim Maliyet
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                            Toplam
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {proje.makina.makinaBilesenleri.map((bilesen) => (
                          <tr key={bilesen.id}>
                            <td className="px-3 py-2 text-gray-900">{bilesen.ad}</td>
                            <td className="px-3 py-2 text-gray-500">{bilesen.miktar}</td>
                            <td className="px-3 py-2 text-gray-500">
                              {bilesen.birimMaliyet.toFixed(2)} {bilesen.paraBirimi}
                            </td>
                            <td className="px-3 py-2 font-medium text-gray-900">
                              {bilesen.toplamMaliyet.toFixed(2)} EUR
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sözleşme Bilgileri */}
          {proje.sozlesme && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileCheck className="text-indigo-600" size={20} />
                  <h2 className="text-xl font-semibold text-gray-900">Sözleşme Bilgileri</h2>
                </div>
                <Link
                  href={`/sozlesme/${proje.sozlesme?.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Detayları Gör →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {proje.sozlesme?.dosyaUrl && (
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Sözleşme Dosyası</label>
                    <p className="text-gray-900">{proje.sozlesme?.dosyaUrl || '-'}</p>
                  </div>
                )}
                {proje.sozlesme?.notlar && (
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Notlar</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{proje.sozlesme?.notlar || '-'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Üretim Planlama Adımları */}
          {proje.uretimPlanlamaAdimlari.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="text-orange-600" size={20} />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Üretim Planlama Adımları ({proje.uretimPlanlamaAdimlari.length})
                  </h2>
                </div>
                <Link
                  href={`/uretim-planlama/olustur?teklifId=${proje.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Planlamayı Gör →
                </Link>
              </div>
              <div className="space-y-3">
                {proje.uretimPlanlamaAdimlari.map((adim) => (
                  <div
                    key={adim.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                            Adım {adim.siraNo}
                          </span>
                          <h3 className="font-semibold text-gray-900">{adim.adimAdi}</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          {adim.kullanici && (
                            <div>
                              <span className="text-gray-600">Sorumlu:</span>{' '}
                              <span className="font-medium">{adim.kullanici.adSoyad}</span>
                            </div>
                          )}
                          {adim.makina && (
                            <div>
                              <span className="text-gray-600">Makina:</span>{' '}
                              <span className="font-medium">{adim.makina.ad}</span>
                            </div>
                          )}
                          {adim.baslangicTarihi && (
                            <div>
                              <span className="text-gray-600">Başlangıç:</span>{' '}
                              <span className="font-medium">
                                {formatDate(adim.baslangicTarihi)}
                              </span>
                            </div>
                          )}
                          {adim.bitisTarihi && (
                            <div>
                              <span className="text-gray-600">Bitiş:</span>{' '}
                              <span className="font-medium">{formatDate(adim.bitisTarihi)}</span>
                            </div>
                          )}
                        </div>
                        {adim.aciklama && (
                          <p className="text-sm text-gray-600 mt-2">{adim.aciklama}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Üretimler */}
          {proje.uretimler.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Factory className="text-red-600" size={20} />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Üretimler ({proje.uretimler.length})
                  </h2>
                </div>
              </div>
              <div className="space-y-4">
                {proje.uretimler.map((uretim) => (
                  <div
                    key={uretim.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${
                              uretim.durum === 'Tamamlandı'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {uretim.durum}
                          </span>
                          <span className="text-sm text-gray-600">
                            Sorumlu: {uretim.user.adSoyad}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Başlangıç: {formatDate(uretim.baslangicTarihi)}
                          {uretim.bitisTarihi && ` • Bitiş: ${formatDate(uretim.bitisTarihi)}`}
                        </div>
                        {uretim.aciklama && (
                          <p className="text-sm text-gray-600 mt-2">{uretim.aciklama}</p>
                        )}
                      </div>
                      <Link
                        href={`/uretim/${uretim.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Detay →
                      </Link>
                    </div>
                    {uretim.makinaAtamalar.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">
                          Makina Atamaları
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {uretim.makinaAtamalar.map((atama) => (
                            <span
                              key={atama.id}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {atama.makina.ad}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {uretim.satinAlmalar.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">
                          Satın Almalar ({uretim.satinAlmalar.length})
                        </h4>
                        <div className="space-y-1">
                          {uretim.satinAlmalar.map((sa) => (
                            <div
                              key={sa.id}
                              className="flex items-center justify-between text-xs text-gray-600"
                            >
                              <span>{sa.urunAdi}</span>
                              <span className="font-medium">{formatCurrency(sa.toplamFiyat)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Satın Almalar */}
          {proje.uretimler.some((u) => u.satinAlmalar.length > 0) && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="text-teal-600" size={20} />
                  <h2 className="text-xl font-semibold text-gray-900">Satın Almalar</h2>
                </div>
                <Link
                  href={`/satin-alma/liste?teklifId=${proje.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Tümünü Gör →
                </Link>
              </div>
              <div className="space-y-3">
                {proje.uretimler.map((uretim) =>
                  uretim.satinAlmalar.map((sa) => (
                    <div
                      key={sa.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{sa.urunAdi}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                            <div>
                              <span>Miktar:</span> {sa.miktar} {sa.birim}
                            </div>
                            <div>
                              <span>Birim Fiyat:</span> {formatCurrency(sa.birimFiyat)}
                            </div>
                            <div>
                              <span>Toplam:</span>{' '}
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(sa.toplamFiyat)}
                              </span>
                            </div>
                            {sa.tedarikciFirma && (
                              <div>
                                <span>Tedarikçi:</span> {sa.tedarikciFirma}
                              </div>
                            )}
                          </div>
                          {sa.aciklama && (
                            <p className="text-sm text-gray-600 mt-2">{sa.aciklama}</p>
                          )}
                        </div>
                        <Link
                          href={`/satin-alma/${sa.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800 ml-4"
                        >
                          Detay →
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sağ Taraf - Özet ve İstatistikler */}
        <div className="space-y-6">
          {/* Özet Kart */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">Proje Özeti</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Teklif Tutarı</span>
                <span className="font-bold text-lg">{formatCurrency(proje.toplamFiyat)}</span>
              </div>
              {toplamSatınAlma > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Toplam Satın Alma</span>
                  <span className="font-bold text-lg">{formatCurrency(toplamSatınAlma)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-blue-400">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Üretim Sayısı</span>
                  <span className="font-bold">{proje.uretimler.length}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-blue-100">Planlama Adımları</span>
                  <span className="font-bold">{proje.uretimPlanlamaAdimlari.length}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-blue-100">Sözleşme</span>
                  <span className="font-bold">{proje.sozlesme ? 'Var' : 'Yok'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hızlı Erişim */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Erişim</h2>
            <div className="space-y-2">
              <Link
                href={`/teklif/${proje.id}`}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <FileText size={16} className="inline mr-2" />
                Teklif Detayları
              </Link>
              {proje.sozlesme && (
                <Link
                  href={`/sozlesme/${proje.sozlesme?.id}`}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <FileCheck size={16} className="inline mr-2" />
                  Sözleşme Detayları
                </Link>
              )}
              {proje.makina && (
                <Link
                  href={`/makina/${proje.makina.id}`}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Factory size={16} className="inline mr-2" />
                  Makina Detayları
                </Link>
              )}
              {proje.uretimPlanlamaAdimlari.length > 0 && (
                <Link
                  href={`/uretim-planlama/liste`}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Calendar size={16} className="inline mr-2" />
                  Üretim Planlaması
                </Link>
              )}
              <Link
                href={`/satin-alma/liste?teklifId=${proje.id}`}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <ShoppingCart size={16} className="inline mr-2" />
                Satın Almalar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}















