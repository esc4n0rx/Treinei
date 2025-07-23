// hooks/useUserProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { PublicUserProfile } from '@/types/users';
import { fetchUserProfileWithCheckins } from '@/lib/api/users';

export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await fetchUserProfileWithCheckins(userId);

      if (result.success && result.profile) {
        setProfile(result.profile);
      } else {
        setError(result.error || 'Erro ao carregar perfil');
      }
    } catch (err) {
      console.error('Erro no hook useUserProfile:', err);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    refresh: loadProfile
  };
}