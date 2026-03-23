import { NextRequest, NextResponse } from 'next/server'

const TIMEOUT_MS = 60 * 60 * 1000 // 1 hour

export function middleware(request: NextRequest) {
  const isPasswordPage = request.nextUrl.pathname.startsWith('/password')
  const token = request.cookies.get('auth_token')

  if (!token) {
    if (isPasswordPage) return NextResponse.next()
    return NextResponse.redirect(new URL('/password', request.url))
  }

  const lastActive = parseInt(token.value, 10)
  const now = Date.now()

  if (isNaN(lastActive) || now - lastActive > TIMEOUT_MS) {
    // Session expired — clear cookie and redirect
    if (isPasswordPage) return NextResponse.next()
    const response = NextResponse.redirect(new URL('/password', request.url))
    response.cookies.delete('auth_token')
    return response
  }

  // Renew the timestamp on every request (resets the inactivity clock)
  const response = NextResponse.next()
  response.cookies.set('auth_token', String(now), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60, // 1 hour hard cap
    path: '/',
  })
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
