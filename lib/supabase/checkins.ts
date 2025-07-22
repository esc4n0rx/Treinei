import { supabase } from '../supabase'
import { Checkin, CreateCheckinData } from '@/types/checkin'
import { uploadCheckinPhoto, diagnoseStorageIssues } from '../storage'

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
 * Cria um novo check-in com debugging aprimorado
 */
export async function createCheckin(data: CreateCheckinData, userId: string) {
  try {
    console.log('=== INÍCIO CRIAÇÃO CHECKIN ===')
    console.log('Dados recebidos:', { 
      grupo_id: data.grupo_id, 
      userId,
      temFoto: !!data.foto,
      fotoSize: data.foto?.size,
      observacao: data.observacao,
      local: data.local
    })

    const { grupo_id, foto, observacao, local, data_checkin } = data

    // Verificar se o usuário é membro do grupo
    console.log('Verificando membership...')
    const { data: membership, error: membershipError } = await supabase
      .from('treinei_grupos_membros')
      .select('id')
      .eq('grupo_id', grupo_id)
      .eq('usuario_id', userId)
      .eq('status', 'ativo')
      .single()

    if (membershipError || !membership) {
      console.error('Erro de membership:', membershipError)
      return { success: false, error: 'Você não é membro deste grupo' }
    }
    console.log('Membership verificado com sucesso')

    // Verificar se já fez check-in hoje neste grupo
    console.log('Verificando check-in duplicado...')
    const today = new Date().toISOString().split('T')[0]
    const { data: existingCheckin, error: existingError } = await supabase
      .from('treinei_checkins')
      .select('id')
      .eq('usuario_id', userId)
      .eq('grupo_id', grupo_id)
      .gte('data_checkin', today)
      .lt('data_checkin', today + 'T23:59:59')
      .single()

    if (existingCheckin) {
      console.log('Check-in já existe para hoje')
      return { success: false, error: 'Você já fez check-in hoje neste grupo' }
    }
    console.log('Nenhum check-in duplicado encontrado')

    // Executar diagnóstico se necessário
    if (process.env.NODE_ENV === 'development') {
      await diagnoseStorageIssues()
    }

    // Upload da foto
    console.log('Iniciando upload da foto...')
    const uploadResult = await uploadCheckinPhoto(foto, userId, grupo_id)
    
    if (!uploadResult.success || !uploadResult.url) {
      console.error('Falha no upload:', uploadResult.error)
      return { success: false, error: uploadResult.error || 'Erro no upload da foto' }
    }
    console.log('Upload da foto realizado com sucesso:', uploadResult.url)

    // Criar check-in no banco
    console.log('Criando registro no banco...')
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
      console.error('Erro ao criar check-in no banco:', checkinError)
      return { success: false, error: 'Erro ao criar check-in' }
    }

    console.log('Check-in criado com sucesso no banco:', checkinData.id)
    console.log('=== FIM CRIAÇÃO CHECKIN - SUCESSO ===')

    return { success: true, checkin: checkinData }
  } catch (error) {
    console.error('Erro geral ao criar check-in:', error)
    console.log('=== FIM CRIAÇÃO CHECKIN - ERRO ===')
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