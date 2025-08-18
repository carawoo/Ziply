const CACHE = 'ziply-v2';
const urlsToCache = ['/favicon.ico']; // 최소한의 캐싱만

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[SW] precache skipped:', err);
      })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    // 이전 캐시 버전 삭제
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});