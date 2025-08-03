
"use client"

import { useEffect, useCallback, useRef } from 'react'
import { authStorage } from '@/lib/auth-storage'
import { refreshAuthToken } from '@/lib/api/auth-refresh'

interface UseTokenRefreshProps {
  user: any | null
  onTokenRefreshed: (tokenData: any) => void
  onLogout: () => void
}

export function useTokenRefresh({ user, onTokenRefreshed, onLogout }: UseTokenRefreshProps) {
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()
  const isRefreshingRef = useRef(false)

  const performRefresh = useCallback(async () => {
    if (isRefreshingRef.current || !user) return

    try {
      isRefreshingRef.current = true
      
      const result = await refreshAuthToken()
      
      if (result.success && result.token && result.user) {
        const tokenData = {
          token: result.token,
          user: result.user,
          refreshToken: result.refreshToken,
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
        }
        
        authStorage.setAuthData(tokenData)
        onTokenRefreshed(tokenData)

        scheduleNextRefresh()
      } else {
        console.error('❌ Falha no refresh do token:', result.error)
        onLogout()
      }
    } catch (error) {
      console.error('❌ Erro durante refresh do token:', error)
      onLogout()
    } finally {
      isRefreshingRef.current = false
    }
  }, [user, onTokenRefreshed, onLogout])

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

  const checkTokenStatus = useCallback(() => {
    if (!user) return

    if (authStorage.shouldRefreshToken()) {
      performRefresh()
    } else {
      scheduleNextRefresh()
    }
  }, [user, performRefresh, scheduleNextRefresh])

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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        const authData = authStorage.getAuthData()
        if (!authData || authData.expiresAt <= Date.now()) {
          onLogout()
        } else if (authStorage.shouldRefreshToken()) {
          performRefresh()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, performRefresh, onLogout])

  return {
    refreshToken: performRefresh,
    isRefreshing: isRefreshingRef.current,
    scheduleNextRefresh,
    checkTokenStatus
  }
}