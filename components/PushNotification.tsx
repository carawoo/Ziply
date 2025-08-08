'use client'

import { useState, useEffect } from 'react'
import { requestNotificationPermission, getNotificationStatus, registerServiceWorker } from '@/lib/client-notification'

// 푸시 알림 설정 UI 컴포넌트용 훅
export const useNotificationPermission = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsSupported('Notification' in window)
    setPermission(getNotificationStatus() as NotificationPermission)
    
    // 기존 구독 확인
    checkExistingSubscription()
  }, [])

  const checkExistingSubscription = async () => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          const existingSubscription = await registration.pushManager.getSubscription()
          setSubscription(existingSubscription)
        }
      }
    } catch (error) {
      console.error('기존 구독 확인 오류:', error)
    }
  }

  const requestPermission = async () => {
    try {
      setLoading(true)
      
      // 권한 요청
      const granted = await requestNotificationPermission()
      setPermission(getNotificationStatus() as NotificationPermission)
      
      if (granted) {
        // Service Worker 등록
        const registration = await registerServiceWorker()
        if (registration) {
          // 푸시 알림 구독
          const newSubscription = await subscribeToPush(registration)
          setSubscription(newSubscription)
          return true
        }
      }
      
      return granted
    } catch (error) {
      console.error('푸시 알림 권한 요청 오류:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const subscribeToPush = async (registration: ServiceWorkerRegistration) => {
    try {
      // 기존 구독 확인
      const existingSubscription = await registration.pushManager.getSubscription()
      if (existingSubscription) {
        return existingSubscription
      }

      // 새 구독 생성
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      // 구독 정보를 서버에 저장
      await saveSubscriptionToServer(newSubscription)

      return newSubscription
    } catch (error) {
      console.error('푸시 알림 구독 오류:', error)
      throw error
    }
  }

  const saveSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      const response = await fetch('/api/push-notification', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription })
      })

      if (!response.ok) {
        throw new Error('구독 정보 저장 실패')
      }

      console.log('푸시 알림 구독 정보가 서버에 저장되었습니다.')
    } catch (error) {
      console.error('구독 정보 저장 오류:', error)
      throw error
    }
  }

  const unsubscribeFromPush = async () => {
    try {
      setLoading(true)
      
      if (subscription) {
        await subscription.unsubscribe()
        setSubscription(null)
        console.log('푸시 알림 구독이 해지되었습니다.')
      }
    } catch (error) {
      console.error('푸시 알림 구독 해지 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    permission,
    isSupported,
    subscription,
    loading,
    requestPermission,
    unsubscribeFromPush
  }
}

// 푸시 알림 설정 컴포넌트
export default function PushNotification() {
  const { permission, isSupported, subscription, loading, requestPermission, unsubscribeFromPush } = useNotificationPermission()

  if (!isSupported) {
    return (
      <div style={{ 
        background: '#fef3c7', 
        padding: '12px', 
        borderRadius: '6px',
        fontSize: '14px',
        color: '#92400e'
      }}>
        이 브라우저는 푸시 알림을 지원하지 않습니다.
      </div>
    )
  }

  if (permission === 'granted' && subscription) {
    return (
      <div style={{ 
        background: '#d1fae5', 
        padding: '12px', 
        borderRadius: '6px',
        fontSize: '14px',
        color: '#065f46'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✅ 푸시 알림이 활성화되어 있습니다.</span>
          <button
            onClick={unsubscribeFromPush}
            disabled={loading}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '10px'
            }}
          >
            {loading ? '해지 중...' : '구독 해지'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      background: '#fef3c7', 
      padding: '12px', 
      borderRadius: '6px',
      fontSize: '14px',
      color: '#92400e'
    }}>
      <p style={{ margin: '0 0 8px 0' }}>
        📱 푸시 알림을 받아보시겠습니까?
      </p>
      <button
        onClick={requestPermission}
        disabled={loading}
        style={{
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '12px'
        }}
      >
        {loading ? '처리 중...' : '알림 허용하기'}
      </button>
    </div>
  )
}
