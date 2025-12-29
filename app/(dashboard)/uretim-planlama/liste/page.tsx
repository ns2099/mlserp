import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Calendar, Plus, Eye, User, Wrench, DollarSign } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

const durumColors: Record<string, string> = {
  Planlandı: 'bg-blue-100 text-blue-800',
  Başladı: 'bg-yellow-100 text-yellow-800',
  Tamamlandı: 'bg-green-100 text-green-800',
}

export default async function UretimPlanlamaListePage() {
  let planlamaAdimlari: any[] = []
  
  try {
    // Sadece onaylanan tekliflerin planlama adımlarını getir
    planlamaAdimlari = await prisma.uretimPlanlamaAdimi.findMany({
    where: {
      teklif: {
        durum: 2, // Sadece onaylanan teklifler
      },
    },
    include: {
      teklif: {
        include: {
          firma: true,
        },
      },
      kullanici: true,
      makina: true,
    },
    orderBy: [
      { teklif: { createdAt: 'desc' } },
      { siraNo: 'asc' },
    ],
    })
  } catch (error: any) {
    console.error('Üretim planlama adımları yüklenirken hata:', error)
    // Prisma client güncellenmemiş olabilir
    if (error.message?.includes('uretimPlanlamaAdimi') || error.message?.includes('findMany') || error.message?.includes('Cannot read properties')) {
      return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Üretim Planlama Listesi</h1>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Prisma Client Güncellenmeli
            </h3>
            <p className="text-yellow-700 mb-4">
              Üretim planlama özelliği için Prisma client'ın güncellenmesi gerekiyor.
            </p>
            <div className="bg-white rounded p-4 font-mono text-sm space-y-2">
              <p className="text-gray-800">1. Development server'ı durdurun (Ctrl+C)</p>
              <p className="text-gray-800">2. Şu komutu çalıştırın:</p>
              <p className="text-blue-600 font-bold">npx prisma generate</p>
              <p className="text-gray-800">3. Development server'ı yeniden başlatın:</p>
              <p className="text-blue-600 font-bold">npm run dev</p>
            </div>
          </div>
        </div>
      )
    }
    throw error
  }

  // Tekliflere göre grupla
  const teklifGruplari = planlamaAdimlari.reduce((acc: any, adim: any) => {
    const teklifId = adim.teklifId
    if (!acc[teklifId]) {
      acc[teklifId] = {
        teklif: adim.teklif,
        adimlar: [],
        toplamMaliyet: 0,
      }
    }
    acc[teklifId].adimlar.push(adim)
    acc[teklifId].toplamMaliyet += adim.isMaliyeti || 0
    return acc
  }, {})

  const gruplar = Object.values(teklifGruplari)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Üretim Planlama Listesi</h1>
        <Link
          href="/uretim-planlama/olustur"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Yeni Planlama
        </Link>
      </div>

      {gruplar.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">Henüz üretim planlama bulunmuyor</p>
          <p className="text-sm text-gray-500 mt-2">
            Onaylanan teklifler için üretim planlama oluşturabilirsiniz
          </p>
          <Link
            href="/uretim-planlama/olustur"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Planlama Oluştur
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {gruplar.map((grup: any) => (
            <div key={grup.teklif.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {grup.teklif.ad || 'İsimsiz Teklif'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {grup.teklif.firma.ad} • {grup.adimlar.length} Adım
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Toplam Maliyet</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(grup.toplamMaliyet)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Sıra
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Adım Adı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Sorumlu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tezgah
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Başlangıç
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Bitiş
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Maliyet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Durum
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {grup.adimlar.map((adim: any) => (
                      <tr key={adim.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{adim.siraNo}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{adim.adimAdi}</div>
                          {adim.aciklama && (
                            <div className="text-xs text-gray-500 mt-1">{adim.aciklama}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <div className="text-sm text-gray-900">
                              {adim.kullanici.adSoyad || adim.kullanici.username}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {adim.makina ? (
                            <div className="flex items-center gap-2">
                              <Wrench size={16} className="text-gray-400" />
                              <div className="text-sm text-gray-900">
                                {adim.makina.ad}
                                {adim.makina.model && (
                                  <span className="text-gray-500"> ({adim.makina.model})</span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(adim.baslangicTarihi)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(adim.bitisTarihi)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(adim.isMaliyeti)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              durumColors[adim.durum] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {adim.durum}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-end gap-4">
                  <Link
                    href={`/uretim-planlama/olustur?teklifId=${grup.teklif.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Planlamayı Düzenle
                  </Link>
                  <Link
                    href={`/teklif/${grup.teklif.id}`}
                    className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <Eye size={16} />
                    Teklif Detayı
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

