import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Wrench } from 'lucide-react'

export default async function MakinaAtamaPage() {
  const makinalar = await prisma.makina.findMany({
    where: { durum: 'Aktif' },
    include: {
      makinaAtamalar: {
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
      },
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Makina Ataması</h1>
      </div>

      <div className="space-y-6">
        {makinalar.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Wrench className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Aktif makina bulunmuyor</p>
            <Link
              href="/makina/olustur"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700"
            >
              Makina ekle
            </Link>
          </div>
        ) : (
          makinalar.map((makina) => (
            <div key={makina.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{makina.ad}</h3>
                  {makina.model && (
                    <p className="text-sm text-gray-500">Model: {makina.model}</p>
                  )}
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {makina.durum}
                </span>
              </div>

              {makina.makinaAtamalar.length === 0 ? (
                <p className="text-gray-500 text-sm">Bu makineye atama yapılmamış</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Firma
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Başlangıç
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Bitiş
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {makina.makinaAtamalar.map((atama) => (
                        <tr key={atama.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {atama.uretim.teklif.firma.ad}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {new Date(atama.baslangicTarihi).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {atama.bitisTarihi
                              ? new Date(atama.bitisTarihi).toLocaleDateString('tr-TR')
                              : 'Devam ediyor'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}









