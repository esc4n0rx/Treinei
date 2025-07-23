import { RankingResponse } from '@/types/ranking'

const API_BASE = '/api/ranking'

/**
 * Busca ranking de um grupo
 */
export async function fetchGroupRanking(
  groupId: string, 
  periodo: 'weekly' | 'monthly'
): Promise<RankingResponse> {
  try {
    const token = localStorage.getItem('treinei_token')
    
    const url = new URL(API_BASE, window.location.origin)
    url.searchParams.set('groupId', groupId)
    url.searchParams.set('periodo', periodo)

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro ao buscar ranking:', error)
    return { success: false, error: 'Erro de conexão' }
  }
}