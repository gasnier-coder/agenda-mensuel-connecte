const CACHE_NAME = 'Agenda mensuel connecte';
const urlsToCache = [
  './index.html',
  './manifest.json'
];

// Installation
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activation
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes avec gestion propre du réseau
self.addEventListener('fetch', (e) => {
  // On ne gère que les requêtes GET pour éviter les conflits avec Firebase (WebSocket/POST)
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        return networkResponse;
      }).catch(() => {
        // En cas d'échec réseau total, on renvoie une réponse vide ou du cache si dispo
        return new Response('Hors-ligne', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});