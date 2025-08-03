import { supabase } from '@/lib/supabase'
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth'
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/types/auth'

export async function registerUser(credentials: RegisterCredentials): Promise<AuthResponse> {
  try {
    const { nome, email, password } = credentials
    const { data: existingUser } = await supabase
      .from('treinei_usuarios')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return {
        success: false,
        error: 'Email já está cadastrado'
      }
    }
    const senhaHash = await hashPassword(password)

    const { data, error } = await supabase
      .from('treinei_usuarios')
      .insert({
        nome,
        email,
        senha_hash: senhaHash,
        status: 'active',
        avatar_url: null
      })
      .select('id, nome, email, status, data_cadastro, avatar_url')
      .single()

    if (error) {
      console.error('Erro ao registrar usuário:', error)
      return {
        success: false,
        error: 'Erro interno do servidor'
      }
    }

    const user: User = {
      id: data.id,
      nome: data.nome,
      email: data.email,
      status: data.status,
      data_cadastro: data.data_cadastro,
      avatar_url: data.avatar_url
    }

    const token = generateToken(user)

    return {
      success: true,
      user,
      token
    }
  } catch (error) {
    console.error('Erro no registro:', error)
    return {
      success: false,
      error: 'Erro interno do servidor'
    }
  }
}
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const { email, password } = credentials
    const { data, error } = await supabase
      .from('treinei_usuarios')
      .select('id, nome, email, senha_hash, status, data_cadastro, avatar_url')
      .eq('email', email)
      .single()

    if (error || !data) {
      return {
        success: false,
        error: 'Email ou senha incorretos'
      }
    }
    const isValidPassword = await verifyPassword(password, data.senha_hash)
    
    if (!isValidPassword) {
      return {
        success: false,
        error: 'Email ou senha incorretos'
      }
    }
    if (data.status !== 'active') {
      return {
        success: false,
        error: 'Conta desativada. Entre em contato com o suporte.'
      }
    }

    const user: User = {
      id: data.id,
      nome: data.nome,
      email: data.email,
      status: data.status,
      data_cadastro: data.data_cadastro,
      avatar_url: data.avatar_url
    }

    const token = generateToken(user)

    return {
      success: true,
      user,
      token
    }
  } catch (error) {
    console.error('Erro no login:', error)
    return {
      success: false,
      error: 'Erro interno do servidor'
    }
  }
}
export async function loginWithGoogle(googleUser: { name: string; email: string; picture?: string }): Promise<AuthResponse> {
  try {
    const { name, email, picture } = googleUser

    const { data: existingUser } = await supabase
      .from('treinei_usuarios')
      .select('id, nome, email, status, data_cadastro, avatar_url')
      .eq('email', email)
      .single()

    let user: User

    if (existingUser) {
      if (existingUser.status !== 'active') {
        return {
          success: false,
          error: 'Conta desativada. Entre em contato com o suporte.'
        }
      }

      user = {
        id: existingUser.id,
        nome: existingUser.nome,
        email: existingUser.email,
        status: existingUser.status,
        data_cadastro: existingUser.data_cadastro,
        avatar_url: existingUser.avatar_url
      }
    } else {
      const { data, error } = await supabase
        .from('treinei_usuarios')
        .insert({
          nome: name,
          email,
          senha_hash: '',
          status: 'active',
          avatar_url: picture || null
        })
        .select('id, nome, email, status, data_cadastro, avatar_url')
        .single()

      if (error) {
        console.error('Erro ao criar usuário Google:', error)
        return {
          success: false,
          error: 'Erro interno do servidor'
        }
      }

      user = {
        id: data.id,
        nome: data.nome,
        email: data.email,
        status: data.status,
        data_cadastro: data.data_cadastro,
        avatar_url: data.avatar_url
      }
    }

    const token = generateToken(user)

    return {
      success: true,
      user,
      token
    }
  } catch (error) {
    console.error('Erro no login com Google:', error)
    return {
      success: false,
      error: 'Erro interno do servidor'
    }
  }
}