import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL e Key são obrigatórios')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface DatabaseUser {
  id: string
  nome: string
  email: string
  senha_hash: string
  status: 'active' | 'inactive'
  data_cadastro: string
  avatar_url: string | null
}
export interface DatabaseGroup {
  id: string
  nome: string
  descricao: string | null
  logo_url: string | null
  tipo: 'publico' | 'privado'
  senha_hash: string | null
  administrador_id: string
  data_criacao: string
  status: 'ativo' | 'inativo'
  max_membros: number | null
}
export interface DatabaseGroupMember {
  id: string
  grupo_id: string
  usuario_id: string
  papel: 'administrador' | 'membro'
  data_entrada: string
  status: 'ativo' | 'inativo'
}
export interface PushSubscription {
  id: number
  user_id: string
  fcm_token: string 
  created_at: string
}