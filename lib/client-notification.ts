// 클라이언트 사이드 전용 푸시 알림 함수들

// 푸시 알림 권한 요청 (클라이언트 사이드 전용)
export const requestNotificationPermission = async (): Promise<boolean> => {
  // 클라이언트 사이드에서만 실행
  if (typeof window === 'undefined') {
    console.warn('requestNotificationPermission은 클라이언트 사이드에서만 실행되어야 합니다.')
    return false
  }

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

// 푸시 알림 발송 (클라이언트 사이드 전용)
export const sendPushNotification = (
  title: string,
  options: NotificationOptions = {}
) => {
  // 클라이언트 사이드에서만 실행
  if (typeof window === 'undefined') {
    console.warn('sendPushNotification은 클라이언트 사이드에서만 실행되어야 합니다.')
    return null
  }

  try {
    if (Notification.permission === 'granted') {
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

// 뉴스레터 푸시 알림 발송 (클라이언트 사이드 전용)
export const sendNewsletterPushNotification = (newsItems: any[]) => {
  // 클라이언트 사이드에서만 실행
  if (typeof window === 'undefined') {
    console.warn('sendNewsletterPushNotification은 클라이언트 사이드에서만 실행되어야 합니다.')
    return null
  }

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

// Service Worker 등록 (클라이언트 사이드 전용)
export const registerServiceWorker = async () => {
  // 클라이언트 사이드에서만 실행
  if (typeof window === 'undefined') {
    console.warn('registerServiceWorker는 클라이언트 사이드에서만 실행되어야 합니다.')
    return null
  }

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker 등록 성공:', registration)
      return registration
    }
  } catch (error) {
    console.error('Service Worker 등록 실패:', error)
  }
}

// 푸시 알림 설정 상태 확인 (클라이언트 사이드 전용)
export const getNotificationStatus = () => {
  // 클라이언트 사이드에서만 실행
  if (typeof window === 'undefined') {
    return 'not-supported'
  }

  if (!('Notification' in window)) {
    return 'not-supported'
  }
  return Notification.permission
}
