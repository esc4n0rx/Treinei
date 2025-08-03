import { supabase } from '../supabase'
import { RankingUser, GroupRanking } from '@/types/ranking'

export async function getGroupRanking(
 groupId: string, 
 periodo: 'weekly' | 'monthly',
 userId?: string
): Promise<{ success: boolean; ranking?: GroupRanking; error?: string }> {
 try {
  const now = new Date()
  let startDate: Date

  if (periodo === 'weekly') {
   startDate = new Date(now)
   startDate.setDate(startDate.getDate() - startDate.getDay())
   startDate.setHours(0, 0, 0, 0)
  } else {
   startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

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

  const checkinCounts = new Map<string, { user: any; count: number }>()
  
  data?.forEach((checkin: { usuario_id: string; usuario: { id: string; nome: string; avatar_url: string | null } | null }) => {
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

  const rankingArray = Array.from(checkinCounts.entries())
   .map(([userId, data]) => ({
    id: userId,
    nome: data.user.nome,
    avatar_url: data.user.avatar_url,
    checkins_count: data.count,
    posicao: 0,
    usuario: data.user
   }))
   .sort((a, b) => b.checkins_count - a.checkins_count)

  rankingArray.forEach((user, index) => {
   user.posicao = index + 1
  })

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

export async function getUserRankingStats(
 userId: string, 
 groupId: string
): Promise<{ success: boolean; stats?: any; error?: string }> {
 try {
  const weeklyRanking = await getGroupRanking(groupId, 'weekly', userId)
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