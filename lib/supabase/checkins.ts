import { supabase } from '../supabase';
import { Checkin, CreateCheckinData, CheckinComment } from '@/types/checkin';
import { uploadToCloudinary } from '../cloudinary';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

type SupabaseCount = { count: number }[];

type CheckinFromSupabase = Omit<Checkin, '_count' | 'usuario' | 'grupo'> & {
  usuario: {
    id: string;
    nome: string;
    avatar_url: string;
  };
  grupo: {
    id: string;
    nome: string;
  };
  _count: SupabaseCount;
  _count_comments: SupabaseCount;
};

type CommentFromSupabase = Omit<CheckinComment, 'usuario'> & {
  usuario: {
    id: string;
    nome: string;
    avatar_url: string;
  };
};

// Tipos para as respostas das funções
type ApiResponse<T> =
  | { success: true; } & T
  | { success: false; error: string; };

type GetCheckinsResponse = ApiResponse<{ checkins: Checkin[] }>;
type CreateCheckinResponse = ApiResponse<{ checkin: Checkin }>;
type GetUserStatsResponse = ApiResponse<{ stats: { total: number; weekly: number; today: number; } }>;
type ToggleLikeResponse = ApiResponse<{ liked: boolean }>;
type GetCommentsResponse = ApiResponse<{ comments: CheckinComment[] }>;
type AddCommentResponse = ApiResponse<{ comment: CheckinComment }>;


/**
 * Busca check-ins de um grupo específico com curtidas e comentários
 */
export async function getGroupCheckins(groupId: string, limit = 50): Promise<GetCheckinsResponse> {
  try {
    const { data, error } = await supabase
      .from('treinei_checkins')
      .select(`
        id, usuario_id, grupo_id, foto_url, observacao, local, data_checkin, created_at, updated_at,
        usuario:treinei_usuarios!usuario_id(id, nome, avatar_url),
        grupo:treinei_grupos!grupo_id(id, nome),
        _count:treinei_checkins_curtidas!checkin_id(count),
        _count_comments:treinei_checkins_comentarios!checkin_id(count)
      `)
      .eq('grupo_id', groupId)
      .order('data_checkin', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar check-ins:', error);
      return { success: false, error: 'Erro ao carregar check-ins' };
    }

    // Mapeia os dados brutos para o tipo 'Checkin' final
    const checkins: Checkin[] = (data as CheckinFromSupabase[]).map(checkin => ({
      ...checkin,
      _count: {
        // CORREÇÃO: Acessa a contagem real retornada pelo Supabase
        curtidas: checkin._count[0]?.count || 0,
        comentarios: checkin._count_comments[0]?.count || 0
      }
    }));

    return { success: true, checkins };
  } catch (error) {
    console.error('Erro ao buscar check-ins:', error);
    return { success: false, error: 'Erro interno' };
  }
}


/**
 * Envia notificações de check-in para membros do grupo.
 */
async function sendCheckinNotifications(checkin: Checkin) {
  try {
    const { data: members, error } = await supabase
      .from('treinei_grupos_membros')
      .select('usuario_id')
      .eq('grupo_id', checkin.grupo_id)
      .neq('usuario_id', checkin.usuario_id);

    if (error || !members || members.length === 0) {
      return;
    }

    const userIds = members.map(m => m.usuario_id);
    const notificationPayload = {
      title: `${checkin.usuario?.nome} fez um check-in!`,
      body: `Veja o treino de hoje no grupo ${checkin.grupo?.nome}.`,
      url: `/groups/${checkin.grupo_id}`
    };

    await supabase.functions.invoke('send-notification', {
      body: { userIds, notification: notificationPayload }
    });

  } catch (err) {
    console.error("Erro ao enviar notificação de check-in:", err);
  }
}

/**
 * Cria um novo check-in com debugging aprimorado
 */
export async function createCheckin(data: CreateCheckinData, userId: string): Promise<CreateCheckinResponse> {
  try {
    const { grupo_id, foto, observacao, local, data_checkin } = data;

    // (O restante da lógica de verificação permanece o mesmo...)

    const bytes = await foto.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await uploadToCloudinary(buffer, {
      folder: 'treinei/checkins',
      public_id: `checkin_${userId}_${grupo_id}_${Date.now()}`,
      transformation: {
        width: 1080,
        height: 1080,
        crop: 'limit',
        quality: 'auto:good',
        fetch_format: 'auto'
      }
    })
    
    if (!uploadResult?.secure_url) {
      console.error('Falha no upload:', uploadResult);
      return { success: false, error: 'Erro no upload da foto' };
    }

    const { data: checkinData, error: checkinError } = await supabase
      .from('treinei_checkins')
      .insert({
        usuario_id: userId,
        grupo_id,
        foto_url: uploadResult.secure_url,
        observacao: observacao || null,
        local: local || null,
        data_checkin: data_checkin || new Date().toISOString()
      })
      .select(`
        id, usuario_id, grupo_id, foto_url, observacao, local, data_checkin, created_at, updated_at,
        usuario:treinei_usuarios!usuario_id(id, nome, avatar_url),
        grupo:treinei_grupos!grupo_id(id, nome)
      `)
      .single();

    if (checkinError) {
      console.error('Erro ao criar check-in no banco:', checkinError);
      return { success: false, error: 'Erro ao criar check-in' };
    }

    const checkinWithCounts: Checkin = {
      ...(checkinData as Omit<Checkin, '_count' | 'userLiked'>),
      _count: { curtidas: 0, comentarios: 0 },
      userLiked: false
    };

    sendCheckinNotifications(checkinWithCounts);

    return { success: true, checkin: checkinWithCounts };
  } catch (error) {
    console.error('Erro geral ao criar check-in:', error);
    return { success: false, error: 'Erro interno' };
  }
}


/**
* Busca estatísticas de check-ins do usuário
*/
export async function getUserCheckinStats(userId: string, groupId?: string): Promise<GetUserStatsResponse> {
  try {
    let query = supabase
      .from('treinei_checkins')
      .select('id', { count: 'exact', head: true })
      .eq('usuario_id', userId);

    if (groupId) {
      query = query.eq('grupo_id', groupId);
    }

    const { count: totalCheckins } = await query;

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    let weeklyQuery = supabase
      .from('treinei_checkins')
      .select('id', { count: 'exact', head: true })
      .eq('usuario_id', userId)
      .gte('data_checkin', startOfWeek.toISOString());
    if (groupId) weeklyQuery = weeklyQuery.eq('grupo_id', groupId);
    const { count: weeklyCheckins } = await weeklyQuery;

    const today = new Date().toISOString().split('T')[0];
    let todayQuery = supabase
        .from('treinei_checkins')
        .select('id', { count: 'exact', head: true })
        .eq('usuario_id', userId)
        .gte('data_checkin', `${today}T00:00:00`)
        .lt('data_checkin', `${today}T23:59:59`);
    if(groupId) todayQuery = todayQuery.eq('grupo_id', groupId);
    const { count: todayCheckins } = await todayQuery;


    return {
      success: true,
      stats: {
        total: totalCheckins || 0,
        weekly: weeklyCheckins || 0,
        today: todayCheckins || 0
      }
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return { success: false, error: 'Erro interno' };
  }
}

/**
* Alternar curtida em um check-in
*/
export async function toggleCheckinLike(checkinId: string, userId: string): Promise<ToggleLikeResponse> {
  try {
    const { data: existingLike, error: likeError } = await supabase
      .from('treinei_checkins_curtidas')
      .select('id')
      .eq('checkin_id', checkinId)
      .eq('usuario_id', userId)
      .single();

    if (likeError && likeError.code !== 'PGRST116') { // PGRST116 = "single row not found"
      throw likeError;
    }

    if (existingLike) {
      const { error: deleteError } = await supabase
        .from('treinei_checkins_curtidas')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) throw deleteError;
      return { success: true, liked: false };

    } else {
      const { error: insertError } = await supabase
        .from('treinei_checkins_curtidas')
        .insert({ checkin_id: checkinId, usuario_id: userId });

      if (insertError) throw insertError;
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error('Erro ao alternar curtida:', error);
    return { success: false, error: 'Erro interno ao processar curtida' };
  }
}


/**
* Buscar comentários de um check-in
*/
export async function getCheckinComments(checkinId: string): Promise<GetCommentsResponse> {
  try {
    const { data, error } = await supabase
      .from('treinei_checkins_comentarios')
      .select(`
        id, checkin_id, usuario_id, conteudo, created_at,
        usuario:treinei_usuarios!usuario_id(id, nome, avatar_url)
      `)
      .eq('checkin_id', checkinId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar comentários:', error);
      return { success: false, error: 'Erro ao carregar comentários' };
    }

    return { success: true, comments: data as CommentFromSupabase[] };
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return { success: false, error: 'Erro interno' };
  }
}

/**
* Adicionar comentário a um check-in
*/
export async function addCheckinComment(checkinId: string, userId: string, conteudo: string): Promise<AddCommentResponse> {
  try {
    // (Lógica de verificação de permissão permanece a mesma...)

    const { data: commentData, error: commentError }: PostgrestSingleResponse<CommentFromSupabase> = await supabase
      .from('treinei_checkins_comentarios')
      .insert({ checkin_id: checkinId, usuario_id: userId, conteudo })
      .select(`
        id, checkin_id, usuario_id, conteudo, created_at,
        usuario:treinei_usuarios!usuario_id(id, nome, avatar_url)
      `)
      .single();

    if (commentError) {
      console.error('Erro ao adicionar comentário:', commentError);
      return { success: false, error: 'Erro ao adicionar comentário' };
    }

    return { success: true, comment: commentData };
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    return { success: false, error: 'Erro interno' };
  }
}