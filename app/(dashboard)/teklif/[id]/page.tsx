import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Edit } from 'lucide-react'
import MakinaExcelExport from './MakinaExcelExport'
import SozlesmeBölümü from './SozlesmeBölümü'

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

export default async function TeklifDetayPage({ params }: { params: { id: string } }) {
  const teklif = await prisma.teklif.findUnique({
    where: { id: params.id },
    include: {
      firma: true,
      user: true,
      teklifUrunler: true,
      sozlesme: true,
      makina: {
        include: {
          makinaBilesenleri: true,
        },
      },
    },
  })

  if (!teklif) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teklif Detayı</h1>
        <Link
          href={`/teklif/${params.id}/duzenle`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Edit size={18} />
          Düzenle
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sol taraf - Teklif Detayları */}
        <div>
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Teklif Adı</label>
            <p className="text-gray-900 font-medium">{teklif.ad || '-'}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Firma</label>
            <p className="text-gray-900 font-medium">{teklif.firma.ad}</p>
          </div>
          {teklif.makina && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Makina</label>
              <p className="text-gray-900 font-medium">{teklif.makina.ad}</p>
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Durum</label>
            <span
              className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                durumColors[teklif.durum]
              }`}
            >
              {durumLabels[teklif.durum]}
            </span>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Oluşturan</label>
            <p className="text-gray-900">{teklif.user.adSoyad}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tarih</label>
            <p className="text-gray-900">{formatDate(teklif.createdAt)}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Açıklama</label>
            <p className="text-gray-900">{teklif.aciklama || '-'}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ürünler</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Ürün Adı
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Miktar
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Birim Fiyat
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Toplam
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teklif.teklifUrunler.map((urun) => (
                  <tr key={urun.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{urun.urunAdi}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{urun.miktar}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {formatCurrency(urun.birimFiyat)}
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">
                      {formatCurrency(urun.toplamFiyat)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-sm font-semibold text-gray-900">
                    Toplam
                  </td>
                  <td className="px-4 py-2 text-sm font-bold text-gray-900">
                    {formatCurrency(teklif.toplamFiyat)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {teklif.makina && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Makina Bilgileri</h3>
              <MakinaExcelExport makina={teklif.makina} />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Makina Adı</label>
                  <p className="text-gray-900 font-medium">{teklif.makina.ad}</p>
                </div>
                {teklif.makina.model && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Model</label>
                    <p className="text-gray-900">{teklif.makina.model}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Durum</label>
                  <p className="text-gray-900">{teklif.makina.durum}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Toplam Maliyet</label>
                  <p className="text-gray-900 font-semibold">{formatCurrency(teklif.makina.toplamMaliyet)}</p>
                </div>
              </div>
              {teklif.makina.aciklama && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Açıklama</label>
                  <p className="text-gray-900">{teklif.makina.aciklama}</p>
                </div>
              )}
              {teklif.makina.makinaBilesenleri && teklif.makina.makinaBilesenleri.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Bileşenler</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Bileşen</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Miktar</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Birim Maliyet</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Toplam</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {teklif.makina.makinaBilesenleri.map((bilesen) => (
                          <tr key={bilesen.id}>
                            <td className="px-3 py-2 text-gray-900">{bilesen.ad}</td>
                            <td className="px-3 py-2 text-gray-500">{bilesen.miktar}</td>
                            <td className="px-3 py-2 text-gray-500">
                              {bilesen.birimMaliyet.toFixed(2)} {bilesen.paraBirimi}
                            </td>
                            <td className="px-3 py-2 text-gray-900 font-medium">
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
          </div>
        )}
          </div>
        </div>

        {/* Sağ taraf - Sözleşme */}
        <div className="space-y-6">
          <SozlesmeBölümü teklifId={teklif.id} />
        </div>
      </div>
    </div>
  )
}

