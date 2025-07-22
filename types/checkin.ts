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