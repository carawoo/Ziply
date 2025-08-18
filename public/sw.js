// Service Worker 완전 비활성화 - 캐싱 없음
console.log('[SW] Service Worker loaded - no caching');

self.addEventListener('install', (e) => {
  console.log('[SW] Installing - skipping waiting');
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    // 모든 기존 캐시 삭제
    caches.keys().then((cacheNames) => {
      console.log('[SW] Clearing all caches:', cacheNames);
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[SW] All caches cleared, claiming clients');
      return self.clients.claim();
    })
  );
});

// fetch 이벤트는 캐싱 없이 그대로 네트워크 요청
self.addEventListener('fetch', (e) => {
  // 네트워크 요청을 그대로 통과시킴 (캐싱 없음)
  e.respondWith(fetch(e.request));
});