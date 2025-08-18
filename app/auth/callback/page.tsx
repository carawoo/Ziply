'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    console.log('[Auth Callback]', info)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
  }

  useEffect(() => {
    const handleCallback = async () => {
      try {
        addDebugInfo('콜백 처리 시작')
        const next = searchParams.get('next') || '/dashboard'
        addDebugInfo(`다음 페이지: ${next}`)
        
        // URL에서 코드 확인
        const code = searchParams.get('code')
        const error_code = searchParams.get('error')
        
        addDebugInfo(`URL 파라미터 - code: ${code ? '있음' : '없음'}, error: ${error_code || '없음'}`)

        if (error_code) {
          setErrorMessage(`로그인 오류: ${error_code}`)
          return
        }

        if (code) {
          // 코드가 있으면 세션 교환 시도
          addDebugInfo('인증 코드를 세션으로 교환 중...')
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            addDebugInfo(`세션 교환 오류: ${error.message}`)
            setErrorMessage(error.message)
            return
          }
          
          addDebugInfo('세션 교환 성공')
          if (data.session) {
            addDebugInfo(`사용자 ID: ${data.session.user.id}`)
            setTimeout(() => {
              router.replace(next)
            }, 1000)
            return
          }
        }

        // 기존 세션 확인
        addDebugInfo('기존 세션 확인 중...')
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          addDebugInfo(`세션 조회 오류: ${error.message}`)
          setErrorMessage(error.message)
          return
        }

        if (data.session) {
          addDebugInfo('기존 세션 발견, 리다이렉트 중...')
          setTimeout(() => {
            router.replace(next)
          }, 1000)
        } else {
          addDebugInfo('세션 없음, 홈으로 리다이렉트')
          setTimeout(() => {
            router.replace('/')
          }, 2000)
        }
      } catch (err: any) {
        addDebugInfo(`예외 발생: ${err?.message}`)
        console.error('Callback error:', err)
        setErrorMessage(err?.message || '로그인 처리 중 오류가 발생했습니다.')
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="loading" style={{ minHeight: '60vh', padding: '20px' }}>
      <div className="spinner"></div>
      <p style={{ marginTop: 16, color: '#6b7280' }}>
        {errorMessage ? `오류: ${errorMessage}` : '로그인 정보를 확인 중입니다...'}
      </p>
      
      {debugInfo.length > 0 && (
        <details style={{ marginTop: '20px', textAlign: 'left', maxWidth: '600px', margin: '20px auto' }}>
          <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>디버그 정보</summary>
          {debugInfo.map((info, i) => (
            <div key={i} style={{ fontSize: '12px', margin: '2px 0', color: '#666' }}>{info}</div>
          ))}
        </details>
      )}
      
      {errorMessage && (
        <button 
          onClick={() => window.location.href = '/'} 
          style={{ marginTop: '20px', padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          홈으로 돌아가기
        </button>
      )}
    </div>
  )
}


