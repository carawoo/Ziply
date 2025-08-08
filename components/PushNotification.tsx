'use client'

import { useEffect, useState } from 'react'

interface PushNotificationProps {
  onSubscriptionChange?: (subscription: PushSubscription | null) => void
}

export default function PushNotification({ onSubscriptionChange }: PushNotificationProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 브라우저 지원 여부 확인
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window
      setIsSupported(supported)
      
      if (supported) {
        setPermission(Notification.permission)
      }
    }

    checkSupport()
  }, [])

  // Service Worker 등록
  const registerServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker 등록 성공:', registration)
        return registration
      }
    } catch (error) {
      console.error('Service Worker 등록 실패:', error)
      throw error
    }
  }

  // 푸시 알림 권한 요청
  const requestPermission = async () => {
    try {
      if (!isSupported) {
        alert('이 브라우저는 푸시 알림을 지원하지 않습니다.')
        return false
      }

      const permission = await Notification.requestPermission()
      setPermission(permission)
      
      if (permission === 'granted') {
        await subscribeToPush()
        return true
      } else {
        alert('푸시 알림 권한이 거부되었습니다.')
        return false
      }
    } catch (error) {
      console.error('푸시 알림 권한 요청 오류:', error)
      return false
    }
  }

  // 푸시 알림 구독
  const subscribeToPush = async () => {
    try {
      setLoading(true)
      
      const registration = await registerServiceWorker()
      
      if (!registration) {
        throw new Error('Service Worker 등록 실패')
      }

      const existingSubscription = await registration.pushManager.getSubscription()
      
      if (existingSubscription) {
        setSubscription(existingSubscription)
        onSubscriptionChange?.(existingSubscription)
        return existingSubscription
      }

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      setSubscription(newSubscription)
      onSubscriptionChange?.(newSubscription)

      // 구독 정보를 서버에 저장
      await fetch('/api/push-notification', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription: newSubscription })
      })

      console.log('푸시 알림 구독 완료:', newSubscription)
      return newSubscription

    } catch (error) {
      console.error('푸시 알림 구독 오류:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 푸시 알림 구독 해지
  const unsubscribeFromPush = async () => {
    try {
      setLoading(true)
      
      if (subscription) {
        await subscription.unsubscribe()
        setSubscription(null)
        onSubscriptionChange?.(null)
        console.log('푸시 알림 구독 해지 완료')
      }
    } catch (error) {
      console.error('푸시 알림 구독 해지 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  // 테스트 푸시 알림 발송
  const sendTestNotification = async () => {
    try {
      if (!subscription) {
        alert('먼저 푸시 알림을 구독해주세요.')
        return
      }

      const response = await fetch('/api/push-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          title: '🔔 푸시 알림 테스트',
          body: '웹 푸시 알림이 정상적으로 작동합니다!',
          data: {
            url: 'https://ziply-nine.vercel.app/dashboard'
          }
        })
      })

      if (response.ok) {
        alert('테스트 푸시 알림이 발송되었습니다!')
      } else {
        alert('푸시 알림 발송에 실패했습니다.')
      }
    } catch (error) {
      console.error('테스트 푸시 알림 발송 오류:', error)
      alert('푸시 알림 발송 중 오류가 발생했습니다.')
    }
  }

  if (!isSupported) {
    return (
      <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '8px', marginBottom: '16px' }}>
        <p style={{ color: '#dc2626', margin: 0 }}>
          ⚠️ 이 브라우저는 웹 푸시 알림을 지원하지 않습니다.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px' }}>
        🔔 웹 푸시 알림 설정
      </h3>
      
      <div style={{ marginBottom: '16px' }}>
        <p style={{ color: '#6b7280', margin: '0 0 8px 0', fontSize: '14px' }}>
          상태: {permission === 'granted' ? '✅ 권한 허용됨' : permission === 'denied' ? '❌ 권한 거부됨' : '⏳ 권한 요청 대기'}
        </p>
        <p style={{ color: '#6b7280', margin: '0 0 8px 0', fontSize: '14px' }}>
          구독: {subscription ? '✅ 구독됨' : '❌ 구독되지 않음'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {permission !== 'granted' && (
          <button
            onClick={requestPermission}
            disabled={loading}
            style={{
              padding: '12px 20px',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {loading ? '처리 중...' : '🔔 푸시 알림 권한 요청'}
          </button>
        )}

        {permission === 'granted' && !subscription && (
          <button
            onClick={subscribeToPush}
            disabled={loading}
            style={{
              padding: '12px 20px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {loading ? '구독 중...' : '📱 푸시 알림 구독'}
          </button>
        )}

        {subscription && (
          <>
            <button
              onClick={sendTestNotification}
              style={{
                padding: '12px 20px',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              🧪 테스트 알림 발송
            </button>
            
            <button
              onClick={unsubscribeFromPush}
              disabled={loading}
              style={{
                padding: '12px 20px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {loading ? '해지 중...' : '🚫 구독 해지'}
            </button>
          </>
        )}
      </div>

      <div style={{ marginTop: '16px', padding: '12px', background: '#dbeafe', borderRadius: '8px' }}>
        <p style={{ color: '#1e40af', margin: 0, fontSize: '12px', lineHeight: '1.4' }}>
          💡 <strong>웹 푸시 알림이란?</strong><br/>
          브라우저를 닫아도 데스크톱에 알림이 표시됩니다.<br/>
          매일 아침 7시에 새로운 부동산 뉴스를 알려드립니다!
        </p>
      </div>
    </div>
  )
}
