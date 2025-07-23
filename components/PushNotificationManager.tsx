"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const { isAuthenticated } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    const subscribeUser = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          setIsSubscribed(true);
          // Opcional: Enviar a inscrição para o backend a cada carregamento para garantir que está atualizada.
          // await fetch('/api/subscriptions', { ... }); 
          return;
        }

        const permission = await window.Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Permissão para notificações negada.');
          return;
        }

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.error("VAPID public key não está definida.");
          return;
        }

        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });

        const token = localStorage.getItem('treinei_token');
        const response = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(subscription),
        });

        if (response.ok) {
          setIsSubscribed(true);
          toast.success('Você receberá notificações importantes!');
        } else {
          toast.error('Erro ao registrar para notificações.');
          await subscription.unsubscribe();
        }

      } catch (error) {
        console.error('Erro ao se inscrever para notificações push:', error);
      }
    };

    subscribeUser();

  }, [isAuthenticated]);

  return null; // Este componente não renderiza nada na UI
}