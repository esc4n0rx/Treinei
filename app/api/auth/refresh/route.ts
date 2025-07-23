import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, generateToken, extractTokenFromHeader } from '@/lib/auth'
import { getUserById } from '@/lib/supabase/users'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader || '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    let decoded
    try {
      decoded = verifyToken(token)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token inválido ou corrompido' },
        { status: 401 }
      )
    }

    const userResult = await getUserById(decoded.userId)
    
    if (!userResult.success || !userResult.user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 401 }
      )
    }

    if (userResult.user.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Usuário inativo' },
        { status: 401 }
      )
    }

    const newToken = generateToken(userResult.user)

    return NextResponse.json({
      success: true,
      token: newToken,
      user: userResult.user,
      // Não implementamos refresh token por enquanto, mas podemos adicionar futuramente
      refreshToken: undefined
    })

  } catch (error) {
    console.error('Erro na API de refresh:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}