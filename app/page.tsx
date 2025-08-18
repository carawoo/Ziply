'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase-client'; // ✅ 경로 수정

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    const addDebugInfo = (info: string) => {
      setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
    };

    const init = async () => {
      try {
        addDebugInfo('Supabase 클라이언트 초기화 시작');
        addDebugInfo(`환경변수 확인 - URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '누락'}, Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '누락'}`);
        
        // Supabase 클라이언트가 정상적으로 생성되었는지 확인
        if (!supabase) {
          throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
        }
        
        addDebugInfo('Supabase 클라이언트 확인 완료');
        
        // 세션 상태를 먼저 확인
        const { data: { session } } = await supabase.auth.getSession();
        addDebugInfo(`세션 상태: ${session ? '존재함' : '없음'}`);
        
        // 사용자 정보 조회 (세션이 없어도 시도)
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          addDebugInfo(`Supabase 오류: ${error.message}`);
          // Auth session missing은 정상적인 상황 (로그인하지 않은 사용자)
          if (error.message === 'Auth session missing!') {
            addDebugInfo('로그인하지 않은 사용자 - 정상적으로 메인 페이지 표시');
            setUser(null);
            setLoading(false);
            return;
          }
          // 다른 오류의 경우에만 에러 표시
          setError(`인증 오류: ${error.message}`);
          setLoading(false);
          return;
        }

        addDebugInfo(`사용자 정보 조회 완료: ${user ? '로그인됨' : '로그인 안됨'}`);

        // 이미 로그인이면 대시보드로
        if (user) {
          addDebugInfo('대시보드로 리다이렉트 중...');
          // 더 안전한 리다이렉트 방식
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/dashboard';
            }
          }, 500); // 0.5초 딜레이
          return;
        }

        setUser(user);
        setLoading(false);
        addDebugInfo('페이지 로딩 완료');
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : '알 수 없는 오류';
        addDebugInfo(`초기화 에러: ${errorMsg}`);
        setError(`초기화 오류: ${errorMsg}`);
        setLoading(false);
        
        // 5초 후에 자동으로 fallback UI 표시
        setTimeout(() => {
          if (loading) {
            addDebugInfo('타임아웃으로 인한 fallback UI 표시');
            setLoading(false);
            setError('연결이 지연되고 있습니다. 새로고침을 시도해주세요.');
          }
        }, 5000);
      }
    };

    addDebugInfo('페이지 시작');
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addDebugInfo(`인증 상태 변경: ${event}`);
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/dashboard';
          }
        }, 500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleKakaoLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: typeof window !== 'undefined' 
            ? `${window.location.origin}/auth/callback?next=/dashboard`
            : 'https://ziply-nine.vercel.app/auth/callback?next=/dashboard'
        }
      });
      if (error) {
        console.error('카카오 로그인 오류:', error);
        alert('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch (e) {
      console.error('로그인 오류:', e);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="loading" style={{ padding: '20px', textAlign: 'center' }}>
        <div className="spinner"></div>
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <div>로딩 중...</div>
          {debugInfo.length > 0 && (
            <details style={{ marginTop: '10px', textAlign: 'left' }}>
              <summary>디버그 정보</summary>
              {debugInfo.map((info, i) => (
                <div key={i} style={{ fontSize: '12px', margin: '2px 0' }}>{info}</div>
              ))}
            </details>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <h3>오류가 발생했습니다</h3>
          <p>{error}</p>
        </div>
        <details style={{ textAlign: 'left', marginTop: '20px' }}>
          <summary>디버그 정보</summary>
          {debugInfo.map((info, i) => (
            <div key={i} style={{ fontSize: '12px', margin: '2px 0' }}>{info}</div>
          ))}
        </details>
        <button 
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }} 
          style={{ marginTop: '20px', padding: '10px 20px' }}
        >
          새로고침
        </button>
      </div>
    );
  }

  // 로그인된 사용자는 이미 리다이렉트됨
  return (
    <div>
      <header className="header">
        <div className="container">
          <nav className="nav">
            <div className="logo">Ziply</div>
          </nav>
        </div>
      </header>

      <div className="hero">
        <div className="container">
          <h1>
            부동산이 어려우신가요?<br />
            Ziply와 함께 <span style={{ color: 'var(--primary-600)' }}>쉽게</span> 시작하세요
          </h1>
          <p>
            복잡한 부동산 시장, 이제 걱정하지 마세요.<br />
            AI가 매일 선별한 맞춤형 뉴스로 똑똑하게 투자하세요.
          </p>

          <div style={{ marginTop: '48px' }}>
            <button
              onClick={handleKakaoLogin}
              className="button button-kakao"
              style={{
                fontSize: '20px',
                padding: '20px 40px',
                fontWeight: '700',
                borderRadius: '16px',
                minHeight: '64px'
              }}
            >
              <span style={{ fontSize: '24px' }}>💬</span>
              카카오로 3초 만에 시작하기
            </button>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <span className="feature-icon">🎯</span>
              <h3 className="feature-title">맞춤형 뉴스</h3>
              <p className="feature-description">
                초보자, 신혼부부, 투자자별로<br />
                딱 맞는 정보만 골라서 제공
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-icon">🤖</span>
              <h3 className="feature-title">AI 똑똑한 요약</h3>
              <p className="feature-description">
                복잡한 경제 용어는 쉽게,<br />
                핵심 포인트는 명확하게 정리
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-icon">📧</span>
              <h3 className="feature-title">매일 아침 7시 배송</h3>
              <p className="feature-description">
                출근길에 읽기 좋은<br />
                3분 분량의 뉴스레터
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: '80px',
              padding: '40px',
              background: 'white',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--gray-200)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2
                style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  marginBottom: '16px',
                  color: 'var(--gray-900)'
                }}
              >
                이런 분들께 추천해요
              </h2>
              <p
                style={{
                  fontSize: '18px',
                  color: 'var(--gray-600)',
                  lineHeight: '1.6'
                }}
              >
                Ziply는 부동산이 처음인 모든 분들을 위해 만들어졌어요
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px'
              }}
            >
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <div
                  style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                    background: 'var(--primary-50)',
                    borderRadius: '50%',
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  🏠
                </div>
                <h3
                  style={{
                    fontWeight: '700',
                    marginBottom: '8px',
                    color: 'var(--gray-900)',
                    fontSize: '18px'
                  }}
                >
                  생애 첫 집 준비
                </h3>
                <p
                  style={{
                    color: 'var(--gray-600)',
                    lineHeight: '1.6',
                    fontSize: '15px'
                  }}
                >
                  내 집 마련이 막막한<br />
                  20-30대를 위한 가이드
                </p>
              </div>

              <div style={{ textAlign: 'center', padding: '24px' }}>
                <div
                  style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                    background: 'var(--primary-50)',
                    borderRadius: '50%',
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  💑
                </div>
                <h3
                  style={{
                    fontWeight: '700',
                    marginBottom: '8px',
                    color: 'var(--gray-900)',
                    fontSize: '18px'
                  }}
                >
                  신혼부부 특별공급
                </h3>
                <p
                  style={{
                    color: 'var(--gray-600)',
                    lineHeight: '1.6',
                    fontSize: '15px'
                  }}
                >
                  각종 혜택과 지원 정책을<br />
                  놓치지 않게 알려드려요
                </p>
              </div>

              <div style={{ textAlign: 'center', padding: '24px' }}>
                <div
                  style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                    background: 'var(--primary-50)',
                    borderRadius: '50%',
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  📈
                </div>
                <h3
                  style={{
                    fontWeight: '700',
                    marginBottom: '8px',
                    color: 'var(--gray-900)',
                    fontSize: '18px'
                  }}
                >
                  스마트한 투자
                </h3>
                <p
                  style={{
                    color: 'var(--gray-600)',
                    lineHeight: '1.6',
                    fontSize: '15px'
                  }}
                >
                  시장 동향을 파악하고<br />
                  기회를 놓치지 마세요
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '60px',
              textAlign: 'center'
            }}
          >
            <p
              style={{
                fontSize: '16px',
                color: 'var(--gray-500)',
                marginBottom: '24px'
              }}
            >
              이미 <strong style={{ color: 'var(--primary-600)' }}>1,000+</strong>명이 Ziply와 함께 성공적인 부동산 여정을 시작했어요
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '32px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ color: 'var(--gray-400)', fontSize: '14px' }}>✓ 무료 서비스</div>
              <div style={{ color: 'var(--gray-400)', fontSize: '14px' }}>✓ 언제든 구독 해지</div>
              <div style={{ color: 'var(--gray-400)', fontSize: '14px' }}>✓ 개인정보 보호</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}