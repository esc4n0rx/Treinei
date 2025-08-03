
import { CreateGroupData, JoinGroupData, GroupsResponse, GroupResponse, CreateGroupResponse, JoinGroupResponse, UpdateGroupData, UpdateMemberRoleData } from '@/types/group'

const API_BASE = '/api/groups'

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

export async function updateGroupApi(groupId: string, data: UpdateGroupData): Promise<GroupResponse> {
  try {
    const token = localStorage.getItem('treinei_token');
    const response = await fetch(`${API_BASE}/${groupId}/manage`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar grupo:', error);
    return { success: false, error: 'Erro de conexão' };
  }
}

export async function removeMemberApi(groupId: string, memberUserId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const token = localStorage.getItem('treinei_token');
    const response = await fetch(`${API_BASE}/${groupId}/members`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ memberUserId }),
    });
    return await response.json();
  } catch (error) {
    console.error('Erro ao remover membro:', error);
    return { success: false, error: 'Erro de conexão' };
  }
}

export async function updateMemberRoleApi(groupId: string, memberUserId: string, data: UpdateMemberRoleData): Promise<{ success: boolean, error?: string }> {
  try {
    const token = localStorage.getItem('treinei_token');
    const response = await fetch(`${API_BASE}/${groupId}/members`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ memberUserId, ...data }),
    });
    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar cargo do membro:', error);
    return { success: false, error: 'Erro de conexão' };
  }
}