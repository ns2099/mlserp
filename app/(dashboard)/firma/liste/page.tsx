import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Building2, Edit, Trash2, History } from 'lucide-react'
import FirmaSilButton from './FirmaSilButton'
import FirmaExcelExport from './FirmaExcelExport'

export default async function FirmaListePage() {
  const firmalar = await prisma.firma.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Firmalar</h1>
        <div className="flex items-center gap-3">
          <FirmaExcelExport firmalar={firmalar} />
          <Link
            href="/duzenleme-gecmisi?tablo=Firma"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <History size={20} />
            Düzenleme Geçmişi
          </Link>
          <Link
            href="/firma/olustur"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Yeni Firma
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {firmalar.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Henüz firma eklenmemiş</p>
            <Link
              href="/firma/olustur"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700"
            >
              İlk firmayı ekle
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Firma Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-posta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oluşturulma Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {firmalar.map((firma) => (
                  <tr key={firma.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{firma.ad}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{firma.telefon || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{firma.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(firma.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/firma/${firma.id}`}
                          className="inline-flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                          Düzenle
                        </Link>
                        <FirmaSilButton firmaId={firma.id} firmaAdi={firma.ad} />
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

