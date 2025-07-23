// hooks/useTokenRefresh.ts
"use client"

import { useEffect, useCallback, useRef } from 'react'
import { authStorage } from '@/lib/auth-storage'
import { refreshAuthToken } from '@/lib/api/auth-refresh'
import { useAuth } from '@/hooks/useAuth'

export function useTokenRefresh() {
  const { user, logout } = useAuth()
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()
  const isRefreshingRef = useRef(false)

  /**
   * Executa refresh do token
   */
  const performRefresh = useCallback(async () => {
    if (isRefreshingRef.current || !user) return

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
        
        console.log('✅ Token refreshed com sucesso')
        scheduleNextRefresh()
      } else {
        console.error('❌ Falha no refresh do token:', result.error)
        // Token não pode ser renovado, fazer logout
        logout()
      }
    } catch (error) {
      console.error('❌ Erro durante refresh do token:', error)
      logout()
    } finally {
      isRefreshingRef.current = false
    }
  }, [user, logout])

  /**
   * Agenda o próximo refresh baseado na expiração do token
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

  /**
   * Verifica imediatamente se precisa fazer refresh
   */
  const checkTokenStatus = useCallback(() => {
    if (!user) return

    if (authStorage.shouldRefreshToken()) {
      performRefresh()
    } else {
      scheduleNextRefresh()
    }
  }, [user, performRefresh, scheduleNextRefresh])

  // Verificar status do token quando o usuário está logado
  useEffect(() => {
    if (user) {
      checkTokenStatus()
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [user, checkTokenStatus])

  // Verificar quando a aba volta a ficar ativa (importante para PWAs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
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
  }, [user, performRefresh, logout])

  return {
    refreshToken: performRefresh,
    isRefreshing: isRefreshingRef.current
  }
}