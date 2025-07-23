import { supabase } from '../supabase'
import { RankingUser, GroupRanking } from '@/types/ranking'

/**
* Busca ranking de um grupo por período
*/
export async function getGroupRanking(
 groupId: string, 
 periodo: 'weekly' | 'monthly',
 userId?: string
): Promise<{ success: boolean; ranking?: GroupRanking; error?: string }> {
 try {
  // Calcular data de início do período
  const now = new Date()
  let startDate: Date

  if (periodo === 'weekly') {
   startDate = new Date(now)
   startDate.setDate(startDate.getDate() - startDate.getDay()) // Início da semana (domingo)
   startDate.setHours(0, 0, 0, 0)
  } else {
   startDate = new Date(now.getFullYear(), now.getMonth(), 1) // Início do mês
  }

  // Query para buscar ranking com join
  const { data, error } = await supabase
   .from('treinei_checkins')
   .select(`
    usuario_id,
    usuario:treinei_usuarios!usuario_id(
     id,
     nome,
     avatar_url
    )
   `)
   .eq('grupo_id', groupId)
   .gte('data_checkin', startDate.toISOString())
   .order('data_checkin', { ascending: false })

  if (error) {
   console.error('Erro ao buscar ranking:', error)
   return { success: false, error: 'Erro ao carregar ranking' }
  }

  // Contar check-ins por usuário
  const checkinCounts = new Map<string, { user: any; count: number }>()
  
    // AJUSTE: Adicionada a tipagem explícita para o parâmetro 'checkin'
  data?.forEach((checkin: { usuario_id: string; usuario: { id: string; nome: string; avatar_url: string | null } | null }) => {
      // Adicionada verificação para garantir que 'usuario' não é nulo
      if (!checkin.usuario) {
        return;
      }

   const userId = checkin.usuario_id
   const current = checkinCounts.get(userId)
   
   if (current) {
    current.count += 1
   } else {
    checkinCounts.set(userId, {
     user: checkin.usuario,
     count: 1
    })
   }
  })

  // Converter para array e ordenar por count (descrescente)
  const rankingArray = Array.from(checkinCounts.entries())
   .map(([userId, data]) => ({
    id: userId,
    nome: data.user.nome,
    avatar_url: data.user.avatar_url,
    checkins_count: data.count,
    posicao: 0, // Será definido após ordenação
    usuario: data.user
   }))
   .sort((a, b) => b.checkins_count - a.checkins_count)

  // Atribuir posições
  rankingArray.forEach((user, index) => {
   user.posicao = index + 1
  })

  // Encontrar posição do usuário atual se fornecido
  let user_position
  if (userId) {
   const userRank = rankingArray.find(rank => rank.id === userId)
   if (userRank) {
    user_position = {
     posicao: userRank.posicao,
     checkins_count: userRank.checkins_count
    }
   }
  }

  const ranking: GroupRanking = {
   periodo,
   usuarios: rankingArray,
   user_position
  }

  return { success: true, ranking }
 } catch (error) {
  console.error('Erro ao buscar ranking:', error)
  return { success: false, error: 'Erro interno' }
 }
}

/**
* Busca estatísticas de ranking do usuário
*/
export async function getUserRankingStats(
 userId: string, 
 groupId: string
): Promise<{ success: boolean; stats?: any; error?: string }> {
 try {
  // Buscar posição semanal
  const weeklyRanking = await getGroupRanking(groupId, 'weekly', userId)
  
  // Buscar posição mensal
  const monthlyRanking = await getGroupRanking(groupId, 'monthly', userId)

  const stats = {
   weekly_position: weeklyRanking.ranking?.user_position?.posicao || null,
   monthly_position: monthlyRanking.ranking?.user_position?.posicao || null,
   weekly_checkins: weeklyRanking.ranking?.user_position?.checkins_count || 0,
   monthly_checkins: monthlyRanking.ranking?.user_position?.checkins_count || 0
  }

  return { success: true, stats }
 } catch (error) {
  console.error('Erro ao buscar stats de ranking:', error)
  return { success: false, error: 'Erro interno' }
 }
}