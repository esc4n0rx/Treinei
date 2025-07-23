import { User } from './auth'

export interface UserProfile extends User {
  grupos_count: number
  checkins_totais: number
  checkins_semanal: number
  checkins_mensal: number
  ranking_semanal?: number
  ranking_mensal?: number
  melhor_streak: number
  ultimo_checkin?: string
  data_ultima_atividade?: string
  grupos?: {
    id: string
    nome: string
    papel: 'administrador' | 'membro'
  }[]
}

export interface UserStats {
  total_checkins: number
  weekly_checkins: number
  monthly_checkins: number
  grupos_count: number
  melhor_streak: number
  ultimo_checkin?: string
}

export interface ProfileResponse {
  success: boolean
  profile?: UserProfile
  error?: string
}