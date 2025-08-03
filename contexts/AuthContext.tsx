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

  useEffect(() => {
    userRef.current = user
  }, [user])

  const logout = useCallback(() => {
    setUser(null)
    authStorage.clearAuthData()
    
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }
    
  }, [])

  const performRefresh = useCallback(async () => {
    if (isRefreshingRef.current || !userRef.current) return

    try {
      isRefreshingRef.current = true
      
      const result = await refreshAuthToken()
      
      if (result.success && result.token && result.user) {
        authStorage.setAuthData({
          token: result.token,
          user: result.user,
          refreshToken: result.refreshToken,
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) 
        })
        
        setUser(result.user)
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

  const scheduleNextRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    const authData = authStorage.getAuthData()
    if (!authData) return

    const oneHour = 60 * 60 * 1000
    const timeUntilRefresh = Math.max(
      authData.expiresAt - Date.now() - oneHour,
      60000 
    )
    refreshTimeoutRef.current = setTimeout(() => {
      if (authStorage.shouldRefreshToken()) {
        performRefresh()
      }
    }, timeUntilRefresh)
  }, [performRefresh])

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authData = authStorage.getAuthData()
        
        if (authData && authData.token && authData.user) {
          if (authData.expiresAt > Date.now()) {
            setUser(authData.user)
          } else {
            authStorage.clearAuthData()
          }
        } else {
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
  useEffect(() => {
    if (user) {
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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userRef.current) {
        const authData = authStorage.getAuthData()
        if (!authData || authData.expiresAt <= Date.now()) {
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
        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000)
        
        authStorage.setAuthData({
          token: result.token,
          user: result.user,
          refreshToken: result.refreshToken,
          expiresAt
        })
        
        setUser(result.user)
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
        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000)
        
        authStorage.setAuthData({
          token: result.token,
          user: result.user,
          refreshToken: result.refreshToken,
          expiresAt
        })
        
        setUser(result.user)
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