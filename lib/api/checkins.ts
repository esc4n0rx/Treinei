import { CreateCheckinData, CheckinsResponse, CreateCheckinResponse, LikeCheckinResponse, CommentCheckinResponse, CommentsResponse } from '@/types/checkin'

const API_BASE = '/api/checkins'

/**
 * Busca check-ins de um grupo
 */
export async function fetchGroupCheckins(groupId: string): Promise<CheckinsResponse> {
  try {
    const token = localStorage.getItem('treinei_token')
    
    const response = await fetch(`${API_BASE}?groupId=${groupId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro ao buscar check-ins:', error)
    return { success: false, error: 'Erro de conexão' }
  }
}

/**
 * Cria um novo check-in
 */
export async function createCheckinApi(data: CreateCheckinData): Promise<CreateCheckinResponse> {
  try {
    const token = localStorage.getItem('treinei_token')
    
    const formData = new FormData()
    formData.append('grupo_id', data.grupo_id)
    formData.append('foto', data.foto)
    if (data.observacao) formData.append('observacao', data.observacao)
    if (data.data_checkin) formData.append('data_checkin', data.data_checkin)

    const response = await fetch(`${API_BASE}/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Erro ao criar check-in:', error)
    return { success: false, error: 'Erro de conexão' }
  }
}

/**
 * Curtir/descurtir um check-in
 */
export async function likeCheckinApi(checkinId: string): Promise<LikeCheckinResponse> {
  try {
    const token = localStorage.getItem('treinei_token')
    
    const response = await fetch(`${API_BASE}/${checkinId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Erro ao curtir check-in:', error)
    return { success: false, error: 'Erro de conexão' }
  }
}

/**
 * Buscar comentários de um check-in
 */
export async function fetchCheckinComments(checkinId: string): Promise<CommentsResponse> {
  try {
    const token = localStorage.getItem('treinei_token')
    
    const response = await fetch(`${API_BASE}/${checkinId}/comments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Erro ao buscar comentários:', error)
    return { success: false, error: 'Erro de conexão' }
  }
}

/**
 * Adicionar comentário a um check-in
 */
export async function addCheckinComment(checkinId: string, conteudo: string): Promise<CommentCheckinResponse> {
  try {
    const token = localStorage.getItem('treinei_token')
    
    const response = await fetch(`${API_BASE}/${checkinId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conteudo })
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Erro ao comentar check-in:', error)
    return { success: false, error: 'Erro de conexão' }
  }
}