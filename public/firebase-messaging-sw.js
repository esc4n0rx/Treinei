// public/firebase-messaging-sw.js

// Importe os scripts necessários do Firebase.
// ATENÇÃO: Use a importação legada para compatibilidade máxima em service workers.
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

//
// ** IMPORTANTE: SUBSTITUA OS VALORES ABAIXO PELAS SUAS CREDENCIAIS DO FIREBASE **
// (Você pode copiar e colar do seu arquivo .env.local)
//
const firebaseConfig = {
  apiKey: "AIzaSyBDM2TVs1nMcDm3QH0OPom3jevk8RqJTxM",
  authDomain: "treinei-242d8.firebaseapp.com",
  projectId: "treinei-242d8",
  storageBucket: "treinei-242d8.firebasestorage.app",
  messagingSenderId: "601954634653",
  appId: "1:601954634653:web:a6f03b90507cb4cec63d74",
};

// Inicializa o Firebase
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Mensagem recebida em segundo plano: ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || '/notification.png',
    badge: '/notification.png',
    data: {
      url: payload.fcmOptions.link || '/' // O link vem da sua função da Supabase
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Opcional: Adiciona um listener para o clique na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      // Se uma janela do app já estiver aberta, foque nela
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não, abra uma nova janela
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});