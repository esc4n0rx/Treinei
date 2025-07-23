// hooks/useServiceWorkerUpdate.ts
"use client";

import { useState, useEffect, useCallback } from 'react';

interface ServiceWorkerUpdateOptions {
  checkIntervalMs?: number;
  showPrompt?: boolean;
}

export function useServiceWorkerUpdate(options: ServiceWorkerUpdateOptions = {}) {
  const { checkIntervalMs = 30000, showPrompt = true } = options;
  
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Função para verificar por atualizações
  const checkForUpdates = useCallback(async () => {
    if (!registration) return;

    try {
      await registration.update();
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    }
  }, [registration]);

  // Função para aplicar a atualização
  const applyUpdate = useCallback(async () => {
    if (!registration?.waiting) return;

    setIsUpdating(true);

    // Enviar mensagem para o service worker ativo
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Aguardar a ativação do novo service worker
    const refreshTimeout = setTimeout(() => {
      window.location.reload();
    }, 1000);

    // Limpar timeout se a página for recarregada antes
    const handleControllerChange = () => {
      clearTimeout(refreshTimeout);
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      clearTimeout(refreshTimeout);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, [registration]);

  // Registrar e configurar service worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        setRegistration(reg);

        // Verificar se há uma atualização esperando
        if (reg.waiting) {
          setUpdateAvailable(true);
        }

        // Escutar por novas atualizações
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });

        // Verificar se um novo service worker assumiu o controle
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

      } catch (error) {
        console.error('Erro ao registrar service worker:', error);
      }
    };

    registerSW();
  }, []);

  // Verificação periódica de atualizações
  useEffect(() => {
    const interval = setInterval(checkForUpdates, checkIntervalMs);
    return () => clearInterval(interval);
  }, [checkForUpdates, checkIntervalMs]);

  // Verificar atualizações quando a página volta ao foco
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkForUpdates]);

  return {
    updateAvailable,
    isUpdating,
    applyUpdate,
    checkForUpdates,
  };
}