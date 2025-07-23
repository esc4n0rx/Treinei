import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { getGroupRanking } from '@/lib/supabase/ranking'

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
    const periodo = searchParams.get('periodo') as 'weekly' | 'monthly'

    if (!groupId) {
      return NextResponse.json(
        { success: false, error: 'ID do grupo é obrigatório' },
        { status: 400 }
      )
    }

    if (!periodo || !['weekly', 'monthly'].includes(periodo)) {
      return NextResponse.json(
        { success: false, error: 'Período inválido. Use "weekly" ou "monthly"' },
        { status: 400 }
      )
    }

    const result = await getGroupRanking(groupId, periodo, userId)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API de ranking:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}