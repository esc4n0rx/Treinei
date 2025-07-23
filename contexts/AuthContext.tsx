// contexts/AuthContext.tsx
"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { User, AuthContextType, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth'
import { authStorage } from '@/lib/auth-storage'
import { refreshAuthToken } from '@/lib/api/auth-refresh'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()
  const isRefreshingRef = useRef(false)
  const userRef = useRef<User | null>(null)

  // Manter referência atualizada do usuário
  useEffect(() => {
    userRef.current = user
  }, [user])

  /**
   * Função de logout estável
   */
  const logout = useCallback(() => {
    setUser(null)
    authStorage.clearAuthData()
    
    // Limpar timeout de refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }
    
    console.log('👋 Logout realizado')
  }, [])

  /**
   * Executa refresh do token - função estável
   */
  const performRefresh = useCallback(async () => {
    if (isRefreshingRef.current || !userRef.current) return

    try {
      isRefreshingRef.current = true
      console.log('🔄 Iniciando refresh do token...')
      
      const result = await refreshAuthToken()
      
      if (result.success && result.token && result.user) {
        // Atualizar storage com novo token
        authStorage.setAuthData({
          token: result.token,
          user: result.user,
          refreshToken: result.refreshToken,
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 dias
        })
        
        setUser(result.user)
        console.log('✅ Token refreshed com sucesso')
        
        // Agendar próximo refresh
        scheduleNextRefresh()
      } else {
        console.error('❌ Falha no refresh do token:', result.error)
        logout()
      }
    } catch (error) {
      console.error('❌ Erro durante refresh do token:', error)
      logout()
    } finally {
      isRefreshingRef.current = false
    }
  }, [logout])

  /**
   * Agenda o próximo refresh - função estável
   */
  const scheduleNextRefresh = useCallback(() => {
    // Limpar timeout anterior
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    const authData = authStorage.getAuthData()
    if (!authData) return

    // Calcular quando fazer o próximo refresh (1 hora antes da expiração)
    const oneHour = 60 * 60 * 1000
    const timeUntilRefresh = Math.max(
      authData.expiresAt - Date.now() - oneHour,
      60000 // Mínimo de 1 minuto
    )

    console.log(`⏰ Próximo refresh em ${Math.round(timeUntilRefresh / 1000 / 60)} minutos`)

    refreshTimeoutRef.current = setTimeout(() => {
      if (authStorage.shouldRefreshToken()) {
        performRefresh()
      }
    }, timeUntilRefresh)
  }, [performRefresh])

  // Verificar token armazenado na inicialização - SEM DEPENDÊNCIAS INSTÁVEIS
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authData = authStorage.getAuthData()
        
        if (authData && authData.token && authData.user) {
          // Verificar se o token ainda é válido
          if (authData.expiresAt > Date.now()) {
            setUser(authData.user)
            console.log('✅ Usuário autenticado via storage persistente')
          } else {
            console.log('⚠️ Token expirado encontrado no storage')
            authStorage.clearAuthData()
          }
        } else {
          console.log('ℹ️ Nenhum token válido encontrado')
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error)
        authStorage.clearAuthData()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, []) // SEM DEPENDÊNCIAS - executa apenas uma vez

  // Gerenciar refresh quando usuário muda
  useEffect(() => {
    if (user) {
      // Verificar se precisa fazer refresh imediatamente
      if (authStorage.shouldRefreshToken()) {
        performRefresh()
      } else {
        scheduleNextRefresh()
      }
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [user, performRefresh, scheduleNextRefresh])

  // Verificar quando a aba volta a ficar ativa
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userRef.current) {
        // Verificar se o token expirou enquanto a aba estava inativa
        const authData = authStorage.getAuthData()
        if (!authData || authData.expiresAt <= Date.now()) {
          console.log('🔄 Token expirou enquanto app estava em background')
          logout()
        } else if (authStorage.shouldRefreshToken()) {
          performRefresh()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [performRefresh, logout])

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const result: AuthResponse = await response.json()

      if (result.success && result.user && result.token) {
        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 dias
        
        authStorage.setAuthData({
          token: result.token,
          user: result.user,
          refreshToken: result.refreshToken,
          expiresAt
        })
        
        setUser(result.user)
        console.log('✅ Login realizado com sucesso')
      }

      return result
    } catch (error) {
      console.error('Erro no login:', error)
      return {
        success: false,
        error: 'Erro de conexão. Tente novamente.'
      }
    }
  }

  const loginWithGoogle = async (): Promise<AuthResponse> => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      const googleData = {
        name: user.displayName || '',
        email: user.email || '',
        picture: user.photoURL || undefined,
      }

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleData),
      })

      const authResult: AuthResponse = await response.json()

      if (authResult.success && authResult.user && authResult.token) {
        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 dias
        
        authStorage.setAuthData({
          token: authResult.token,
          user: authResult.user,
          refreshToken: authResult.refreshToken,
          expiresAt
        })
        
        setUser(authResult.user)
        console.log('✅ Login Google realizado com sucesso')
      }

      return authResult
    } catch (error) {
      console.error('Erro no login com Google:', error)
      return {
        success: false,
        error: 'Erro ao fazer login com Google. Tente novamente.'
      }
    }
  }

  const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const result: AuthResponse = await response.json()

      if (result.success && result.user && result.token) {
        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 dias
        
        authStorage.setAuthData({
          token: result.token,
          user: result.user,
          refreshToken: result.refreshToken,
          expiresAt
        })
        
        setUser(result.user)
        console.log('✅ Registro realizado com sucesso')
      }

      return result
    } catch (error) {
      console.error('Erro no registro:', error)
      return {
        success: false,
        error: 'Erro de conexão. Tente novamente.'
      }
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext deve ser usado dentro de um AuthProvider')
  }
  return context
}