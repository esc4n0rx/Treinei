export interface Group {
  id: string
  nome: string
  descricao?: string
  logo_url?: string
  tipo: 'publico' | 'privado'
  senha?: string
  administrador_id: string
  data_criacao: string
  status: 'ativo' | 'inativo'
  max_membros?: number
  administrador?: {
    id: string
    nome: string
    avatar_url?: string
  }
  _count?: {
    membros: number
  }
}

export interface GroupMember {
  id: string
  grupo_id: string
  usuario_id: string
  papel: 'administrador' | 'membro'
  data_entrada: string
  status: 'ativo' | 'inativo'
  usuario?: {
    id: string
    nome: string
    avatar_url?: string
  }
  grupo?: Group
}

export interface CreateGroupData {
  nome: string
  descricao?: string
  tipo: 'publico' | 'privado'
  senha?: string
  max_membros?: number
  logo?: File
}

export interface JoinGroupData {
  grupo_id: string
  senha?: string
}

export interface GroupsResponse {
  success: boolean
  groups?: Group[]
  error?: string
}

export interface GroupResponse {
  success: boolean
  group?: Group
  error?: string
}

export interface CreateGroupResponse {
  success: boolean
  group?: Group
  error?: string
}

export interface JoinGroupResponse {
  success: boolean
  membership?: GroupMember
  error?: string
}