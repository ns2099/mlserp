import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie?.value) {
      return NextResponse.json({ hasSession: false })
    }

    // Session token'ı decode et ve kontrol et
    try {
      const sessionData = JSON.parse(
        Buffer.from(sessionCookie.value, 'base64').toString()
      )

      // Token süresi kontrolü
      if (sessionData.exp && Date.now() > sessionData.exp) {
        return NextResponse.json({ hasSession: false })
      }

      return NextResponse.json({ 
        hasSession: true,
        user: {
          id: sessionData.id,
          username: sessionData.username,
          name: sessionData.name,
          role: sessionData.role,
        }
      })
    } catch (error) {
      return NextResponse.json({ hasSession: false })
    }
  } catch (error) {
    return NextResponse.json({ hasSession: false })
  }
}

