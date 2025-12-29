import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Üretimde olan tüm kayıtları bul
    const uretimler = await prisma.uretim.findMany({
      where: { durum: 'Üretimde' },
      select: { id: true },
    })

    const uretimIds = uretimler.map((u) => u.id)

    if (uretimIds.length === 0) {
      return NextResponse.json({ message: 'Silinecek üretim kaydı bulunamadı.', count: 0 })
    }

    // İlişkili kayıtları sil
    await prisma.urunGideri.deleteMany({
      where: { uretimId: { in: uretimIds } },
    })

    await prisma.uretimGelisme.deleteMany({
      where: { uretimId: { in: uretimIds } },
    })

    await prisma.makinaAtama.deleteMany({
      where: { uretimId: { in: uretimIds } },
    })

    // Üretim kayıtlarını sil
    const result = await prisma.uretim.deleteMany({
      where: { durum: 'Üretimde' },
    })

    return NextResponse.json({ 
      message: `${result.count} adet üretim kaydı başarıyla silindi.`,
      count: result.count 
    })
  } catch (error) {
    console.error('Toplu silme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

