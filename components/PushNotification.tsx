'use client'

import { useState, useEffect } from 'react'
import { requestNotificationPermission, getNotificationStatus } from '@/lib/push-notification'

// 푸시 알림 설정 UI 컴포넌트용 훅
export const useNotificationPermission = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported('Notification' in window)
    setPermission(getNotificationStatus() as NotificationPermission)
  }, [])

  const requestPermission = async () => {
    const granted = await requestNotificationPermission()
    setPermission(getNotificationStatus() as NotificationPermission)
    return granted
  }

  return {
    permission,
    isSupported,
    requestPermission
  }
}

// 푸시 알림 설정 컴포넌트
export default function PushNotification() {
  const { permission, isSupported, requestPermission } = useNotificationPermission()

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

  if (permission === 'granted') {
    return (
      <div style={{ 
        background: '#d1fae5', 
        padding: '12px', 
        borderRadius: '6px',
        fontSize: '14px',
        color: '#065f46'
      }}>
        ✅ 푸시 알림이 활성화되어 있습니다.
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
        style={{
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        알림 허용하기
      </button>
    </div>
  )
}
