import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')
  const isPasswordPage = request.nextUrl.pathname.startsWith('/password')
  const expectedToken = process.env.SITE_PASSWORD

  if (!token || token.value !== expectedToken) {
    if (isPasswordPage) return NextResponse.next()
    return NextResponse.redirect(new URL('/password', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
