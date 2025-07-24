// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL e Key são obrigatórios')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos para a tabela de usuários
export interface DatabaseUser {
  id: string
  nome: string
  email: string
  senha_hash: string
  status: 'active' | 'inactive'
  data_cadastro: string
  avatar_url: string | null
}

// Tipos para a tabela de grupos
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

// Tipos para a tabela de membros dos grupos
export interface DatabaseGroupMember {
  id: string
  grupo_id: string
  usuario_id: string
  papel: 'administrador' | 'membro'
  data_entrada: string
  status: 'ativo' | 'inativo'
}

// NOVO: Tipo para a tabela de inscrições push
export interface PushSubscription {
  id: number
  user_id: string
  fcm_token: string // Apenas o token FCM
  created_at: string
}