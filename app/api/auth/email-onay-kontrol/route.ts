import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token gerekli' },
        { status: 400 }
      )
    }

    // Token ile kullanıcıyı bul
    const user = await prisma.user.findFirst({
      where: {
        emailOnayToken: token,
        emailOnayTarih: {
          gte: new Date(), // Token hala geçerli
        },
        emailOnaylandiMi: false, // Henüz onaylanmamış
      },
    })

    if (!user) {
      return NextResponse.json(
        { valid: false, error: 'Geçersiz veya süresi dolmuş token' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      username: user.username,
      email: user.email,
    })
  } catch (error) {
    console.error('Token kontrol hatası:', error)
    return NextResponse.json(
      { valid: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}




