// lib/supabase/groups.ts
import { supabase } from '../supabase'
import { Group, GroupMember, CreateGroupData, JoinGroupData, UpdateGroupData } from '@/types/group'
import { hashPassword, verifyPassword } from '../auth'
import { uploadToCloudinary } from '../cloudinary' // Import direto

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
          ),
          _count:treinei_grupos_membros!grupo_id(count)
        )
      `)
      .eq('usuario_id', userId)
      .eq('status', 'ativo')
      .order('data_entrada', { ascending: false })

    if (error) {
      console.error('Erro ao buscar grupos do usuário:', error)
      return { success: false, error: 'Erro ao carregar grupos' }
    }

    const groups = data?.map(item => {
      const grupo = item.grupo as any; // Cast para any para acessar _count
      return {
        ...grupo,
        _count: {
            membros: grupo?._count?.[0]?.count || 0
        },
        userRole: item.papel,
        joinedAt: item.data_entrada
      }
    }) || []

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

    const transformedGroups = data?.map(group => {
      const g = group as any;
      return {
        ...g,
        _count: {
            membros: g._count?.[0]?.count || 0
        }
      }
    }) || []

    return { success: true, groups: transformedGroups }
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

    console.log('Iniciando criação de grupo:', { nome, tipo, temLogo: !!logo })

    let senhaHash = null
    if (tipo === 'privado' && senha) {
      senhaHash = await hashPassword(senha)
    }

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
      .select('id, nome')
      .single()

    if (groupError || !groupData) {
      console.error('Erro ao criar grupo no DB:', groupError)
      return { success: false, error: 'Erro ao criar grupo' }
    }

    console.log('Grupo criado com ID:', groupData.id)

    let logoUrl = null
    if (logo) {
      try {
        console.log('Iniciando upload da logo para Cloudinary...')
        const bytes = await logo.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await uploadToCloudinary(buffer, {
          folder: 'treinei/grupos',
          public_id: `grupo_${groupData.id}_${Date.now()}`,
          transformation: {
            width: 400,
            height: 400,
            crop: 'fill',
            gravity: 'face',
            quality: 'auto:good',
            fetch_format: 'auto'
          }
        })
        
        logoUrl = result.secure_url
        console.log('Logo enviada com sucesso:', logoUrl)

        const { error: updateError } = await supabase
          .from('treinei_grupos')
          .update({ logo_url: logoUrl })
          .eq('id', groupData.id)

        if (updateError) {
          console.error('Erro ao atualizar grupo com URL da logo:', updateError)
        }
      } catch (uploadError) {
        console.error('Erro no upload da logo:', uploadError)
      }
    }

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
      await supabase.from('treinei_grupos').delete().eq('id', groupData.id)
      return { success: false, error: 'Erro ao configurar administrador do grupo' }
    }
    
    // Buscar os dados completos do grupo para retornar
    const { data: finalGroup, error: finalGroupError } = await supabase
      .from('treinei_grupos')
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
      .eq('id', groupData.id)
      .single();

    if (finalGroupError) {
      console.error('Erro ao buscar dados finais do grupo:', finalGroupError);
      return { success: false, error: 'Grupo criado, mas houve um erro ao buscar os dados.' };
    }

    console.log('Grupo finalizado:', finalGroup)
    return { success: true, group: finalGroup }

  } catch (error) {
    console.error('Erro geral ao criar grupo:', error)
    return { success: false, error: 'Erro interno do servidor' }
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
          usuario_id,
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
      const membershipData = data.membros?.find((m: any) => m.usuario && 'id' in m.usuario && m.usuario.id === userId && m.status === 'ativo')
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
      membros: data.membros?.filter((m: any) => m.status === 'ativo') || []
    }

    return { success: true, group }
  } catch (error) {
    console.error('Erro ao buscar grupo:', error)
    return { success: false, error: 'Erro interno' }
  }
}


/**
 * Atualiza os dados de um grupo
 */
export async function updateGroup(groupId: string, data: UpdateGroupData) {
  const { nome, descricao, isPrivate, max_membros } = data;
  
  const { data: updatedData, error } = await supabase
    .from('treinei_grupos')
    .update({
      nome,
      descricao,
      tipo: isPrivate ? 'privado' : 'publico',
      max_membros,
    })
    .eq('id', groupId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar grupo:', error);
    return { success: false, error: 'Não foi possível atualizar o grupo.' };
  }

  return { success: true, group: updatedData };
}

/**
 * Remove um membro de um grupo
 */
export async function removeGroupMember(groupId: string, memberUserId: string) {
  const { error } = await supabase
    .from('treinei_grupos_membros')
    .delete()
    .eq('grupo_id', groupId)
    .eq('usuario_id', memberUserId);

  if (error) {
    console.error('Erro ao remover membro:', error);
    return { success: false, error: 'Não foi possível remover o membro.' };
  }

  return { success: true };
}

/**
 * Altera o cargo de um membro
 */
export async function updateMemberRole(groupId: string, memberUserId: string, role: 'administrador' | 'membro') {
  const { data, error } = await supabase
    .from('treinei_grupos_membros')
    .update({ papel: role })
    .eq('grupo_id', groupId)
    .eq('usuario_id', memberUserId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao alterar cargo do membro:', error);
    return { success: false, error: 'Não foi possível alterar o cargo do membro.' };
  }

  return { success: true, member: data };
}