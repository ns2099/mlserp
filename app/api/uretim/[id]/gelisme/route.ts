import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { aciklama, tahminiIlerleme } = body

    if (!aciklama || !aciklama.trim()) {
      return NextResponse.json({ error: 'Açıklama gerekli' }, { status: 400 })
    }

    if (tahminiIlerleme === undefined || tahminiIlerleme < 0 || tahminiIlerleme > 100) {
      return NextResponse.json(
        { error: 'Tahmini ilerleme 0-100 arası olmalı' },
        { status: 400 }
      )
    }

    // Üretim var mı kontrol et
    const uretim = await prisma.uretim.findUnique({
      where: { id: params.id },
    })

    if (!uretim) {
      return NextResponse.json({ error: 'Üretim bulunamadı' }, { status: 404 })
    }

    const gelisme = await prisma.uretimGelisme.create({
      data: {
        uretimId: params.id,
        aciklama: aciklama.trim(),
        tahminiIlerleme: parseInt(tahminiIlerleme),
      },
    })

    return NextResponse.json(gelisme, { status: 201 })
  } catch (error) {
    console.error('Gelişme ekleme hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}








