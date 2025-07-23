export interface RankingUser {
  id: string
  nome: string
  avatar_url?: string
  checkins_count: number
  posicao: number
  usuario?: {
    id: string
    nome: string
    avatar_url?: string
  }
}

export interface GroupRanking {
  periodo: 'weekly' | 'monthly'
  usuarios: RankingUser[]
  user_position?: {
    posicao: number
    checkins_count: number
  }
}

export interface RankingResponse {
  success: boolean
  ranking?: GroupRanking
  error?: string
}

export interface UserRankingStats {
  weekly_position: number | null
  monthly_position: number | null
  weekly_checkins: number
  monthly_checkins: number
  total_checkins: number
}