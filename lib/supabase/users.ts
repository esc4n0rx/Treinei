// lib/supabase/users.ts
import { supabase } from '../supabase';
import { getUserProfile } from './profile';

/**
 * Busca o perfil público de um usuário, incluindo todos os seus check-ins.
 */
export async function getUserProfileWithCheckins(userId: string) {
  try {
    // 1. Buscar o perfil base com estatísticas (incluindo dias_ativos)
    const profileResult = await getUserProfile(userId);

    if (!profileResult.success || !profileResult.profile) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    // 2. Buscar todos os check-ins do usuário
    const { data: checkinsData, error: checkinsError } = await supabase
      .from('treinei_checkins')
      .select('id, foto_url, data_checkin')
      .eq('usuario_id', userId)
      .order('data_checkin', { ascending: false });

    if (checkinsError) {
      console.error('Erro ao buscar check-ins do usuário:', checkinsError);
      return { success: false, error: 'Erro ao carregar check-ins do usuário' };
    }

    const profileWithCheckins = {
      ...profileResult.profile,
      checkins: checkinsData || [],
    };

    return { success: true, profile: profileWithCheckins };
  } catch (error) {
    console.error('Erro ao buscar perfil completo do usuário:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}