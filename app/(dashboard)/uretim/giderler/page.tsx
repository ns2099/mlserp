import { prisma } from '@/lib/prisma'
import { DollarSign } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function UrunGiderleriPage() {
  const giderler = await prisma.urunGideri.findMany({
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
    orderBy: { createdAt: 'desc' },
  })

  const toplamGider = giderler.reduce((sum, g) => sum + g.tutar, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ürün Giderleri</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600">Toplam Gider</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(toplamGider)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {giderler.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Henüz gider kaydı bulunmuyor</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Firma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Gider Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tarih
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {giderler.map((gider) => (
                  <tr key={gider.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {gider.uretim.teklif.firma?.ad || 'Firma Yok'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{gider.giderAdi}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(gider.tutar)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(gider.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}









