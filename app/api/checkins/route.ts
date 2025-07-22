import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { getGroupCheckins, getUserCheckinStats } from '@/lib/supabase/checkins'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader || '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    const userId = decoded.userId

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json(
        { success: false, error: 'ID do grupo é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o usuário é membro do grupo
    const result = await getGroupCheckins(groupId)

    if (result.success) {
      // Também retornar estatísticas do usuário
      const statsResult = await getUserCheckinStats(userId, groupId)
      
      return NextResponse.json({
        success: true,
        checkins: result.checkins,
        userStats: statsResult.success ? statsResult.stats : null
      })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API de check-ins:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}