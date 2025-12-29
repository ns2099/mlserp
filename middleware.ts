import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  const { pathname } = request.nextUrl

  // Cloudflare proxy farkındalığı - X-Forwarded-Proto kontrolü
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const isSecure = forwardedProto === 'https' || request.nextUrl.protocol === 'https:'
  
  // Login sayfası, kayıt, email onay, şifre sıfırlama ve API route'ları için kontrol yapma
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/kayit') ||
    pathname.startsWith('/email-onay') ||
    pathname.startsWith('/sifre-sifirla') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.ico')
  ) {
    return NextResponse.next()
  }

  // Session yoksa login'e yönlendir - MUTLAKA relative path kullan
  if (!session) {
    // request.url'i kullanarak doğru base URL'i al, ama path'i relative yap
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    
    // Relative redirect kullan - Next.js otomatik olarak doğru base URL'i kullanır
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api|login|_next/static|_next/image|favicon.ico|mlsmakina.png).*)',
  ],
}

