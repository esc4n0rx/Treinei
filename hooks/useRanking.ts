import { useState, useEffect, useCallback } from 'react'
import { GroupRanking } from '@/types/ranking'
import { fetchGroupRanking } from '@/lib/api/ranking'

export function useRanking(groupId?: string) {
  const [weeklyRanking, setWeeklyRanking] = useState<GroupRanking | null>(null)
  const [monthlyRanking, setMonthlyRanking] = useState<GroupRanking | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRanking = useCallback(async (period: 'weekly' | 'monthly') => {
    if (!groupId) return

    try {
      setLoading(true)
      setError(null)

      const result = await fetchGroupRanking(groupId, period)

      if (result.success && result.ranking) {
        if (period === 'weekly') {
          setWeeklyRanking(result.ranking)
        } else {
          setMonthlyRanking(result.ranking)
        }
      } else {
        setError(result.error || 'Erro ao carregar ranking')
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error)
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }, [groupId])

  const loadBothRankings = useCallback(async () => {
    if (!groupId) return

    setLoading(true)
    await Promise.all([
      loadRanking('weekly'),
      loadRanking('monthly')
    ])
    setLoading(false)
  }, [groupId, loadRanking])

  useEffect(() => {
    if (groupId) {
      loadBothRankings()
    }
  }, [groupId, loadBothRankings])

  return {
    weeklyRanking,
    monthlyRanking,
    loading,
    error,
    refresh: loadBothRankings,
    loadRanking
  }
}