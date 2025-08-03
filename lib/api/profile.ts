
import { ProfileResponse, UpdateProfileData, UpdateProfileResponse } from '@/types/profile'

const API_BASE = '/api/profile'

export async function fetchUserProfile(): Promise<ProfileResponse> {
  try {
    const token = localStorage.getItem('treinei_token')
    
    const response = await fetch(API_BASE, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return { success: false, error: 'Erro de conexão' }
  }
}

export async function updateUserProfileApi(data: UpdateProfileData): Promise<UpdateProfileResponse> {
  try {
    const token = localStorage.getItem('treinei_token');
    const response = await fetch(`${API_BASE}/update`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return { success: false, error: 'Erro de conexão' };
  }
}