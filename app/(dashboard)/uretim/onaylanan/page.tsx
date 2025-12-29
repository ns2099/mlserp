import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { CheckCircle2, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function OnaylananUrunlerPage() {
  const uretimler = await prisma.uretim.findMany({
    where: { durum: 'Onaylandı' },
    include: {
      teklif: {
        include: {
          firma: true,
        },
      },
      user: true,
    },
    orderBy: { bitisTarihi: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Onaylanan Ürünler</h1>
        <Link
          href="/uretim/olustur"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Yeni Üretim Ekle
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {uretimler.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Onaylanan ürün bulunmuyor</p>
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
                    Başlangıç
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bitiş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sorumlu
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uretimler.map((uretim) => (
                  <tr key={uretim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {uretim.teklif.firma.ad}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(uretim.baslangicTarihi)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {uretim.bitisTarihi ? formatDate(uretim.bitisTarihi) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{uretim.user.adSoyad}</div>
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

