import { supabase } from '../supabase'
import { Checkin, CreateCheckinData } from '@/types/checkin'
import { uploadCheckinPhoto } from '../storage'

/**
 * Busca check-ins de um grupo específico
 */
export async function getGroupCheckins(groupId: string, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('treinei_checkins')
      .select(`
        id,
        usuario_id,
        grupo_id,
        foto_url,
        observacao,
        local,
        data_checkin,
        created_at,
        updated_at,
        usuario:treinei_usuarios!usuario_id(
          id,
          nome,
          avatar_url
        ),
        grupo:treinei_grupos!grupo_id(
          id,
          nome
        )
      `)
      .eq('grupo_id', groupId)
      .order('data_checkin', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Erro ao buscar check-ins:', error)
      return { success: false, error: 'Erro ao carregar check-ins' }
    }

    return { success: true, checkins: data || [] }
  } catch (error) {
    console.error('Erro ao buscar check-ins:', error)
    return { success: false, error: 'Erro interno' }
  }
}

/**
 * Cria um novo check-in
 */
export async function createCheckin(data: CreateCheckinData, userId: string) {
  try {
    const { grupo_id, foto, observacao, local, data_checkin } = data

    // Verificar se o usuário é membro do grupo
    const { data: membership } = await supabase
      .from('treinei_grupos_membros')
      .select('id')
      .eq('grupo_id', grupo_id)
      .eq('usuario_id', userId)
      .eq('status', 'ativo')
      .single()

    if (!membership) {
      return { success: false, error: 'Você não é membro deste grupo' }
    }

    // Verificar se já fez check-in hoje neste grupo
    const today = new Date().toISOString().split('T')[0]
    const { data: existingCheckin } = await supabase
      .from('treinei_checkins')
      .select('id')
      .eq('usuario_id', userId)
      .eq('grupo_id', grupo_id)
      .gte('data_checkin', today)
      .lt('data_checkin', today + 'T23:59:59')
      .single()

    if (existingCheckin) {
      return { success: false, error: 'Você já fez check-in hoje neste grupo' }
    }

    // Upload da foto
    const uploadResult = await uploadCheckinPhoto(foto, userId, grupo_id)
    
    if (!uploadResult.success || !uploadResult.url) {
      return { success: false, error: uploadResult.error || 'Erro no upload da foto' }
    }

    // Criar check-in
    const { data: checkinData, error: checkinError } = await supabase
      .from('treinei_checkins')
      .insert({
        usuario_id: userId,
        grupo_id,
        foto_url: uploadResult.url,
        observacao: observacao || null,
        local: local || null,
        data_checkin: data_checkin || new Date().toISOString()
      })
      .select(`
        id,
        usuario_id,
        grupo_id,
        foto_url,
        observacao,
        local,
        data_checkin,
        created_at,
        updated_at,
        usuario:treinei_usuarios!usuario_id(
          id,
          nome,
          avatar_url
        ),
        grupo:treinei_grupos!grupo_id(
          id,
          nome
        )
      `)
      .single()

    if (checkinError) {
      console.error('Erro ao criar check-in:', checkinError)
      return { success: false, error: 'Erro ao criar check-in' }
    }

    return { success: true, checkin: checkinData }
  } catch (error) {
    console.error('Erro ao criar check-in:', error)
    return { success: false, error: 'Erro interno' }
  }
}

/**
 * Busca estatísticas de check-ins do usuário
 */
export async function getUserCheckinStats(userId: string, groupId?: string) {
  try {
    let query = supabase
      .from('treinei_checkins')
      .select('id, data_checkin', { count: 'exact' })
      .eq('usuario_id', userId)

    if (groupId) {
      query = query.eq('grupo_id', groupId)
    }

    const { count: totalCheckins } = await query

    // Check-ins desta semana
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const { count: weeklyCheckins } = await supabase
      .from('treinei_checkins')
      .select('id', { count: 'exact', head: true })
      .eq('usuario_id', userId)
      .gte('data_checkin', startOfWeek.toISOString())
      .eq(groupId ? 'grupo_id' : 'usuario_id', groupId || userId)

    // Check-ins hoje
    const today = new Date().toISOString().split('T')[0]
    const { count: todayCheckins } = await supabase
      .from('treinei_checkins')
      .select('id', { count: 'exact', head: true })
      .eq('usuario_id', userId)
      .gte('data_checkin', today)
      .lt('data_checkin', today + 'T23:59:59')
      .eq(groupId ? 'grupo_id' : 'usuario_id', groupId || userId)

    return {
      success: true,
      stats: {
        total: totalCheckins || 0,
        weekly: weeklyCheckins || 0,
        today: todayCheckins || 0
      }
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return { success: false, error: 'Erro interno' }
  }
}