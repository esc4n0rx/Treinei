import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const protectedPaths = ['/dashboard', '/groups', '/checkins', '/ranking', '/profile']
  
  const publicPaths = ['/']
  
  const { pathname } = request.nextUrl
  
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isPublicPath = publicPaths.includes(pathname)
  
  const tokenFromCookie = request.cookies.get('treinei_token')?.value
  const tokenFromHeader = request.headers.get('Authorization')?.replace('Bearer ', '')
  const token = tokenFromHeader || tokenFromCookie

  if (isProtectedPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    try {
      verifyToken(token)
    } catch (error) {
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('treinei_token')
      return response
    }
  }
  
  if (isPublicPath && token) {
    try {
      verifyToken(token)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch {
      const response = NextResponse.next()
      response.cookies.delete('treinei_token')
      return response
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
     * - manifest.json (PWA manifest)
     * - sw.js (service worker)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)',
  ],
}