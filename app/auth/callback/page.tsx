'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const next = searchParams.get('next') || '/dashboard'

        // Supabase가 자동으로 URL의 code를 처리하도록 getSession 사용
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          setErrorMessage(error.message)
          return
        }

        if (data.session) {
          // 세션이 성공적으로 생성됨, 다음 페이지로 이동
          router.replace(next)
        } else {
          // 세션이 없으면 홈으로 반환
          router.replace('/')
        }
      } catch (err: any) {
        console.error('Callback error:', err)
        setErrorMessage(err?.message || '로그인 처리 중 오류가 발생했습니다.')
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="loading" style={{ minHeight: '60vh' }}>
      <div className="spinner"></div>
      <p style={{ marginTop: 16, color: '#6b7280' }}>
        {errorMessage ? `오류: ${errorMessage}` : '로그인 정보를 확인 중입니다...'}
      </p>
    </div>
  )
}


