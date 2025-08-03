// Altere esta versão sempre que fizer deploy de uma nova atualização.
const CACHE_VERSION = 'treinei-static-v8';

const STATIC_RESOURCES = [
  '/',
  '/dashboard',
  '/groups',
  '/checkins',
  '/ranking',
  '/profile',
  '/offline.html',
  '/manifest.json',
  '/logo.png',
  '/notification.png'
];


self.addEventListener('install', (event) => {
  console.log(`[SW] Instalando a versão: ${CACHE_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => {
        return Promise.all(
          STATIC_RESOURCES.map(url => {
            return cache.add(url).catch(reason => {
              console.warn(`[SW] Falha ao cachear ${url}:`, reason);
            });
          })
        );
      })
      .then(() => {
        self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log(`[SW] Ativando a versão: ${CACHE_VERSION}`);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_VERSION) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }
  
  if (request.url.includes('/api/') || request.url.includes('firebase-messaging-sw.js')) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          return networkResponse;
        });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Recebida mensagem para pular a espera.');
    self.skipWaiting();
  }
});