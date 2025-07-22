import { CreateGroupData, JoinGroupData, GroupsResponse, GroupResponse, CreateGroupResponse, JoinGroupResponse } from '@/types/group'

const API_BASE = '/api/groups'

/**
 * Busca grupos do usuário
 */
export async function fetchUserGroups(): Promise<GroupsResponse> {
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
    console.error('Erro ao buscar grupos:', error)
    return { success: false, error: 'Erro de conexão' }
  }
}

/**
 * Busca grupos públicos
 */
export async function fetchPublicGroups(searchQuery?: string): Promise<GroupsResponse> {
  try {
    const url = new URL(`${API_BASE}/public`, window.location.origin)
    if (searchQuery) {
      url.searchParams.set('search', searchQuery)
    }

    const response = await fetch(url.toString())
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro ao buscar grupos públicos:', error)
    return { success: false, error: 'Erro de conexão' }
  }
}

/**
 * Cria um novo grupo
 */
export async function createGroupApi(data: CreateGroupData): Promise<CreateGroupResponse> {
  try {
    const token = localStorage.getItem('treinei_token')
    
    const formData = new FormData()
    formData.append('nome', data.nome)
    if (data.descricao) formData.append('descricao', data.descricao)
    formData.append('tipo', data.tipo)
    if (data.senha) formData.append('senha', data.senha)
    if (data.max_membros) formData.append('max_membros', data.max_membros.toString())
    if (data.logo) formData.append('logo', data.logo)

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
    console.error('Erro ao criar grupo:', error)
    return { success: false, error: 'Erro de conexão' }
  }
}

/**
 * Entrar em um grupo
 */
export async function joinGroupApi(data: JoinGroupData): Promise<JoinGroupResponse> {
  try {
    const token = localStorage.getItem('treinei_token')
    
    const response = await fetch(`${API_BASE}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Erro ao entrar no grupo:', error)
    return { success: false, error: 'Erro de conexão' }
  }
}

/**
 * Busca detalhes de um grupo específico
 */
export async function fetchGroupById(groupId: string): Promise<GroupResponse> {
  try {
    const token = localStorage.getItem('treinei_token')
    
    const response = await fetch(`${API_BASE}/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro ao buscar grupo:', error)
    return { success: false, error: 'Erro de conexão' }
  }
}