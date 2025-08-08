'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const handleExchange = async () => {
      try {
        const code = searchParams.get('code')
        const next = searchParams.get('next') || '/dashboard'

        if (!code) {
          // 코드가 없으면 홈으로 반환
          router.replace('/')
          return
        }

        const { error } = await supabase.auth.exchangeCodeForSession({ code })
        if (error) {
          setErrorMessage(error.message)
          return
        }

        router.replace(next)
      } catch (err: any) {
        setErrorMessage(err?.message || '로그인 처리 중 오류가 발생했습니다.')
      }
    }

    handleExchange()
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


