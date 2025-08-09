// Service Worker for Push Notifications
// 웹 푸시 알림을 처리하는 Service Worker

const CACHE_NAME = 'real-estate-news-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/newsletter'
]

// Service Worker 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('캐시가 열렸습니다.')
        return cache.addAll(urlsToCache)
      })
  )
})

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('이전 캐시 삭제:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// 푸시 알림 수신 처리
self.addEventListener('push', (event) => {
  console.log('푸시 알림 수신:', event)
  
  let notificationData = {
    title: 'Ziply',
    body: '새로운 뉴스가 도착했습니다!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'newsletter',
    data: {
      url: 'https://ziply-nine.vercel.app/dashboard'
    }
  }

  // 서버에서 전송된 데이터가 있으면 사용
  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = { ...notificationData, ...data }
    } catch (error) {
      console.error('푸시 데이터 파싱 오류:', error)
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    notificationData
  )

  event.waitUntil(promiseChain)
})

// 푸시 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('푸시 알림 클릭:', event)
  
  event.notification.close()

  const urlToOpen = event.notification.data?.url || 'https://ziply-nine.vercel.app'

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // 이미 열린 탭이 있는지 확인
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      
      // 새 탭 열기
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('백그라운드 동기화 실행')
    event.waitUntil(doBackgroundSync())
  }
})

// 백그라운드 동기화 작업
async function doBackgroundSync() {
  try {
    // 백그라운드에서 실행할 작업들
    console.log('백그라운드에서 뉴스 업데이트 확인 중...')
    
    // 여기에 실제 백그라운드 작업 로직 추가
    // 예: 뉴스 API 호출, 캐시 업데이트 등
    
  } catch (error) {
    console.error('백그라운드 동기화 오류:', error)
  }
}

// 메시지 수신 처리 (메인 스레드와 통신)
self.addEventListener('message', (event) => {
  console.log('Service Worker 메시지 수신:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
