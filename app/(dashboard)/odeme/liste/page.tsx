import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import OdemeListeWrapper from './OdemeListeWrapper'

export default async function OdemeListePage() {
  const odemeler = await prisma.odeme.findMany({
    include: {
      teklif: {
        include: {
          firma: true,
        },
      },
      user: true,
    },
    orderBy: { odemeTarihi: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ödemeler</h1>
        <Link
          href="/odeme/olustur"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Yeni Ödeme
        </Link>
      </div>

      <OdemeListeWrapper odemeler={odemeler} />
    </div>
  )
}
