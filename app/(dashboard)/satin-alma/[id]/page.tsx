import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingCart,
  Package,
  Calendar,
  DollarSign,
  Building2,
  User,
  Wrench,
  ArrowLeft,
  Edit,
  CheckCircle,
  Clock,
  X,
  FileText,
  Plus,
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

const durumColors: Record<string, string> = {
  Planlandı: 'bg-blue-100 text-blue-800',
  'Sipariş Verildi': 'bg-yellow-100 text-yellow-800',
  'Teslim Edildi': 'bg-green-100 text-green-800',
  İptal: 'bg-red-100 text-red-800',
}

const durumIcons: Record<string, any> = {
  Planlandı: Clock,
  'Sipariş Verildi': Clock,
  'Teslim Edildi': CheckCircle,
  İptal: X,
}

export default async function SatinAlmaDetayPage({ params }: { params: { id: string } }) {
  let satinAlma: any = null

  try {
    satinAlma = await prisma.satinAlma.findUnique({
      where: { id: params.id },
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
        uretimPlanlamaAdimi: {
          include: {
            teklif: {
              include: {
                firma: true,
                user: true,
              },
            },
            kullanici: true,
            makina: true,
          },
        },
        teklifler: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  } catch (error: any) {
    console.error('Satın alma detay hatası:', error)
    if (error.message?.includes('satinAlma') || error.message?.includes('findUnique')) {
      return (
        <div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Prisma Client Güncellenmeli
            </h3>
            <p className="text-yellow-700 mb-4">
              Satın alma özelliği için Prisma client'ın güncellenmesi gerekiyor.
            </p>
            <div className="bg-white rounded p-4 font-mono text-sm space-y-2">
              <p className="text-gray-800">1. Development server'ı durdurun (Ctrl+C)</p>
              <p className="text-gray-800">2. Şu komutu çalıştırın:</p>
              <p className="text-blue-600 font-bold">npx prisma generate</p>
              <p className="text-gray-800">3. Development server'ı yeniden başlatın:</p>
              <p className="text-blue-600 font-bold">npm run dev</p>
            </div>
          </div>
        </div>
      )
    }
    throw error
  }

  if (!satinAlma) {
    notFound()
  }

  const adim = satinAlma.uretimPlanlamaAdimi
  const teklif = adim
    ? adim.teklif
    : satinAlma.uretim
      ? satinAlma.uretim.teklif
      : null

  // Aynı teklif için tüm üretim planlama adımlarını getir (eğer varsa)
  let tumAdimlar: any[] = []
  if (adim && teklif) {
    tumAdimlar = await prisma.uretimPlanlamaAdimi.findMany({
      where: { teklifId: teklif.id },
      include: {
        kullanici: true,
        makina: true,
        satinAlmalar: true,
      },
      orderBy: { siraNo: 'asc' },
    })
  }

  const DurumIcon = durumIcons[satinAlma.durum] || Clock

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/satin-alma/liste"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Satın Alma Detayı</h1>
            <p className="text-sm text-gray-500 mt-1">
              {satinAlma.urunAdi}
              {teklif && ` - ${teklif.ad || 'İsimsiz Teklif'}`}
              {satinAlma.genelGider && ' (Genel Gider)'}
            </p>
          </div>
        </div>
        <Link
          href={`/satin-alma/${params.id}/duzenle`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Edit size={18} />
          Düzenle
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Taraf - Satın Alma Bilgileri */}
        <div className="lg:col-span-2 space-y-6">
          {/* Satın Alma Bilgileri */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCart className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Satın Alma Bilgileri</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Ürün Adı</label>
                <p className="text-gray-900 font-medium">{satinAlma.urunAdi}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Durum</label>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-full ${
                    durumColors[satinAlma.durum] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <DurumIcon size={14} />
                  {satinAlma.durum}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Miktar</label>
                <p className="text-gray-900">
                  {satinAlma.miktar} {satinAlma.birim}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Birim Fiyat</label>
                <p className="text-gray-900">{formatCurrency(satinAlma.birimFiyat)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Toplam Fiyat</label>
                <p className="text-gray-900 font-bold text-lg text-green-600">
                  {formatCurrency(satinAlma.toplamFiyat)}
                </p>
              </div>
              {satinAlma.tedarikciFirma && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Tedarikçi Firma
                  </label>
                  <p className="text-gray-900">{satinAlma.tedarikciFirma}</p>
                </div>
              )}
              {satinAlma.tedarikciIletisim && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Tedarikçi İletişim
                  </label>
                  <p className="text-gray-900">{satinAlma.tedarikciIletisim}</p>
                </div>
              )}
              {satinAlma.siparisTarihi && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Sipariş Tarihi
                  </label>
                  <p className="text-gray-900">{formatDate(satinAlma.siparisTarihi)}</p>
                </div>
              )}
              {satinAlma.teslimTarihi && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Teslim Tarihi
                  </label>
                  <p className="text-gray-900">{formatDate(satinAlma.teslimTarihi)}</p>
                </div>
              )}
              {satinAlma.faturaNo && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Fatura No</label>
                  <p className="text-gray-900">{satinAlma.faturaNo}</p>
                </div>
              )}
              {satinAlma.aciklama && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Açıklama</label>
                  <p className="text-gray-900">{satinAlma.aciklama}</p>
                </div>
              )}
            </div>
          </div>

          {/* Alınan Teklifler */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText className="text-orange-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Alınan Teklifler</h2>
              </div>
              <Link
                href={`/satin-alma/${params.id}/teklif-ekle`}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus size={16} />
                Teklif Ekle
              </Link>
            </div>

            {satinAlma.teklifler && satinAlma.teklifler.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tedarikçi
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Teklif No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Birim Fiyat
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Toplam Fiyat
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Teslim Süresi
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Durum
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {satinAlma.teklifler.map((teklif: any) => {
                      const teklifDurumColors: Record<string, string> = {
                        Beklemede: 'bg-gray-100 text-gray-800',
                        Seçildi: 'bg-green-100 text-green-800',
                        Reddedildi: 'bg-red-100 text-red-800',
                      }
                      return (
                        <tr key={teklif.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {teklif.tedarikciAdi}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {teklif.teklifNo || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {formatCurrency(teklif.birimFiyat)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(teklif.toplamFiyat)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {teklif.teslimSuresi ? `${teklif.teslimSuresi} gün` : '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                teklifDurumColors[teklif.durum] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {teklif.durum}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/satin-alma/${params.id}/teklif/${teklif.id}`}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Detay
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-600">Henüz teklif eklenmemiş</p>
                <Link
                  href={`/satin-alma/${params.id}/teklif-ekle`}
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  İlk Teklifi Ekle
                </Link>
              </div>
            )}
          </div>

          {/* Üretim Planlama Adımları - Detaylı */}
          {adim ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Package className="text-purple-600" size={24} />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Üretim Planlama Adımları
                  </h2>
                </div>
                {teklif && (
                  <Link
                    href={`/uretim-planlama/olustur?teklifId=${teklif.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Planlamayı Görüntüle →
                  </Link>
                )}
              </div>

              <div className="space-y-4">
                {tumAdimlar.map((adimItem, index) => {
                  const isCurrentAdim = adimItem.id === adim.id
                const adimDurumColors: Record<string, string> = {
                  Planlandı: 'bg-blue-100 text-blue-800',
                  Başladı: 'bg-yellow-100 text-yellow-800',
                  Tamamlandı: 'bg-green-100 text-green-800',
                }

                return (
                  <div
                    key={adimItem.id}
                    className={`border-2 rounded-lg p-4 ${
                      isCurrentAdim
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                              isCurrentAdim
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-300 text-gray-700'
                            }`}
                          >
                            {adimItem.siraNo}
                          </div>
                          <h3 className="font-semibold text-gray-900">{adimItem.adimAdi}</h3>
                          {isCurrentAdim && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-200 text-blue-800 rounded">
                              Bu Adım
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                              <User size={14} />
                              <span className="text-xs">Sorumlu</span>
                            </div>
                            <p className="text-gray-900">
                              {adimItem.kullanici.adSoyad || adimItem.kullanici.username}
                            </p>
                          </div>
                          {adimItem.makina && (
                            <div>
                              <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <Wrench size={14} />
                                <span className="text-xs">Tezgah</span>
                              </div>
                              <p className="text-gray-900">
                                {adimItem.makina.ad}
                                {adimItem.makina.model && (
                                  <span className="text-gray-500"> ({adimItem.makina.model})</span>
                                )}
                              </p>
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                              <Calendar size={14} />
                              <span className="text-xs">Başlangıç</span>
                            </div>
                            <p className="text-gray-900">{formatDate(adimItem.baslangicTarihi)}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                              <Calendar size={14} />
                              <span className="text-xs">Bitiş</span>
                            </div>
                            <p className="text-gray-900">{formatDate(adimItem.bitisTarihi)}</p>
                          </div>
                        </div>

                        {adimItem.satinAlmalar && adimItem.satinAlmalar.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs font-medium text-gray-600 mb-2">
                              Bu Adım İçin Satın Almalar ({adimItem.satinAlmalar.length})
                            </p>
                            <div className="space-y-2">
                              {adimItem.satinAlmalar.map((sa: any) => (
                                <div
                                  key={sa.id}
                                  className={`flex items-center justify-between p-2 rounded text-xs ${
                                    sa.id === satinAlma.id
                                      ? 'bg-blue-100 border border-blue-300'
                                      : 'bg-white border border-gray-200'
                                  }`}
                                >
                                  <span className="text-gray-900">{sa.urunAdi}</span>
                                  <span className="text-gray-600">
                                    {sa.miktar} {sa.birim} - {formatCurrency(sa.toplamFiyat)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {adimItem.aciklama && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600">{adimItem.aciklama}</p>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            adimDurumColors[adimItem.durum] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {adimItem.durum}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          ) : null}
        </div>

        {/* Sağ Taraf - Teklif ve Firma Bilgileri */}
        {teklif ? (
          <div className="space-y-6">
            {/* Teklif Bilgileri */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Package className="text-green-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Teklif Bilgileri</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Teklif Adı</label>
                  <p className="text-gray-900">{teklif.ad || 'İsimsiz Teklif'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Toplam Fiyat</label>
                  <p className="text-gray-900 font-bold">{formatCurrency(teklif.toplamFiyat)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Oluşturan</label>
                  <p className="text-gray-900">{teklif.user.adSoyad || teklif.user.username}</p>
                </div>
                <Link
                  href={`/teklif/${teklif.id}`}
                  className="block mt-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  Teklif Detayına Git →
                </Link>
              </div>
            </div>

            {/* Firma Bilgileri */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="text-orange-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Firma Bilgileri</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Firma Adı</label>
                  <p className="text-gray-900">{teklif.firma.ad}</p>
                </div>
                {teklif.firma.telefon && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Telefon</label>
                    <p className="text-gray-900">{teklif.firma.telefon}</p>
                  </div>
                )}
                {teklif.firma.email && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                    <p className="text-gray-900">{teklif.firma.email}</p>
                  </div>
                )}
                {teklif.firma.adres && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Adres</label>
                    <p className="text-gray-900 text-sm">{teklif.firma.adres}</p>
                  </div>
                )}
                <Link
                  href={`/firma/${teklif.firma.id}`}
                  className="block mt-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  Firma Detayına Git →
                </Link>
              </div>
            </div>

            {/* Özet */}
            {tumAdimlar.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Özet</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam Adım:</span>
                    <span className="font-medium text-gray-900">{tumAdimlar.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tamamlanan:</span>
                    <span className="font-medium text-green-600">
                      {tumAdimlar.filter((a) => a.durum === 'Tamamlandı').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Devam Eden:</span>
                    <span className="font-medium text-yellow-600">
                      {tumAdimlar.filter((a) => a.durum === 'Başladı').length}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="text-gray-700 font-medium">Toplam İş Maliyeti:</span>
                    <span className="font-bold text-blue-700">
                      {formatCurrency(
                        tumAdimlar.reduce((sum, a) => sum + (a.isMaliyeti || 0), 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="text-purple-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Genel Gider</h3>
            </div>
            <p className="text-sm text-gray-600">
              Bu satın alma genel gider olarak kaydedilmiştir ve herhangi bir projeye bağlı değildir.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

