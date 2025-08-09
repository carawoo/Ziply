'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      // 이미 로그인된 사용자는 대시보드로 리다이렉트
      if (user) {
        window.location.href = '/dashboard'
        return
      }
      
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        if (event === 'SIGNED_IN') {
          window.location.href = '/dashboard'
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleKakaoLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          // OAuth 완료 후 Supabase가 code를 콜백으로 전달 → 우리 콜백 페이지에서 세션 교환
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
        }
      })
      
      if (error) {
        console.error('카카오 로그인 오류:', error)
        alert('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      alert('로그인 중 오류가 발생했습니다.')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  // 로그인된 사용자는 이미 대시보드로 리다이렉트됨

  return (
    <div>
      <header className="header">
        <div className="container">
          <nav className="nav">
            <div className="logo">Ziply</div>
          </nav>
        </div>
      </header>

      <div className="container">
        <div className="hero">
          <h1>Ziply와 함께<br />부동산 뉴스를 더 쉽게 📈</h1>
          <p>
            초보자도 쉽게 이해할 수 있는 맞춤형 부동산 뉴스 요약 서비스
          </p>
          
          <div style={{ marginTop: '40px' }}>
            <button 
              onClick={handleKakaoLogin}
              className="button button-kakao"
              style={{ 
                fontSize: '18px', 
                padding: '16px 32px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>💬</span>
              카카오로 3초 만에 시작하기
            </button>
          </div>

          <div style={{ marginTop: '60px', textAlign: 'left', maxWidth: '800px', margin: '60px auto 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              <div className="card">
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔰</div>
                <h3 style={{ marginBottom: '8px', color: '#1f2937' }}>초보자 친화적</h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                  복잡한 부동산 용어도 쉽게 설명해드려요
                </p>
              </div>
              
              <div className="card">
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤖</div>
                <h3 style={{ marginBottom: '8px', color: '#1f2937' }}>AI 맞춤 요약</h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                  당신의 상황에 맞는 핵심 정보만 골라서
                </p>
              </div>
              
              <div className="card">
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
                <h3 style={{ marginBottom: '8px', color: '#1f2937' }}>실시간 업데이트</h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                  중요한 부동산 뉴스를 놓치지 마세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
