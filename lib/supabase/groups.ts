import { supabase } from '../supabase'
import { Group, GroupMember, CreateGroupData, JoinGroupData } from '@/types/group'
import { hashPassword, verifyPassword } from '../auth'
import { uploadGroupLogo } from '../storage'

/**
 * Busca todos os grupos do usuário
 */
export async function getUserGroups(userId: string) {
  try {
    const { data, error } = await supabase
      .from('treinei_grupos_membros')
      .select(`
        id,
        papel,
        data_entrada,
        status,
        grupo:treinei_grupos(
          id,
          nome,
          descricao,
          logo_url,
          tipo,
          data_criacao,
          status,
          max_membros,
          administrador:treinei_usuarios!administrador_id(
            id,
            nome,
            avatar_url
          )
        )
      `)
      .eq('usuario_id', userId)
      .eq('status', 'ativo')
      .order('data_entrada', { ascending: false })

    if (error) {
      console.error('Erro ao buscar grupos do usuário:', error)
      return { success: false, error: 'Erro ao carregar grupos' }
    }

    const groups = data?.map(item => ({
      ...item.grupo,
      userRole: item.papel,
      joinedAt: item.data_entrada
    })) || []

    return { success: true, groups }
  } catch (error) {
    console.error('Erro ao buscar grupos:', error)
    return { success: false, error: 'Erro interno' }
  }
}

/**
 * Busca grupos públicos para descoberta
 */
export async function getPublicGroups(searchQuery?: string, limit = 20) {
  try {
    let query = supabase
      .from('treinei_grupos')
      .select(`
        id,
        nome,
        descricao,
        logo_url,
        tipo,
        data_criacao,
        max_membros,
        administrador:treinei_usuarios!administrador_id(
          id,
          nome,
          avatar_url
        ),
        _count:treinei_grupos_membros!grupo_id(count)
      `)
      .eq('tipo', 'publico')
      .eq('status', 'ativo')
      .limit(limit)
      .order('data_criacao', { ascending: false })

    if (searchQuery) {
      query = query.ilike('nome', `%${searchQuery}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar grupos públicos:', error)
      return { success: false, error: 'Erro ao carregar grupos' }
    }

    return { success: true, groups: data || [] }
  } catch (error) {
    console.error('Erro ao buscar grupos públicos:', error)
    return { success: false, error: 'Erro interno' }
  }
}

/**
 * Cria um novo grupo
 */
export async function createGroup(data: CreateGroupData, userId: string) {
  try {
    const { nome, descricao, tipo, senha, max_membros, logo } = data

    // Hash da senha se o grupo for privado
    let senhaHash = null
    if (tipo === 'privado' && senha) {
      senhaHash = await hashPassword(senha)
    }

    // Criar o grupo
    const { data: groupData, error: groupError } = await supabase
      .from('treinei_grupos')
      .insert({
        nome,
        descricao,
        tipo,
        senha_hash: senhaHash,
        administrador_id: userId,
        max_membros,
        status: 'ativo'
      })
      .select(`
        id,
        nome,
        descricao,
        logo_url,
        tipo,
        data_criacao,
        status,
        max_membros,
        administrador:treinei_usuarios!administrador_id(
          id,
          nome,
          avatar_url
        )
      `)
      .single()

    if (groupError) {
      console.error('Erro ao criar grupo:', groupError)
      return { success: false, error: 'Erro ao criar grupo' }
    }

    let logoUrl = null
    
    // Upload da logo se fornecida
    if (logo) {
      const uploadResult = await uploadGroupLogo(logo, groupData.id)
      if (uploadResult.success && uploadResult.url) {
        logoUrl = uploadResult.url
        
        // Atualizar grupo com URL da logo
        const { error: updateError } = await supabase
          .from('treinei_grupos')
          .update({ logo_url: logoUrl })
          .eq('id', groupData.id)

        if (updateError) {
          console.error('Erro ao atualizar logo:', updateError)
        }
      }
    }

    // Adicionar o criador como administrador do grupo
    const { error: memberError } = await supabase
      .from('treinei_grupos_membros')
      .insert({
        grupo_id: groupData.id,
        usuario_id: userId,
        papel: 'administrador',
        status: 'ativo'
      })

    if (memberError) {
      console.error('Erro ao adicionar administrador:', memberError)
      // Se falhou em adicionar o membro, deletar o grupo
      await supabase.from('treinei_grupos').delete().eq('id', groupData.id)
      return { success: false, error: 'Erro ao configurar grupo' }
    }

    const finalGroup = {
      ...groupData,
      logo_url: logoUrl
    }

    return { success: true, group: finalGroup }
  } catch (error) {
    console.error('Erro ao criar grupo:', error)
    return { success: false, error: 'Erro interno' }
  }
}

/**
 * Entrar em um grupo
 */
export async function joinGroup(data: JoinGroupData, userId: string) {
  try {
    const { grupo_id, senha } = data

    // Verificar se o grupo existe
    const { data: groupData, error: groupError } = await supabase
      .from('treinei_grupos')
      .select('id, nome, tipo, senha_hash, max_membros, status')
      .eq('id', grupo_id)
      .single()

    if (groupError || !groupData) {
      return { success: false, error: 'Grupo não encontrado' }
    }

    if (groupData.status !== 'ativo') {
      return { success: false, error: 'Grupo inativo' }
    }

    // Verificar se já é membro
    const { data: existingMember } = await supabase
      .from('treinei_grupos_membros')
      .select('id')
      .eq('grupo_id', grupo_id)
      .eq('usuario_id', userId)
      .single()

    if (existingMember) {
      return { success: false, error: 'Você já faz parte deste grupo' }
    }

    // Verificar senha se grupo privado
    if (groupData.tipo === 'privado') {
      if (!senha) {
        return { success: false, error: 'Senha é obrigatória para grupos privados' }
      }

      if (groupData.senha_hash) {
        const isValidPassword = await verifyPassword(senha, groupData.senha_hash)
        if (!isValidPassword) {
          return { success: false, error: 'Senha incorreta' }
        }
      }
    }

    // Verificar limite de membros
    if (groupData.max_membros) {
      const { count } = await supabase
        .from('treinei_grupos_membros')
        .select('*', { count: 'exact', head: true })
        .eq('grupo_id', grupo_id)
        .eq('status', 'ativo')

      if (count && count >= groupData.max_membros) {
        return { success: false, error: 'Grupo já atingiu o limite de membros' }
      }
    }

    // Adicionar como membro
    const { data: memberData, error: memberError } = await supabase
      .from('treinei_grupos_membros')
      .insert({
        grupo_id,
        usuario_id: userId,
        papel: 'membro',
        status: 'ativo'
      })
      .select(`
        id,
        papel,
        data_entrada,
        status,
        grupo:treinei_grupos(
          id,
          nome,
          descricao,
          logo_url,
          tipo,
          data_criacao
        )
      `)
      .single()

    if (memberError) {
      console.error('Erro ao entrar no grupo:', memberError)
      return { success: false, error: 'Erro ao entrar no grupo' }
    }

    return { success: true, membership: memberData }
  } catch (error) {
    console.error('Erro ao entrar no grupo:', error)
    return { success: false, error: 'Erro interno' }
  }
}

/**
 * Busca detalhes de um grupo específico
 */
export async function getGroupById(groupId: string, userId?: string) {
  try {
    const { data, error } = await supabase
      .from('treinei_grupos')
      .select(`
        id,
        nome,
        descricao,
        logo_url,
        tipo,
        data_criacao,
        max_membros,
        status,
        administrador:treinei_usuarios!administrador_id(
          id,
          nome,
          avatar_url
        ),
        membros:treinei_grupos_membros!grupo_id(
          id,
          papel,
          data_entrada,
          status,
          usuario:treinei_usuarios!usuario_id(
            id,
            nome,
            avatar_url
          )
        )
      `)
      .eq('id', groupId)
      .eq('status', 'ativo')
      .single()

    if (error) {
      console.error('Erro ao buscar grupo:', error)
      return { success: false, error: 'Grupo não encontrado' }
    }

    // Se userId fornecido, verificar se é membro
    let userMembership = null
    if (userId) {
      const membershipData = data.membros?.find(m => m.usuario && 'id' in m.usuario && m.usuario.id === userId && m.status === 'ativo')
      if (membershipData) {
        userMembership = {
          role: membershipData.papel,
          joinedAt: membershipData.data_entrada
        }
      }
    }

    const group = {
      ...data,
      userMembership,
      membros: data.membros?.filter(m => m.status === 'ativo') || []
    }

    return { success: true, group }
  } catch (error) {
    console.error('Erro ao buscar grupo:', error)
    return { success: false, error: 'Erro interno' }
  }
}