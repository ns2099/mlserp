import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FolderKanban, Building2, FileText, Factory, ShoppingCart, FileCheck, Calendar } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const durumLabels: Record<number, string> = {
  1: 'Bekleyen',
  2: 'Onaylanan',
  3: 'Reddedilen',
  4: 'Tamamlanan',
}

const durumColors: Record<number, string> = {
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-green-100 text-green-800',
  3: 'bg-red-100 text-red-800',
  4: 'bg-blue-100 text-blue-800',
}

export default async function ProjelerPage() {
  // Tüm teklifleri proje olarak getir (her teklif bir proje)
  const projeler = await prisma.teklif.findMany({
    include: {
      firma: true,
      makina: true,
      sozlesme: true,
      uretimler: {
        include: {
          satinAlmalar: {
            where: {
              genelGider: false, // Sadece üretime bağlı satın almalar
            },
          },
        },
      },
      uretimPlanlamaAdimlari: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Her proje için istatistikleri hesapla
  const projelerWithStats = projeler.map((proje) => {
    const toplamSatınAlma = proje.uretimler.reduce(
      (sum, uretim) =>
        sum + uretim.satinAlmalar.reduce((s, sa) => s + sa.toplamFiyat, 0),
      0
    )

    return {
      ...proje,
      stats: {
        uretimSayisi: proje.uretimler.length,
        planlamaAdimSayisi: proje.uretimPlanlamaAdimlari.length,
        toplamSatınAlma,
        sozlesmeVar: !!proje.sozlesme,
      },
    }
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projeler</h1>
          <p className="text-sm text-gray-600 mt-1">
            Tüm projeleri tek bir yerden görüntüleyin ve yönetin
          </p>
        </div>
      </div>

      {projelerWithStats.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FolderKanban className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">Henüz proje bulunmuyor</p>
          <p className="text-sm text-gray-500 mt-2">
            İlk projeyi oluşturmak için bir teklif oluşturun
          </p>
          <Link
            href="/teklif/olustur"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Teklif Oluştur
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projelerWithStats.map((proje) => (
            <Link
              key={proje.id}
              href={`/projeler/${proje.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {proje.ad || 'İsimsiz Proje'}
                  </h3>
                  <p className="text-sm text-gray-600">{proje.firma.ad}</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    durumColors[proje.durum]
                  }`}
                >
                  {durumLabels[proje.durum]}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText size={16} />
                  <span className="font-medium">Teklif:</span>
                  <span>{formatCurrency(proje.toplamFiyat)}</span>
                </div>

                {proje.makina && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Factory size={16} />
                    <span className="font-medium">Makina:</span>
                    <span>{proje.makina.ad}</span>
                  </div>
                )}

                {proje.stats.sozlesmeVar && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileCheck size={16} />
                    <span className="font-medium">Sözleşme Mevcut</span>
                  </div>
                )}

                {proje.stats.uretimSayisi > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Factory size={16} />
                    <span className="font-medium">Üretim:</span>
                    <span>{proje.stats.uretimSayisi} adet</span>
                  </div>
                )}

                {proje.stats.planlamaAdimSayisi > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span className="font-medium">Planlama Adımları:</span>
                    <span>{proje.stats.planlamaAdimSayisi} adet</span>
                  </div>
                )}

                {proje.stats.toplamSatınAlma > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ShoppingCart size={16} />
                    <span className="font-medium">Satın Alma:</span>
                    <span>{formatCurrency(proje.stats.toplamSatınAlma)}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Oluşturulma: {formatDate(proje.createdAt)}</span>
                  {proje.teklifTarihi && (
                    <span>Teklif: {formatDate(proje.teklifTarihi)}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}















