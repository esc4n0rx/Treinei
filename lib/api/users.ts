
import { UserProfileResponse } from '@/types/users';

const API_BASE = '/api/users';

export async function fetchUserProfileWithCheckins(userId: string): Promise<UserProfileResponse> {
  try {
    const token = localStorage.getItem('treinei_token');

    const response = await fetch(`${API_BASE}/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return { success: false, error: 'Erro de conexão' };
  }
}