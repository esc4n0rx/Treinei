// components/PushNotificationManager.tsx
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';
import { toast } from 'sonner';

export function PushNotificationManager() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // A verificação inicial já previne a execução se messaging for nulo
    if (!isAuthenticated || typeof window === 'undefined' || !messaging) {
      return;
    }

    const requestPermissionAndGetToken = async () => {
      // Adicionamos uma verificação de segurança para o TypeScript
      if (!messaging) {
        console.error("Firebase Messaging não está inicializado.");
        return;
      }

      try {
        // 1. Solicitar permissão
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Permissão para notificações negada.');
          return;
        }

        // 2. Obter VAPID key do environment
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
          console.error("VAPID public key não está definida.");
          return;
        }

        // 3. Obter o token FCM - Agora seguro contra nulos
        const fcmToken = await getToken(messaging, { vapidKey });

        if (fcmToken) {
          console.log('FCM Token:', fcmToken);
          // 4. Enviar token para o backend
          await sendTokenToServer(fcmToken);
        } else {
          console.log('Não foi possível obter o token FCM.');
        }

      } catch (error) {
        console.error('Erro ao obter token FCM:', error);
        toast.error('Não foi possível habilitar as notificações.');
      }
    };

    const sendTokenToServer = async (fcm_token: string) => {
      try {
        const authToken = localStorage.getItem('treinei_token');
        const response = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ fcm_token }),
        });

        if (!response.ok) {
          const data = await response.json();
          // Não mostrar erro se o dispositivo já está registrado (409 Conflict)
          if (response.status !== 409) {
             toast.error(data.error || 'Erro ao registrar para notificações.');
          }
        } else {
          console.log('Token FCM enviado para o servidor com sucesso.');
        }
      } catch (error) {
        console.error('Erro ao enviar token FCM para o servidor:', error);
      }
    };

    requestPermissionAndGetToken();

  }, [isAuthenticated]);

  return null; // Este componente não renderiza nada na UI
}