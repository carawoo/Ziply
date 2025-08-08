// 서버 사이드 푸시 알림 발송 (서버 사이드 전용)
export const sendServerPushNotification = async (
  subscription: any,
  payload: any
) => {
  // 서버 사이드에서만 실행
  if (typeof window !== 'undefined') {
    console.warn('sendServerPushNotification은 서버 사이드에서만 실행되어야 합니다.')
    return false
  }

  try {
    // 동적 import로 서버 사이드에서만 실행
    const webpush = await import('web-push')
    
    // VAPID 키 설정
    webpush.default.setVapidDetails(
      'mailto:your-email@example.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
      process.env.VAPID_PRIVATE_KEY || ''
    )
    
    await webpush.default.sendNotification(subscription, JSON.stringify(payload))
    return true
  } catch (error) {
    console.error('서버 푸시 알림 발송 실패:', error)
    return false
  }
}
