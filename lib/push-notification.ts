import webpush from 'web-push'

// VAPID 키 설정
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

// 푸시 알림 권한 요청
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (!('Notification' in window)) {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  } catch (error) {
    console.error('푸시 알림 권한 요청 오류:', error)
    return false
  }
}

// 푸시 알림 발송
export const sendPushNotification = (
  title: string,
  options: NotificationOptions = {}
) => {
  try {
    if (typeof window !== 'undefined' && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })

      // 알림 클릭 시 웹사이트로 이동
      notification.onclick = () => {
        window.focus()
        window.open('https://ziply-nine.vercel.app/', '_blank')
        notification.close()
      }

      // 5초 후 자동으로 닫기
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    }
  } catch (error) {
    console.error('푸시 알림 발송 오류:', error)
  }
}

// 뉴스레터 푸시 알림 발송
export const sendNewsletterPushNotification = (newsItems: any[]) => {
  const title = '📈 오늘의 부동산 뉴스'
  const body = `${newsItems.length}개의 새로운 부동산 뉴스가 도착했습니다!`
  
  return sendPushNotification(title, {
    body,
    tag: 'newsletter', // 같은 태그의 알림은 하나만 표시
    requireInteraction: false,
    data: {
      url: 'https://ziply-nine.vercel.app/dashboard/'
    }
  })
}

// Service Worker 등록 (브라우저에서만 실행)
export const registerServiceWorker = async () => {
  try {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker 등록 성공:', registration)
      return registration
    }
  } catch (error) {
    console.error('Service Worker 등록 실패:', error)
  }
}

// 푸시 알림 설정 상태 확인
export const getNotificationStatus = () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'not-supported'
  }
  return Notification.permission
}

// 서버 사이드 푸시 알림 발송
export const sendServerPushNotification = async (
  subscription: any,
  payload: any
) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return true
  } catch (error) {
    console.error('서버 푸시 알림 발송 실패:', error)
    return false
  }
}
