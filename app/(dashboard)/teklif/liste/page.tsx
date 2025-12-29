import { prisma } from '@/lib/prisma'
import TeklifListeWrapper from './TeklifListeWrapper'

const durumLabels: Record<number, string> = {
  1: 'Bekleyen',
  2: 'Onaylanan',
  3: 'Reddedilen',
  4: 'Tamamlanan',
}

export default async function TeklifListePage({
  searchParams,
}: {
  searchParams: { durum?: string }
}) {
  const durum = searchParams.durum
  const where: any = {}
  if (durum && durum !== 'tum') {
    where.durum = parseInt(durum)
  }

  const teklifler = await prisma.teklif.findMany({
    where,
    include: {
      firma: true,
      makina: true,
      user: true,
      teklifUrunler: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const durumText =
    durum === 'tum' || !durum
      ? 'Tüm Teklifler'
      : durumLabels[parseInt(durum)] + ' Teklifler'

  return <TeklifListeWrapper teklifler={teklifler} durumText={durumText} />
}

