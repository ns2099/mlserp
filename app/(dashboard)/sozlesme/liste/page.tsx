import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FileText, Download, Eye, Plus } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function SozlesmeListePage() {
  // Sadece onaylanan tekliflerin (durum=2) sözleşmelerini getir
  const sozlesmeler = await prisma.sozlesme.findMany({
    where: {
      teklif: {
        durum: 2, // Sadece onaylanan teklifler
      },
    },
    include: {
      teklif: {
        include: {
          firma: true,
          user: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sözleşmeler</h1>
        <Link
          href="/sozlesme/olustur"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Yeni Sözleşme
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {sozlesmeler.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Henüz sözleşme bulunmuyor</p>
            <p className="text-sm text-gray-500 mt-2">
              Onaylanan teklifler için sözleşme oluşturabilirsiniz
            </p>
            <Link
              href="/sozlesme/olustur"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sözleşme Oluştur
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Teklif Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Firma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Oluşturan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dosya
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Notlar
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
                {sozlesmeler.map((sozlesme) => (
                  <tr key={sozlesme.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {sozlesme.teklif.ad || 'İsimsiz Teklif'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sozlesme.teklif.firma?.ad || 'Firma Yok'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {sozlesme.teklif.user.adSoyad}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sozlesme.dosyaUrl ? (
                        <div className="flex items-center gap-2">
                          <FileText className="text-green-500" size={18} />
                          <span className="text-xs text-gray-500">Dosya mevcut</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Dosya yok</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {sozlesme.notlar || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(sozlesme.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/teklif/${sozlesme.teklifId}`}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          title="Teklif Detayı"
                        >
                          <Eye size={18} />
                        </Link>
                        {sozlesme.dosyaUrl && (
                          <a
                            href={sozlesme.dosyaUrl}
                            download
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                            title="Dosyayı İndir"
                          >
                            <Download size={18} />
                          </a>
                        )}
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

