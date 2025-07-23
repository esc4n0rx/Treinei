// contexts/AuthContext.tsx
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { User, AuthContextType, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth'
import { authStorage } from '@/lib/auth-storage'
import { useTokenRefresh } from '@/hooks/useTokenRefresh'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Hook para gerenciar refresh automático do token
  useTokenRefresh()

  // Verificar token armazenado na inicialização
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
  }, [])

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
        
        // Usar o novo sistema de storage
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

  const logout = () => {
    setUser(null)
    authStorage.clearAuthData()
    console.log('👋 Logout realizado')
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