import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ success: false })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.id,
        username: session.username,
        name: session.name,
        role: session.role,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false })
  }
}

