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
    const startDate = searchParams.get('startDate') // Novo parâmetro
    const endDate = searchParams.get('endDate') // Novo parâmetro

    if (!groupId) {
      return NextResponse.json(
        { success: false, error: 'ID do grupo é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar check-ins do grupo, agora com filtro de data
    const result = await getGroupCheckins(groupId, startDate || undefined, endDate || undefined)

    if (result.success && result.checkins) {

      const checkinsWithUserLikes = await Promise.all(
        result.checkins.map(async (checkin:any) => {
          try {
            const { supabase } = await import('@/lib/supabase')
            const { data: userLike } = await supabase
              .from('treinei_checkins_curtidas')
              .select('id')
              .eq('checkin_id', checkin.id)
              .eq('usuario_id', userId)
              .single()

            return {
              ...checkin,
              userLiked: !!userLike
            }
          } catch (error) {
            return {
              ...checkin,
              userLiked: false
            }
          }
        })
      )

      // Buscar estatísticas do usuário
      const statsResult = await getUserCheckinStats(userId, groupId)
      
      return NextResponse.json({
        success: true,
        checkins: checkinsWithUserLikes,
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