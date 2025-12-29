import { prisma } from '@/lib/prisma'
import MakinaListeWrapper from './MakinaListeWrapper'

export default async function MakinaListePage() {
  const makinalar = await prisma.makina.findMany({
    include: {
      makinaBilesenleri: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return <MakinaListeWrapper makinalar={makinalar} />
}

