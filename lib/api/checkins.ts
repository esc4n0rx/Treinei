import { CreateCheckinData, CheckinsResponse, CreateCheckinResponse } from '@/types/checkin'

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