// lib/supabase/users.ts
import { supabase } from '../supabase';
import { getUserProfile } from './profile';
import { User } from '@/types/auth';

/**
 * Busca um usuário pelo seu ID na tabela 'treinei_usuarios'.
 * @param userId - O ID (UUID) do usuário a ser buscado.
 * @returns Um objeto com o usuário ou um erro.
 */
export async function getUserById(userId: string) {
  try {
    const { data, error } = await supabase
      .from('treinei_usuarios') // Nome da sua tabela
      .select('id, nome, email')  // Colunas que você quer buscar
      .eq('id', userId)           // Filtro para encontrar pelo ID
      .single();                  // Retorna um único objeto em vez de um array

    if (error) {
      // O método .single() retorna um erro se nenhum registro for encontrado
      if (error.code === 'PGRST116') {
        return { success: false, user: null, error: 'Usuário não encontrado' };
      }
      // Outros erros do Supabase
      console.error('Erro ao buscar usuário por ID no Supabase:', error);
      return { success: false, user: null, error: error.message };
    }

    return { success: true, user: data as User, error: null };

  } catch (e) {
    const error = e as Error;
    console.error('Erro inesperado ao buscar usuário:', error);
    return { success: false, user: null, error: 'Erro interno do servidor' };
  }
}


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