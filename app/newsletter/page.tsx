
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import PushNotification from '@/components/PushNotification'
import { useSearchParams } from 'next/navigation'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const searchParams = useSearchParams()
  const unsubscribed = searchParams?.get('unsubscribed') === '1'

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setMessage('올바른 이메일 주소를 입력해주세요.')
      setIsSuccess(false)
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // 1차: 클라이언트 anon으로 시도 (RLS 허용 시)
      let { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }])
        .select()

      // RLS 등으로 실패 시 서버 API로 서비스 롤 처리
      if (error) {
        const resp = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({}))
          throw new Error(j?.error || '구독 저장 실패')
        }
        data = await resp.json()
      }

      if (error) {
        if (error.code === '23505') { // unique constraint violation
          setMessage('이미 구독하신 이메일 주소입니다.')
          setIsSuccess(false)
        } else {
          throw error
        }
      } else {
        // 구독 완료 알림 이메일 발송
        try {
          const response = await fetch('/api/send-subscription-confirmation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
          })

          if (response.ok) {
            setMessage('뉴스레터 구독이 완료되었습니다! 확인 이메일을 발송했습니다. 매일 아침 유용한 부동산 정보를 받아보세요.')
          } else {
            setMessage('뉴스레터 구독이 완료되었습니다! (확인 이메일 발송에 실패했습니다.)')
          }
        } catch (emailError) {
          console.error('구독 완료 이메일 발송 실패:', emailError)
          setMessage('뉴스레터 구독이 완료되었습니다! (확인 이메일 발송에 실패했습니다.)')
        }

        setIsSuccess(true)
        setIsSubscribed(true)
      }
    } catch (error) {
      console.error('구독 오류:', error)
      setMessage('구독 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--gray-50)', minHeight: '100vh' }}>
      <header className="header">
        <div className="container">
          <nav className="nav">
            <div className="logo">Ziply</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <a href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>
                홈
              </a>
              <a href="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>
                대시보드
              </a>
              <a href="http://pf.kakao.com/_nCHNn" target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>
                카카오채널
              </a>
            </div>
          </nav>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {/* 구독 취소 완료 배너 */}
          {unsubscribed && (
            <div style={{
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              padding: '14px 16px',
              borderRadius: 12,
              marginBottom: 16,
              textAlign: 'center',
              fontSize: 14,
              fontWeight: 600
            }}>
              구독 취소가 완료되었습니다. 언제든지 다시 구독하실 수 있어요.
            </div>
          )}
          {/* 메인 카드 */}
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-2xl)',
            padding: '48px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--gray-200)',
            marginBottom: '40px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ 
                fontSize: '80px', 
                marginBottom: '24px',
                background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%)',
                borderRadius: '50%',
                width: '120px',
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                border: '3px solid var(--primary-200)'
              }}>📧</div>
              <h1 style={{ 
                fontSize: 'clamp(32px, 5vw, 48px)', 
                fontWeight: '800', 
                marginBottom: '16px', 
                color: 'var(--gray-900)',
                lineHeight: '1.2'
              }}>
                매일 아침 7시,<br />
                <span style={{ color: 'var(--primary-600)' }}>똑똑한</span> 부동산 뉴스
              </h1>
              <p style={{ 
                color: 'var(--gray-600)', 
                fontSize: '20px', 
                lineHeight: '1.6',
                maxWidth: '500px',
                margin: '0 auto'
              }}>
                출근길 3분이면 충분한 맞춤형 부동산 뉴스 요약을<br />
                매일 아침 이메일로 받아보세요
              </p>
            </div>

            <form onSubmit={handleSubscribe} style={{ marginBottom: '32px' }}>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소를 입력하세요 (예: hello@ziply.kr)"
                  className="input"
                  required
                  disabled={loading}
                  style={{
                    fontSize: '18px',
                    padding: '20px 24px',
                    borderRadius: 'var(--radius-xl)',
                    border: '2px solid var(--gray-200)',
                    transition: 'all var(--transition-base)'
                  }}
                />
              </div>
              <button
                type="submit"
                className="button"
                style={{ 
                  width: '100%', 
                  fontSize: '20px',
                  padding: '20px 32px',
                  background: loading ? 'var(--gray-400)' : 'var(--primary-600)',
                  fontWeight: '700',
                  borderRadius: 'var(--radius-xl)',
                  minHeight: '64px'
                }}
                disabled={loading}
              >
                {loading ? '구독 처리 중...' : '🚀 무료로 시작하기'}
              </button>
            </form>

            {message && (
              <div style={{
                padding: '20px 24px',
                borderRadius: 'var(--radius-xl)',
                marginBottom: '32px',
                background: isSuccess ? '#dcfce7' : '#fef2f2',
                border: `2px solid ${isSuccess ? '#10b981' : '#ef4444'}`,
                color: isSuccess ? '#065f46' : '#dc2626',
                fontSize: '16px',
                fontWeight: '500',
                lineHeight: '1.6'
              }}>
                {message}
              </div>
            )}

            {/* 구독자에게만 구독취소 버튼 노출 */}
            {isSubscribed && (
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <button
                  type="button"
                  style={{ background:'transparent',border:'none',color:'#9ca3af',fontSize:12,textDecoration:'underline',cursor:'pointer' }}
                  onClick={async()=>{
                    try{
                      const resp=await fetch(`/api/newsletter/unsubscribe`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})})
                      const j=await resp.json()
                      if(j.success){
                        setMessage('구독 취소가 완료되었습니다.')
                        setIsSuccess(true)
                      }else{
                        setMessage('구독 취소에 실패했습니다.')
                        setIsSuccess(false)
                      }
                    }catch(e){
                      setMessage('구독 취소 중 오류가 발생했습니다.')
                      setIsSuccess(false)
                    }
                  }}
                >구독 취소</button>
              </div>
            )}

            {/* 알림 섹션 */}
            <div style={{
              background: 'linear-gradient(135deg, var(--primary-50) 0%, white 100%)',
              padding: '24px',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--primary-200)',
              marginBottom: '32px'
            }}>
              <h3 style={{ 
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--primary-700)',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                🔔 웹 푸시 알림도 함께 받아보세요!
              </h3>
              <div style={{ textAlign:'center', marginBottom: 12 }}>
                <a href="http://pf.kakao.com/_nCHNn" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-700)', fontWeight: 600, textDecoration: 'underline', fontSize: 14 }}>
                  카카오톡 채널 소식 받기
                </a>
              </div>
              <PushNotification />
            </div>

            {/* 신뢰도 지표 */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '24px',
              marginBottom: '40px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary-600)', marginBottom: '4px' }}>
                  1,000+
                </div>
                <div style={{ fontSize: '14px', color: 'var(--gray-600)', fontWeight: '500' }}>
                  구독자
                </div>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--success)', marginBottom: '4px' }}>
                  97%
                </div>
                <div style={{ fontSize: '14px', color: 'var(--gray-600)', fontWeight: '500' }}>
                  만족도
                </div>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--warning)', marginBottom: '4px' }}>
                  3분
                </div>
                <div style={{ fontSize: '14px', color: 'var(--gray-600)', fontWeight: '500' }}>
                  읽기 시간
                </div>
              </div>
            </div>

            <div style={{ 
              textAlign: 'center',
              fontSize: '14px',
              color: 'var(--gray-500)',
              fontWeight: '500'
            }}>
              ✓ 언제든 구독 취소 가능 &nbsp;&nbsp; ✓ 개인정보 안전 보호 &nbsp;&nbsp; ✓ 스팸 없음
            </div>
          </div>

          {/* 뉴스레터 콘텐츠 미리보기 */}
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-2xl)',
            padding: '40px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--gray-200)'
          }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              marginBottom: '24px', 
              color: 'var(--gray-900)',
              textAlign: 'center'
            }}>
              뉴스레터에는 이런 내용이 담겨요
            </h2>
            
            <div style={{ display: 'grid', gap: '24px' }}>
              <div style={{ 
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                border: '1px solid var(--gray-200)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    background: '#fee2e2',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0
                  }}>📈</div>
                  <div>
                    <h3 style={{ 
                      fontWeight: '700', 
                      marginBottom: '8px', 
                      color: 'var(--gray-900)',
                      fontSize: '18px'
                    }}>
                      오늘의 부동산 시장 동향
                    </h3>
                    <p style={{ color: 'var(--gray-600)', fontSize: '15px', lineHeight: '1.6' }}>
                      전날 부동산 시장의 주요 변화와 트렌드를 한 눈에 파악할 수 있도록 정리해드려요
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ 
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                border: '1px solid var(--gray-200)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    background: '#fef3c7',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0
                  }}>🏛️</div>
                  <div>
                    <h3 style={{ 
                      fontWeight: '700', 
                      marginBottom: '8px', 
                      color: 'var(--gray-900)',
                      fontSize: '18px'
                    }}>
                      정책 변화 & 지원 혜택 알림
                    </h3>
                    <p style={{ color: 'var(--gray-600)', fontSize: '15px', lineHeight: '1.6' }}>
                      부동산 관련 정책 변경사항과 놓치기 쉬운 각종 지원 혜택을 빠르게 알려드려요
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ 
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                border: '1px solid var(--gray-200)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    background: 'var(--primary-50)',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0
                  }}>💡</div>
                  <div>
                    <h3 style={{ 
                      fontWeight: '700', 
                      marginBottom: '8px', 
                      color: 'var(--gray-900)',
                      fontSize: '18px'
                    }}>
                      AI 맞춤 투자 인사이트
                    </h3>
                    <p style={{ color: 'var(--gray-600)', fontSize: '15px', lineHeight: '1.6' }}>
                      복잡한 부동산 시장 데이터를 AI가 분석해서 당신의 상황에 맞는 조언을 제공해요
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ 
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                border: '1px solid var(--gray-200)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    background: '#dcfce7',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0
                  }}>🔔</div>
                  <div>
                    <h3 style={{ 
                      fontWeight: '700', 
                      marginBottom: '8px', 
                      color: 'var(--gray-900)',
                      fontSize: '18px'
                    }}>
                      즉시 구독 확인 & 웹 푸시 알림
                    </h3>
                    <p style={{ color: 'var(--gray-600)', fontSize: '15px', lineHeight: '1.6' }}>
                      구독 완료 즉시 확인 이메일을 보내드리고, 중요한 뉴스는 웹 푸시로도 알려드려요
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
