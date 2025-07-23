import { ProfileResponse } from '@/types/profile'

const API_BASE = '/api/profile'

/**
 * Busca perfil do usuário atual
 */
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