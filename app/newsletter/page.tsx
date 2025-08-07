'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

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
      // Supabase에 이메일 저장
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }])
        .select()

      if (error) {
        if (error.code === '23505') { // unique constraint violation
          setMessage('이미 구독하신 이메일 주소입니다.')
          setIsSuccess(false)
        } else {
          throw error
        }
      } else {
        setMessage('뉴스레터 구독이 완료되었습니다! 매일 아침 유용한 부동산 정보를 받아보세요.')
        setIsSuccess(true)
        setEmail('')
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
    <div>
      <header className="header">
        <div className="container">
          <nav className="nav">
            <div className="logo">부동산 뉴스 큐레이터</div>
            <div>
              <a href="/" style={{ marginRight: '16px', color: 'white' }}>
                홈
              </a>
              <a href="/dashboard" style={{ marginRight: '16px', color: 'white' }}>
                대시보드
              </a>
            </div>
          </nav>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📧</div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px', color: '#1f2937' }}>
                뉴스레터 구독
              </h1>
              <p style={{ color: '#6b7280', fontSize: '18px', lineHeight: '1.6' }}>
                매일 아침 7시, 맞춤형 부동산 뉴스 요약을<br />
                이메일로 받아보세요
              </p>
            </div>

            <form onSubmit={handleSubscribe} style={{ marginBottom: '32px' }}>
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소를 입력하세요"
                  className="input"
                  required
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className="button"
                style={{ 
                  width: '100%', 
                  fontSize: '18px',
                  background: loading ? '#9ca3af' : '#4f46e5'
                }}
                disabled={loading}
              >
                {loading ? '구독 중...' : '무료로 구독하기'}
              </button>
            </form>

            {message && (
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                background: isSuccess ? '#d1fae5' : '#fef2f2',
                border: `1px solid ${isSuccess ? '#10b981' : '#ef4444'}`,
                color: isSuccess ? '#065f46' : '#dc2626'
              }}>
                {message}
              </div>
            )}

            <div style={{ marginTop: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
                뉴스레터에서 받을 수 있는 내용
              </h2>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>📈</span>
                  <div>
                    <h3 style={{ fontWeight: '600', marginBottom: '4px', color: '#374151' }}>
                      일일 시장 동향
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                      전날 부동산 시장의 주요 변화와 트렌드 분석
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>🏛️</span>
                  <div>
                    <h3 style={{ fontWeight: '600', marginBottom: '4px', color: '#374151' }}>
                      정책 변화 알림
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                      부동산 관련 정책 변경사항과 그 영향 분석
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>💡</span>
                  <div>
                    <h3 style={{ fontWeight: '600', marginBottom: '4px', color: '#374151' }}>
                      투자 인사이트
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                      전문가 관점에서 본 투자 기회와 주의사항
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>🎯</span>
                  <div>
                    <h3 style={{ fontWeight: '600', marginBottom: '4px', color: '#374151' }}>
                      맞춤 추천
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                      당신의 관심사에 맞는 부동산 정보 큐레이션
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ 
              marginTop: '32px', 
              padding: '20px', 
              background: '#f8fafc', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                💌 <strong>구독자 혜택:</strong> 뉴스레터 구독자만을 위한<br />
                특별 부동산 세미나 및 전문가 상담 기회 제공
              </p>
            </div>

            <div style={{ 
              marginTop: '20px', 
              textAlign: 'center',
              fontSize: '12px',
              color: '#9ca3af'
            }}>
              언제든지 구독을 취소할 수 있으며, 개인정보는 안전하게 보호됩니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
