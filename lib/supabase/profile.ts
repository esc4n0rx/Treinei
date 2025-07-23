// lib/supabase/profile.ts
import { supabase } from '../supabase'
import { UserProfile, UserStats } from '@/types/profile'

/**
* Busca perfil completo do usuário com estatísticas
*/
export async function getUserProfile(userId: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
try {
 // Buscar dados básicos do usuário
 const { data: userData, error: userError } = await supabase
        .from('treinei_usuarios')
        .select('id, nome, email, avatar_url, status, data_cadastro')
        .eq('id', userId)
        .single()

     if (userError || !userData) {
     return { success: false, error: 'Usuário não encontrado' }
     }


    const stats = await getUserStats(userId)
    if (!stats.success) {
     return { success: false, error: 'Erro ao carregar estatísticas' }
    }

    const { data: gruposData } = await supabase
    .from('treinei_grupos_membros')
    .select(`
    papel,
    grupo:treinei_grupos!grupo_id(
    id,
    nome
    )
    `)
    .eq('usuario_id', userId)
    .eq('status', 'ativo')


    const grupos = gruposData?.map((item: { papel: string; grupo: { id: string; nome: string } }) => ({
    id: item.grupo.id,
    nome: item.grupo.nome,
    papel: item.papel
     })) || []

    const profile: UserProfile = {
    ...userData,
    grupos_count: grupos.length,
    checkins_totais: stats.stats?.total_checkins || 0,
    checkins_semanal: stats.stats?.weekly_checkins || 0,
    checkins_mensal: stats.stats?.monthly_checkins || 0,
    melhor_streak: stats.stats?.melhor_streak || 0,
    ultimo_checkin: stats.stats?.ultimo_checkin,
    grupos
     }

    return { success: true, profile }
    } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return { success: false, error: 'Erro interno' }
     }
}


export async function getUserStats(userId: string): Promise<{ success: boolean; stats?: UserStats; error?: string }> {
 try {
  // Total de check-ins
  const { count: totalCheckins } = await supabase
   .from('treinei_checkins')
   .select('id', { count: 'exact', head: true })
   .eq('usuario_id', userId)

  // Check-ins da semana
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const { count: weeklyCheckins } = await supabase
   .from('treinei_checkins')
   .select('id', { count: 'exact', head: true })
   .eq('usuario_id', userId)
   .gte('data_checkin', startOfWeek.toISOString())

  // Check-ins do mês
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: monthlyCheckins } = await supabase
   .from('treinei_checkins')
   .select('id', { count: 'exact', head: true })
   .eq('usuario_id', userId)
   .gte('data_checkin', startOfMonth.toISOString())

  // Último check-in
  const { data: lastCheckin } = await supabase
   .from('treinei_checkins')
   .select('data_checkin')
   .eq('usuario_id', userId)
   .order('data_checkin', { ascending: false })
   .limit(1)
   .single()

  // Contagem de grupos
  const { count: gruposCount } = await supabase
   .from('treinei_grupos_membros')
   .select('id', { count: 'exact', head: true })
   .eq('usuario_id', userId)
   .eq('status', 'ativo')

  // Calcular melhor streak (implementação simplificada)
  const melhor_streak = await calculateBestStreak(userId)

  const stats: UserStats = {
   total_checkins: totalCheckins || 0,
   weekly_checkins: weeklyCheckins || 0,
   monthly_checkins: monthlyCheckins || 0,
   grupos_count: gruposCount || 0,
   melhor_streak,
   ultimo_checkin: lastCheckin?.data_checkin
  }

  return { success: true, stats }
 } catch (error) {
  console.error('Erro ao buscar estatísticas:', error)
  return { success: false, error: 'Erro interno' }
 }
}

/**
* Calcula o melhor streak do usuário
*/
async function calculateBestStreak(userId: string): Promise<number> {
 try {
  // Buscar todos os check-ins ordenados por data
  const { data: checkins } = await supabase
   .from('treinei_checkins')
   .select('data_checkin')
   .eq('usuario_id', userId)
   .order('data_checkin', { ascending: true })

  if (!checkins || checkins.length === 0) return 0

  let maxStreak = 1
  let currentStreak = 1
    // AJUSTE: A tipagem já foi corrigida no arquivo que você me enviou, mantendo a consistência.
  let lastDate = new Date((checkins[0] as { data_checkin: string }).data_checkin)

  for (let i = 1; i < checkins.length; i++) {
        // AJUSTE: A tipagem já foi corrigida no arquivo que você me enviou, mantendo a consistência.
   const currentDate = new Date((checkins[i] as { data_checkin: string }).data_checkin)
   const dayDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
   
   if (dayDiff === 1) {
    currentStreak++
    maxStreak = Math.max(maxStreak, currentStreak)
   } else if (dayDiff > 1) {
    currentStreak = 1
   }
   
   lastDate = currentDate
  }

  return maxStreak
 } catch (error) {
  console.error('Erro ao calcular streak:', error)
  return 0
 }
}