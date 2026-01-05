import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ShoppingCart, Plus, Eye, Package, Calendar, DollarSign, Building2 } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

const durumColors: Record<string, string> = {
  Planlandı: 'bg-blue-100 text-blue-800',
  'Sipariş Verildi': 'bg-yellow-100 text-yellow-800',
  'Teslim Edildi': 'bg-green-100 text-green-800',
  İptal: 'bg-red-100 text-red-800',
}

export const dynamic = 'force-dynamic'

export default async function SatinAlmaListePage({
  searchParams,
}: {
  searchParams?: { teklifId?: string }
}) {
  // Tüm satın almaları getir (genel giderler dahil)
  let satinAlmalar: any[] = []
  
  try {
    const where: any = {
      OR: [
        // Üretim planlama adımına bağlı olanlar (onaylanan teklifler)
        {
          uretimPlanlamaAdimi: {
            teklif: {
              durum: 2, // Sadece onaylanan teklifler
            },
          },
        },
        // Genel giderler
        {
          genelGider: true,
        },
      ],
    }

    // Eğer teklifId parametresi varsa filtrele (sadece üretim planlama adımına bağlı olanlar için)
    if (searchParams?.teklifId) {
      where.OR = [
        {
          uretimPlanlamaAdimi: {
            teklif: {
              durum: 2,
              id: searchParams.teklifId,
            },
          },
        },
      ]
    }

    satinAlmalar = await prisma.satinAlma.findMany({
      where,
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
              },
            },
            kullanici: true,
            makina: true,
          },
        },
        teklifler: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error: any) {
    console.error('Satın alma listesi hatası:', error)
    // Prisma client güncellenmemiş olabilir
    if (error.message?.includes('satinAlma') || error.message?.includes('findMany')) {
      return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Satın Alma Listesi</h1>
          </div>
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

  // Genel giderleri ve üretimlere bağlı olanları ayır
  const genelGiderler = satinAlmalar.filter((s: any) => s.genelGider)
  const uretimeBagliOlanlar = satinAlmalar.filter((s: any) => !s.genelGider)

  // Üretimlere göre grupla
  const uretimGruplari = uretimeBagliOlanlar.reduce((acc: any, satinAlma: any) => {
    const uretimId = satinAlma.uretimId
    if (!uretimId) return acc
    
    if (!acc[uretimId]) {
      acc[uretimId] = {
        uretim: satinAlma.uretim,
        teklif: satinAlma.uretimPlanlamaAdimi?.teklif || null,
        satinAlmalar: [],
        toplamTutar: 0,
      }
    }
    acc[uretimId].satinAlmalar.push(satinAlma)
    acc[uretimId].toplamTutar += satinAlma.toplamFiyat || 0
    return acc
  }, {})

  const gruplar = Object.values(uretimGruplari)
  const genelGiderToplam = genelGiderler.reduce((sum: number, s: any) => sum + (s.toplamFiyat || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Satın Alma Listesi</h1>
        <Link
          href="/satin-alma/olustur"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Yeni Satın Alma
        </Link>
      </div>

      {gruplar.length === 0 && genelGiderler.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">Henüz satın alma kaydı bulunmuyor</p>
          <p className="text-sm text-gray-500 mt-2">
            Üretim planlama adımları için veya genel gider olarak satın alma kaydı oluşturabilirsiniz
          </p>
          <Link
            href="/satin-alma/olustur"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Satın Alma Oluştur
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Genel Giderler Bölümü */}
          {genelGiderler.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-purple-50 px-6 py-4 border-b border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="text-purple-600" size={20} />
                      Genel Giderler
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {genelGiderler.length} Genel Gider Satın Alma
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Toplam Tutar</p>
                    <p className="text-lg font-bold text-purple-600">
                      {formatCurrency(genelGiderToplam)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ürün Adı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Miktar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Birim Fiyat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Toplam
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tedarikçi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {genelGiderler.map((satinAlma: any) => (
                      <tr key={satinAlma.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {satinAlma.urunAdi}
                          </div>
                          {satinAlma.aciklama && (
                            <div className="text-xs text-gray-500 mt-1">{satinAlma.aciklama}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {satinAlma.miktar} {satinAlma.birim}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatCurrency(satinAlma.birimFiyat)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(satinAlma.toplamFiyat)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {satinAlma.tedarikciFirma ? (
                            <div className="text-sm text-gray-900">
                              {satinAlma.tedarikciFirma}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              durumColors[satinAlma.durum] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {satinAlma.durum}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/satin-alma/${satinAlma.id}`}
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Eye size={16} />
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

          {/* Üretimlere Bağlı Satın Almalar */}
          {gruplar.map((grup: any) => (
            <div key={grup.uretim.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {grup.teklif.ad || 'İsimsiz Teklif'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {grup.teklif.firma?.ad || 'Firma Yok'} • {grup.satinAlmalar.length} Satın Alma • Üretim Durumu: {grup.uretim.durum}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Toplam Tutar</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(grup.toplamTutar)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ürün Adı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Üretim Adımı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Miktar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Birim Fiyat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Toplam
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tedarikçi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {grup.satinAlmalar.map((satinAlma: any) => (
                      <tr key={satinAlma.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {satinAlma.urunAdi}
                          </div>
                          {satinAlma.aciklama && (
                            <div className="text-xs text-gray-500 mt-1">{satinAlma.aciklama}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {satinAlma.genelGider ? (
                            <span className="text-sm text-purple-600 font-medium">Genel Gider</span>
                          ) : satinAlma.uretimPlanlamaAdimi ? (
                            <>
                              <div className="text-sm text-gray-900">
                                {satinAlma.uretimPlanlamaAdimi.adimAdi}
                              </div>
                              <div className="text-xs text-gray-500">
                                Sıra: {satinAlma.uretimPlanlamaAdimi.siraNo}
                              </div>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500 italic">Bağımsız</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {satinAlma.miktar} {satinAlma.birim}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatCurrency(satinAlma.birimFiyat)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(satinAlma.toplamFiyat)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {satinAlma.tedarikciFirma ? (
                            <div className="text-sm text-gray-900">
                              {satinAlma.tedarikciFirma}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              durumColors[satinAlma.durum] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {satinAlma.durum}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/satin-alma/${satinAlma.id}`}
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Eye size={16} />
                            Detay
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-end gap-4">
                  <Link
                    href={`/uretim/${grup.uretim.id}`}
                    className="text-sm text-purple-600 hover:text-purple-800"
                  >
                    Üretim Detayı
                  </Link>
                  <Link
                    href={`/uretim-planlama/olustur?teklifId=${grup.teklif.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Üretim Planlaması
                  </Link>
                  <Link
                    href={`/teklif/${grup.teklif.id}`}
                    className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <Eye size={16} />
                    Teklif Detayı
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

