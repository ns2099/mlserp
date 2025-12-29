import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Users, Edit } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import KullaniciSilButton from './KullaniciSilButton'
import KullaniciExcelExport from './KullaniciExcelExport'

export default async function KullaniciListePage() {
  const kullanicilar = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      adSoyad: true,
      yetki: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kullanıcılar</h1>
        <div className="flex items-center gap-3">
          <KullaniciExcelExport kullanicilar={kullanicilar} />
          <Link
            href="/kullanici/olustur"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Yeni Kullanıcı
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {kullanicilar.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Henüz kullanıcı bulunmuyor</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kullanıcı Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ad Soyad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Yetki
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Oluşturulma Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kullanicilar.map((kullanici) => (
                  <tr key={kullanici.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {kullanici.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{kullanici.adSoyad}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          kullanici.yetki === 'Yönetici'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {kullanici.yetki}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(kullanici.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/kullanici/${kullanici.id}`}
                          className="inline-flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                          Düzenle
                        </Link>
                        <KullaniciSilButton
                          kullaniciId={kullanici.id}
                          kullaniciAdi={kullanici.username}
                        />
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

