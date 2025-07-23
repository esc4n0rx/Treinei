// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  // Rotas que precisam de autenticação
  const protectedPaths = ['/dashboard', '/groups', '/checkins', '/ranking', '/profile']
  
  // Rotas públicas (login/register)
  const publicPaths = ['/']
  
  const { pathname } = request.nextUrl
  
  // Verificar se é uma rota protegida
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isPublicPath = publicPaths.includes(pathname)
  
  // Tentar obter token de múltiplas fontes
  const tokenFromCookie = request.cookies.get('treinei_token')?.value
  const tokenFromHeader = request.headers.get('Authorization')?.replace('Bearer ', '')
  const token = tokenFromHeader || tokenFromCookie

  // Se é uma rota protegida
  if (isProtectedPath) {
    if (!token) {
      console.log('🔒 Acesso negado: Token não encontrado')
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Verificar se o token é válido
    try {
      verifyToken(token)
    } catch (error) {
      console.log('🔒 Acesso negado: Token inválido -', error)
      // Limpar cookie inválido
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('treinei_token')
      return response
    }
  }
  
  // Se é uma rota pública e tem token válido, redirecionar para dashboard
  if (isPublicPath && token) {
    try {
      verifyToken(token)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch {
      // Token inválido, permitir acesso à página pública e limpar cookie
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