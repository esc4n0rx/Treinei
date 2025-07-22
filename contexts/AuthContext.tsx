"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { User, AuthContextType, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Verificar token armazenado na inicialização
  useEffect(() => {
    const token = localStorage.getItem('treinei_token')
    const userData = localStorage.getItem('treinei_user')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error)
        localStorage.removeItem('treinei_token')
        localStorage.removeItem('treinei_user')
      }
    }
    
    setLoading(false)
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
        setUser(result.user)
        localStorage.setItem('treinei_token', result.token)
        localStorage.setItem('treinei_user', JSON.stringify(result.user))
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
        setUser(authResult.user)
        localStorage.setItem('treinei_token', authResult.token)
        localStorage.setItem('treinei_user', JSON.stringify(authResult.user))
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
        setUser(result.user)
        localStorage.setItem('treinei_token', result.token)
        localStorage.setItem('treinei_user', JSON.stringify(result.user))
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
    localStorage.removeItem('treinei_token')
    localStorage.removeItem('treinei_user')
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