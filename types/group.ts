// types/group.ts
import { Gyncana } from "./gyncana";

export interface Group {
  id: string
  nome: string
  descricao: string | null
  logo_url: string | null
  tipo: 'publico' | 'privado'
  data_criacao: string
  max_membros: number | null
  status: 'ativo' | 'inativo'
  administrador?: {
    id: string
    nome: string
    avatar_url: string | null
  }
  administrador_id?: string
  userRole?: 'administrador' | 'membro'
  joinedAt?: string
  userMembership?: {
    role: 'administrador' | 'membro'
    joinedAt: string
  }
  membros?: GroupMember[]
  _count?: {
    membros?: number
  }
  activeGyncana?: Gyncana;
}

export interface GroupMember {
  id: string
  papel: 'administrador' | 'membro'
  data_entrada: string
  status: 'ativo' | 'inativo'
  usuario?: {
    id: string
    nome: string
    avatar_url: string | null
  }
  usuario_id: string
}

export interface CreateGroupData {
  nome: string
  descricao?: string
  tipo: 'publico' | 'privado'
  senha?: string
  max_membros?: number
  logo?: File
}

export interface UpdateGroupData {
  nome?: string
  descricao?: string
  isPrivate?: boolean
  max_membros?: number
  weekly_goal?: number
}

export interface UpdateMemberRoleData {
  role: 'administrador' | 'membro'
}

export interface JoinGroupData {
  grupo_id: string
  senha?: string
}

// Response types
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
  membership?: any
  error?: string
}