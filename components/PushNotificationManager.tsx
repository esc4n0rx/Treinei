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
    if (!isAuthenticated || typeof window === 'undefined') {
      return;
    }

    const requestPermissionAndGetToken = async () => {
      if (!messaging) {
        console.error("Firebase Messaging não está inicializado.");
        return;
      }

      try {
        // 1. Solicitar permissão
        console.log('Solicitando permissão para notificações...');
        const permission = await Notification.requestPermission();
        console.log('Status da permissão:', permission);

        if (permission !== 'granted') {
          console.log('Permissão para notificações negada.');
          return;
        }

        // 2. Obter VAPID key do environment
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.error("VAPID public key não está definida. Verifique o nome da variável de ambiente.");
          return;
        }

        // 3. Obter o token FCM
        console.log('Obtendo token FCM...');
        const fcmToken = await getToken(messaging, { vapidKey });

        if (fcmToken) {
          console.log('Token FCM obtido com sucesso:', fcmToken);
          // 4. Enviar token para o backend
          await sendTokenToServer(fcmToken);
        } else {
          console.log('Não foi possível obter o token FCM. O Service Worker está registrado corretamente?');
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
        console.log('Enviando token para o servidor...');
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
            console.log('Token já registrado no servidor.');
          }
        } else {
          console.log('Token FCM enviado para o servidor com sucesso.');
        }
      } catch (error) {
        console.error('Erro ao enviar token FCM para o servidor:', error);
      }
    };

    // Adiciona um delay de 5 segundos para não pedir permissão imediatamente
    const timeoutId = setTimeout(() => {
        requestPermissionAndGetToken();
    }, 5000);

    return () => clearTimeout(timeoutId); // Limpa o timeout se o componente for desmontado

  }, [isAuthenticated]);

  return null; // Este componente não renderiza nada na UI
}