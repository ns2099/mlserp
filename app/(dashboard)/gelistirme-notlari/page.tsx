import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { StickyNote, Plus, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import GelistirmeNotuSilButton from './GelistirmeNotuSilButton'

export const dynamic = 'force-dynamic'

export default async function GelistirmeNotlariPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  let notlar: any[] = []
  try {
    notlar = await prisma.gelistirmeNotu.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            adSoyad: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error: any) {
    console.error('Geliştirme notları yüklenirken hata:', error)
    if (
      error.code === 'P2021' ||
      error.message?.includes('does not exist') ||
      error.message?.includes('no such table') ||
      error.message?.includes('The table')
    ) {
      console.log('GelistirmeNotu tablosu henüz oluşturulmamış, boş liste döndürülüyor')
      notlar = []
    } else {
      throw error
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Geliştirme Notları</h1>
          <p className="text-gray-600 mt-1">Geliştirme sürecindeki notlarınızı görüntüleyin ve yönetin</p>
        </div>
        <Link
          href="/gelistirme-notlari/olustur"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Yeni Not</span>
        </Link>
      </div>

      {notlar.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <StickyNote size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz not yok</h3>
          <p className="text-gray-600 mb-6">İlk notunuzu oluşturmak için yukarıdaki butona tıklayın.</p>
          <Link
            href="/gelistirme-notlari/olustur"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Not Oluştur</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notlar.map((not: any) => (
            <div
              key={not.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StickyNote size={20} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{not.baslik}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    {formatDate(not.createdAt)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {not.user?.adSoyad || not.user?.username || 'Bilinmeyen'}
                  </p>
                </div>
                <GelistirmeNotuSilButton notId={not.id} />
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{not.icerik}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
