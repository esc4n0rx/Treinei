// public/sw.js

// A versão do cache é um identificador único para o conjunto de assets do seu app.
// Altere esta versão sempre que fizer deploy de uma nova atualização.
const CACHE_VERSION = 'treinei-static-v2';

// Lista de recursos essenciais para o funcionamento offline do app.
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

/**
 * Evento de instalação:
 * Ocorre quando o Service Worker é instalado pela primeira vez ou quando uma nova versão é detectada.
 */
self.addEventListener('install', (event) => {
  console.log(`[SW] Instalando a versão: ${CACHE_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => {
        console.log('[SW] Cacheando recursos estáticos...');
        // Opcional: Adiciona recursos um por um para melhor depuração em caso de falha.
        return Promise.all(
          STATIC_RESOURCES.map(url => {
            return cache.add(url).catch(reason => {
              console.warn(`[SW] Falha ao cachear ${url}:`, reason);
            });
          })
        );
      })
      .then(() => {
        // Força o novo Service Worker a se tornar ativo imediatamente.
        self.skipWaiting();
        console.log('[SW] Instalação completa.');
      })
  );
});

/**
 * Evento de ativação:
 * Ocorre após a instalação e quando o SW assume o controle da página.
 * É o momento ideal para limpar caches antigos.
 */
self.addEventListener('activate', (event) => {
  console.log(`[SW] Ativando a versão: ${CACHE_VERSION}`);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Se o nome do cache não for o atual, ele será deletado.
            if (cacheName !== CACHE_VERSION) {
              console.log(`[SW] Deletando cache antigo: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Garante que o SW ativado assuma o controle de todos os clientes abertos.
        return self.clients.claim();
      })
  );
});

/**
 * Evento de fetch:
 * Intercepta todas as requisições de rede da página.
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignora requisições que não são GET ou de outras origens (ex: API do Supabase, Cloudinary)
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Ignora requisições para a API interna e para o SW do Firebase
  if (request.url.includes('/api/') || request.url.includes('firebase-messaging-sw.js')) {
    return;
  }

  // Estratégia: Network Falling Back to Cache para páginas de navegação.
  // Tenta buscar da rede primeiro para obter a versão mais recente da página.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Se a rede falhar, serve a página de offline.
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // Estratégia: Cache First para assets estáticos (CSS, JS, imagens).
  // Serve do cache se disponível, para performance máxima.
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Se encontrar no cache, retorna a resposta cacheada.
        if (cachedResponse) {
          return cachedResponse;
        }
        // Se não, busca na rede.
        return fetch(request).then((networkResponse) => {
          // Opcional: Cacheia dinamicamente novos assets se necessário.
          // const responseClone = networkResponse.clone();
          // caches.open(CACHE_VERSION).then(cache => cache.put(request, responseClone));
          return networkResponse;
        });
      })
  );
});

/**
 * Evento de mensagem:
 * Escuta por mensagens da aplicação principal, como o comando para pular a espera.
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Recebida mensagem para pular a espera.');
    self.skipWaiting();
  }
});