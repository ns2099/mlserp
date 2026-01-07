import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const makinalar = await prisma.makina.findMany({
      include: {
        makinaAtamalar: {
          include: {
            uretim: true,
          },
        },
      },
    })

    return NextResponse.json(makinalar)
  } catch (error) {
    console.error('Makina raporu hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}



