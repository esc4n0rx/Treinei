import { useState, useEffect, useCallback } from 'react';
import { GroupRanking } from '@/types/ranking';
import { Gyncana, GyncanaRanking } from '@/types/gyncana';
import { fetchGroupRanking } from '@/lib/api/ranking';
import { fetchGyncanaRanking } from '@/lib/api/gyncana';
import { useGroups } from './useGroups';
import { useAuth } from './useAuth';

export function useRanking(groupId?: string) {
  const { activeGroup } = useGroups();
  const { user } = useAuth();
  const [weeklyRanking, setWeeklyRanking] = useState<GroupRanking | null>(null);
  const [monthlyRanking, setMonthlyRanking] = useState<GroupRanking | null>(null);
  const [gyncanaRanking, setGyncanaRanking] = useState<{ usuarios: GyncanaRanking[], user_position: any, gyncana: Gyncana } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeGyncana = activeGroup?.activeGyncana;

  const loadRanking = useCallback(async () => {
    if (!groupId) return;

    setLoading(true);
    setError(null);

    try {
      if (activeGyncana) {
        const result = await fetchGyncanaRanking(groupId);
        if (result.success && result.gyncana && result.ranking) {
          const currentUserRanking = result.ranking.find(p => p.id === user?.id);
          // Corrigido: usa 'posicao' consistentemente
          const userPosition = currentUserRanking ? { posicao: currentUserRanking.posicao, checkins_count: currentUserRanking.checkins_count } : null;
          
          setGyncanaRanking({
            usuarios: result.ranking,
            user_position: userPosition,
            gyncana: result.gyncana,
          });
        } else {
          setError(result.error || 'Erro ao carregar ranking da gincana');
        }
      } else {
        const [weeklyResult, monthlyResult] = await Promise.all([
          fetchGroupRanking(groupId, 'weekly'),
          fetchGroupRanking(groupId, 'monthly'),
        ]);

        if (weeklyResult.success && weeklyResult.ranking) {
          setWeeklyRanking(weeklyResult.ranking);
        } else {
          setError(weeklyResult.error || 'Erro ao carregar ranking semanal');
        }

        if (monthlyResult.success && monthlyResult.ranking) {
          setMonthlyRanking(monthlyResult.ranking);
        } else {
          setError(monthlyResult.error || 'Erro ao carregar ranking mensal');
        }
      }
    } catch (err) {
      console.error('Erro ao carregar rankings:', err);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }, [groupId, activeGyncana, user?.id]);

  useEffect(() => {
    loadRanking();
  }, [loadRanking]);

  return {
    weeklyRanking,
    monthlyRanking,
    gyncanaRanking,
    loading,
    error,
    refresh: loadRanking,
  };
}