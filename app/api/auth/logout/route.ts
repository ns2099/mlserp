import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  
  // Session cookie'yi sil - Cloudflare Tunnel için ayarlar
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: false, // Cloudflare Tunnel için false (Cloudflare HTTPS → Node HTTP)
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}




