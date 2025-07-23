// types/auth.ts
export interface User {
  id: string
  nome: string
  email: string
  avatar_url?: string
  status: 'active' | 'inactive'
  data_cadastro: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  nome: string
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  refreshToken?: string // Novo campo para refresh token
  error?: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  loginWithGoogle: () => Promise<AuthResponse>
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>
  logout: () => void
  isAuthenticated: boolean
}