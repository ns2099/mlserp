import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Notu bul
    const not = await prisma.gelistirmeNotu.findUnique({
      where: { id },
    })

    if (!not) {
      return NextResponse.json({ error: 'Not bulunamadı' }, { status: 404 })
    }

    // Notu sil
    await prisma.gelistirmeNotu.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Not silindi' })
  } catch (error) {
    console.error('Geliştirme notu silme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
