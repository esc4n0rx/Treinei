"use client";

import { useState, useEffect } from 'react';
import { useGroups } from './useGroups';
import { WinnerInfo } from '@/types/gyncana';

export function useGyncanaWinner() {
  const { activeGroup } = useGroups();
  const [winnerInfo, setWinnerInfo] = useState<WinnerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkWinner = async () => {
      if (!activeGroup?.id) {
        setIsLoading(false);
        return;
      }
      const checkedKey = `gyncana_winner_checked_${activeGroup.id}`;
      if (sessionStorage.getItem(checkedKey)) {
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('treinei_token');
        const response = await fetch('/api/gyncana/check-winner', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ groupId: activeGroup.id }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setWinnerInfo(result.data);
          }
          sessionStorage.setItem(checkedKey, 'true');
        }
      } catch (error) {
        console.error("Falha ao verificar vencedor da gincana:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkWinner();
  }, [activeGroup?.id]);

  const clearWinner = () => {
    setWinnerInfo(null);
  };

  return { winnerInfo, isLoading, clearWinner };
}