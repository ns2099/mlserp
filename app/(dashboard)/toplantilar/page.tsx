import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Calendar, Building2, User, Plus, Edit, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function ToplantilarPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const toplantilar = await prisma.toplanti.findMany({
    include: {
      firma: true,
      yetkiliKisi: true,
      user: {
        select: {
          id: true,
          username: true,
          adSoyad: true,
        },
      },
    },
    orderBy: { toplantiTarihi: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Toplantılarım</h1>
          <p className="text-gray-600 mt-1">Tüm toplantılarınızı görüntüleyin ve yönetin</p>
        </div>
        <Link
          href="/toplantilar/olustur"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Yeni Toplantı</span>
        </Link>
      </div>

      {toplantilar.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz toplantı yok</h3>
          <p className="text-gray-600 mb-6">İlk toplantınızı oluşturmak için yukarıdaki butona tıklayın.</p>
          <Link
            href="/toplantilar/olustur"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Toplantı Oluştur</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {toplantilar.map((toplanti: any) => (
            <div
              key={toplanti.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={20} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {toplanti.konu || 'Toplantı'}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    {formatDate(toplanti.toplantiTarihi)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/toplantilar/${toplanti.id}`}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </Link>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 size={16} />
                  <span className="font-medium">Firma:</span>
                  <span>{toplanti.firma?.ad || 'Firma Yok'}</span>
                </div>

                {toplanti.yetkiliKisi && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={16} />
                    <span className="font-medium">Yetkili:</span>
                    <span>{toplanti.yetkiliKisi.adSoyad}</span>
                  </div>
                )}

                {toplanti.notlar && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 line-clamp-3">{toplanti.notlar}</p>
                  </div>
                )}
              </div>

              <Link
                href={`/toplantilar/${toplanti.id}`}
                className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Detayları Gör
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

