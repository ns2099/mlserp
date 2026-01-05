import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Calendar, User, FileText, Edit } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const turColors: Record<string, string> = {
  Gelen: 'bg-green-100 text-green-800',
  Giden: 'bg-red-100 text-red-800',
}

export default async function OdemeDetayPage({ params }: { params: { id: string } }) {
  const odeme = await prisma.odeme.findUnique({
    where: { id: params.id },
    include: {
      teklif: {
        include: {
          firma: true,
        },
      },
      user: true,
    },
  })

  if (!odeme) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/odeme/liste"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={18} />
          Ödeme Listesine Dön
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Ödeme Detayı</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  turColors[odeme.tur] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {odeme.tur}
              </span>
            </div>
            <Link
              href={`/odeme/${odeme.id}/duzenle`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit size={18} />
              Düzenle
            </Link>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tutar</label>
              <p className={`text-2xl font-bold ${odeme.tur === 'Giden' ? 'text-red-600' : 'text-green-600'}`}>
                {odeme.tur === 'Giden' ? '-' : '+'}
                {formatCurrency(odeme.tutar)} {odeme.paraBirimi}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={16} className="inline mr-1" />
                Ödeme Tarihi
              </label>
              <p className="text-gray-900">{formatDate(odeme.odemeTarihi)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Yöntemi</label>
              <p className="text-gray-900">{odeme.odemeYontemi}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User size={16} className="inline mr-1" />
                Kullanıcı
              </label>
              <p className="text-gray-900">{odeme.user.adSoyad || odeme.user.username}</p>
            </div>

            {odeme.teklif && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FileText size={16} className="inline mr-1" />
                  İlişkili Teklif
                </label>
                <Link
                  href={`/teklif/${odeme.teklif.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {odeme.teklif.ad || 'İsimsiz Teklif'} - {odeme.teklif.firma?.ad || 'Firma Yok'}
                </Link>
              </div>
            )}

            {odeme.aciklama && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <p className="text-gray-900 whitespace-pre-wrap">{odeme.aciklama}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
