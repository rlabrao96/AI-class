import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')
  const isPasswordPage = request.nextUrl.pathname.startsWith('/password')
  const isNextInternal = request.nextUrl.pathname.startsWith('/_next')

  if (!token && !isPasswordPage && !isNextInternal) {
    return NextResponse.redirect(new URL('/password', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
