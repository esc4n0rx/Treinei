export interface Checkin {
  id: string
  usuario_id: string
  grupo_id: string
  foto_url: string
  observacao?: string
  local?: string
  data_checkin: string
  created_at: string
  updated_at: string
  usuario?: {
    id: string
    nome: string
    avatar_url?: string
  }
  grupo?: {
    id: string
    nome: string
  }
  _count?: {
    curtidas?: number
    comentarios?: number
  }
  userLiked?: boolean
  curtidas?: CheckinLike[]
  comentarios?: CheckinComment[]
}

export interface CheckinLike {
  id: string
  checkin_id: string
  usuario_id: string
  created_at: string
  usuario?: {
    id: string
    nome: string
    avatar_url?: string
  }
}

export interface CheckinComment {
  id: string
  checkin_id: string
  usuario_id: string
  conteudo: string
  created_at: string
  usuario?: {
    id: string
    nome: string
    avatar_url?: string
  }
}

export interface CreateCheckinData {
  grupo_id: string
  foto: File
  observacao?: string
  local?: string
  data_checkin?: string // ISO string, se não fornecido usa data atual
}

export interface CheckinsResponse {
  success: boolean
  checkins?: Checkin[]
  error?: string
}

export interface CreateCheckinResponse {
  success: boolean
  checkin?: Checkin
  error?: string
}

export interface LikeCheckinResponse {
  success: boolean
  liked?: boolean
  likesCount?: number
  error?: string
}

export interface CommentCheckinResponse {
  success: boolean
  comment?: CheckinComment
  error?: string
}

export interface CommentsResponse {
  success: boolean
  comments?: CheckinComment[]
  error?: string
}