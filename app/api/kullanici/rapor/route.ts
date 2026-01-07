import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const kullanicilar = await prisma.user.findMany({
      include: {
        teklifler: true,
        uretimler: true,
      },
    })

    return NextResponse.json(kullanicilar)
  } catch (error) {
    console.error('Kullanıcı raporu hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}



