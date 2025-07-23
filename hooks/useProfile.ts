import { useState, useEffect, useCallback } from 'react'
import { UserProfile } from '@/types/profile'
import { fetchUserProfile } from '@/lib/api/profile'

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await fetchUserProfile()

      if (result.success && result.profile) {
        setProfile(result.profile)
      } else {
        setError(result.error || 'Erro ao carregar perfil')
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  return {
    profile,
    loading,
    error,
    refresh: loadProfile
  }
}