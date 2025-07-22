import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Rotas que precisam de autenticação
  const protectedPaths = ['/dashboard', '/groups', '/checkins', '/ranking', '/profile']
  
  // Rotas públicas (login/register)
  const publicPaths = ['/']
  
  const { pathname } = request.nextUrl
  
  // Verificar se é uma rota protegida
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isPublicPath = publicPaths.includes(pathname)
  
  // Verificar token nos cookies ou headers
  const token = request.cookies.get('treinei_token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '')
  
  // Se é uma rota protegida e não tem token, redirecionar para login
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Se é uma rota pública e tem token, redirecionar para dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}