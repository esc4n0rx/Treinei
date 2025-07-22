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