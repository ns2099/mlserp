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

  // Session yoksa login'e yönlendir
  // Ancak login sayfasından gelen istekleri kontrol etme (redirect loop'u önlemek için)
  if (!session) {
    const loginUrl = new URL('/login', request.url)
    // Eğer zaten login sayfasına gidiyorsa redirect yapma
    if (pathname !== '/login') {
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
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

