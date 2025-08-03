
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';
import { toast } from 'sonner';

export function PushNotificationManager() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') {
      return;
    }

    const requestPermissionAndGetToken = async () => {
      if (!messaging) {
        console.error("Firebase Messaging não está inicializado.");
        return;
      }

      try {
        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
          console.log('Permissão para notificações negada.');
          return;
        }
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          return;
        }
        const fcmToken = await getToken(messaging, { vapidKey });

        if (fcmToken) {
          await sendTokenToServer(fcmToken);
        } else {
          toast.error('Não foi possível registrar para notificações. Tente limpar o cache do navegador.');
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
          if (response.status !== 409) {
             toast.error(data.error || 'Erro ao registrar para notificações.');
          } else {
          }
        } else {
        }
      } catch (error) {
        console.error('Erro ao enviar token FCM para o servidor:', error);
      }
    };

    const timeoutId = setTimeout(() => {
        requestPermissionAndGetToken();
    }, 5000);

    return () => clearTimeout(timeoutId);

  }, [isAuthenticated]);

  return null;
}