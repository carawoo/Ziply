// 웹 푸시 알림 기능 (무료)
// Service Worker를 사용한 브라우저 기반 푸시 알림

// 푸시 알림 권한 요청
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (!('Notification' in window)) {
      console.log('이 브라우저는 푸시 알림을 지원하지 않습니다.')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      console.log('푸시 알림 권한이 거부되었습니다.')
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
    if ('serviceWorker' in navigator) {
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
  if (!('Notification' in window)) {
    return 'not-supported'
  }
  return Notification.permission
}

// 푸시 알림 설정 UI 컴포넌트용 훅
export const useNotificationPermission = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported('Notification' in window)
    setPermission(Notification.permission)
  }, [])

  const requestPermission = async () => {
    const granted = await requestNotificationPermission()
    setPermission(Notification.permission)
    return granted
  }

  return {
    permission,
    isSupported,
    requestPermission
  }
}
