const CACHE_NAME = 'skillsync-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/logo-192.svg',
  '/logo-512.svg',
  '/manifest.json'
];

// Install Event: Cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Pre-caching App Shell assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clear outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing obsolete cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache-first fallback strategy for assets, bypass for Firestore & API endpoints
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Avoid intercepting Google Firebase Google Cloud endpoints or Firestore API
  if (
    url.hostname.includes('firebase') || 
    url.hostname.includes('firestore') || 
    url.hostname.includes('googleapis') ||
    url.pathname.startsWith('/api')
  ) {
    return; // Pass through to network natively
  }

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Cache newly requested local documents/assets dynamically if valid
        if (
          networkResponse && 
          networkResponse.status === 200 && 
          (url.origin === self.location.origin)
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for document navigation when offline
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
