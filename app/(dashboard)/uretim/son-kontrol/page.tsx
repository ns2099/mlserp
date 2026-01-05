import { prisma } from '@/lib/prisma'
import { CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function SonKontrolPage() {
  const uretimler = await prisma.uretim.findMany({
    where: { durum: 'Son Kontrol' },
    include: {
      teklif: {
        include: {
          firma: true,
        },
      },
      user: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Son Kontrol</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {uretimler.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Son kontrol aşamasında ürün bulunmuyor</p>
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
                    Başlangıç Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sorumlu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uretimler.map((uretim) => (
                  <tr key={uretim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {uretim.teklif.firma?.ad || 'Firma Yok'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(uretim.baslangicTarihi)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{uretim.user.adSoyad}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {uretim.durum}
                      </span>
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









