import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { History, ArrowLeft } from 'lucide-react'

export default async function DuzenlemeGecmisiPage({
  searchParams,
}: {
  searchParams: { tablo?: string; kayitId?: string }
}) {
  const where: any = {}
  if (searchParams.tablo) {
    where.tablo = searchParams.tablo
  }
  if (searchParams.kayitId) {
    where.kayitId = searchParams.kayitId
  }

  const gecmisler = await prisma.duzenlemeGecmisi.findMany({
    where,
    include: {
      kullanici: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100, // Son 100 kayıt
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href={
              searchParams.tablo === 'Firma'
                ? '/firma/liste'
                : searchParams.tablo === 'Teklif'
                ? '/teklif/liste'
                : searchParams.tablo === 'Makina'
                ? '/makina/liste'
                : '/'
            }
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Düzenleme Geçmişi</h1>
            {searchParams.tablo && (
              <p className="text-sm text-gray-600 mt-1">
                {searchParams.tablo} - {searchParams.kayitId ? `Kayıt: ${searchParams.kayitId}` : 'Tüm Kayıtlar'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {gecmisler.length === 0 ? (
          <div className="p-12 text-center">
            <History className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Henüz düzenleme geçmişi bulunmuyor</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tablo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kayıt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    İşlem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Açıklama
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gecmisler.map((gecmis) => (
                  <tr key={gecmis.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(gecmis.createdAt)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(gecmis.createdAt).toLocaleTimeString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {gecmis.tablo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {gecmis.kayitAdi || gecmis.kayitId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          gecmis.islem === 'Oluşturuldu'
                            ? 'bg-green-100 text-green-800'
                            : gecmis.islem === 'Silindi'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {gecmis.islem}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{gecmis.kullanici.adSoyad}</div>
                      <div className="text-xs text-gray-500">@{gecmis.kullanici.username}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{gecmis.aciklama}</div>
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

