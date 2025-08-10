'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { NewsItem } from '@/lib/ai'
import dynamic from 'next/dynamic'
import LoanFaqData from '@/data/loan-faq.json'

// LoanFaq 컴포넌트 동적 임포트
const LoanFaq = dynamic(() => import('@/components/LoanFaq'), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '40px',
      color: 'var(--gray-500)'
    }}>
      Q&A 로딩 중...
    </div>
  )
})

type UserGroup = '초보자' | '신혼부부·초년생' | '투자자' | null

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [newsLoading, setNewsLoading] = useState(false)
  const [userGroup, setUserGroup] = useState<UserGroup>(null)
  const [activeTab, setActiveTab] = useState('')
  const [news, setNews] = useState<NewsItem[]>([])

  // 선택된 그룹에 따른 동적 탭 생성
  const getTabsForGroup = (group: UserGroup) => {
    switch (group) {
      case '초보자':
        return ['초보자용', '정책뉴스']
      case '신혼부부·초년생':
        return ['신혼부부용', '정책뉴스', '지원혜택']
      case '투자자':
        return ['투자자용', '시장분석', '정책뉴스']
      default:
        return ['초보자용', '신혼부부용', '투자자용']
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        window.location.href = '/'
        return
      }
      
      setUser(user)
      
      // 사용자 그룹 체크
      await checkUserGroup(user.id)
      
      setLoading(false)
    }

    getUser()
  }, [])

  const checkUserGroup = async (userId: string) => {
    try {
      // localStorage에서 먼저 확인
      const savedGroup = localStorage.getItem('userGroup') as UserGroup
      if (savedGroup) {
        setUserGroup(savedGroup)
        const defaultTab = getTabsForGroup(savedGroup)[0]
        setActiveTab(defaultTab)
        await loadNews(defaultTab, savedGroup)
        return
      }

      // Supabase에서 사용자 선호도 확인
      const { data, error } = await supabase
        .from('user_preferences')
        .select('category')
        .eq('user_id', userId)
        .single()

      if (data && !error) {
        const group = data.category
        setUserGroup(group)
        localStorage.setItem('userGroup', group)
        
        // 그룹에 맞는 기본 탭 설정
        const defaultTab = getTabsForGroup(group)[0]
        setActiveTab(defaultTab)
        await loadNews(defaultTab, group)
      }
    } catch (error) {
      console.error('사용자 그룹 확인 오류:', error)
    }
  }

  const getTabFromGroup = (group: UserGroup): string => {
    switch (group) {
      case '초보자': return '초보자용'
      case '신혼부부·초년생': return '신혼부부용'
      case '투자자': return '투자자용'
      default: return '초보자용'
    }
  }

  const saveUserGroup = async (group: UserGroup) => {
    if (!user || !group) return

    try {
      // localStorage에 저장
      localStorage.setItem('userGroup', group)
      
      // Supabase에 저장
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          category: group
        })

      if (error) {
        console.error('사용자 선호도 저장 오류:', error)
      }

      setUserGroup(group)
      const defaultTab = getTabsForGroup(group)[0]
      setActiveTab(defaultTab)
      await loadNews(defaultTab, group)
    } catch (error) {
      console.error('사용자 그룹 저장 오류:', error)
    }
  }

  const loadNews = async (tab: string, group?: UserGroup) => {
    setNewsLoading(true)
    try {
      console.log('뉴스 로딩 시작:', tab)
      
      // 내부 API를 통해 뉴스 가져오기 (캐시 끄기)
      const response = await fetch(`/api/news?tab=${encodeURIComponent(tab)}`, { 
        cache: 'no-store' 
      })
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || '뉴스 로딩 실패')
      }
      
      console.log('가져온 뉴스 개수:', data.news.length)
      
      if (data.news.length === 0) {
        console.log('뉴스가 없습니다. 실시간 결과가 비어 있습니다')
        setNews([])
        setNewsLoading(false)
        return
      }
      
      console.log('요약 완료된 뉴스 개수:', data.news.length)
      setNews(data.news)
    } catch (error) {
      console.error('뉴스 로딩 오류:', error)
      setNews([])
    } finally {
      setNewsLoading(false)
    }
  }

  const handleTabChange = async (tab: string) => {
    setActiveTab(tab)
    await loadNews(tab)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // 사용자 그룹 선택 UI 컴포넌트
  const UserGroupSelection = () => (
    <div style={{ background: 'linear-gradient(135deg, var(--gray-50) 0%, white 100%)', minHeight: '100vh' }}>
      <header className="header">
        <div className="container">
          <nav className="nav">
            <div className="logo">Ziply</div>
            <div />
          </nav>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: '64px' }}>
            <h1 style={{ 
              fontSize: 'clamp(32px, 5vw, 48px)', 
              fontWeight: '800', 
              marginBottom: '24px', 
              color: 'var(--gray-900)',
              lineHeight: '1.2'
            }}>
              어떤 정보가 필요하신가요?<br />
              <span style={{ color: 'var(--primary-600)' }}>딱 맞는</span> 뉴스를 골라드릴게요 🎯
            </h1>
            <p style={{ 
              color: 'var(--gray-600)', 
              fontSize: '20px', 
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              선택하신 그룹에 따라 AI가 가장 유용한<br />
              부동산 정보만 골라서 매일 전해드려요
            </p>
          </div>

          <div style={{ display: 'grid', gap: '24px', marginBottom: '48px' }}>
            {/* 초보자 그룹 */}
            <div 
              onClick={() => saveUserGroup('초보자')}
              style={{ 
                background: 'white',
                borderRadius: 'var(--radius-2xl)',
                padding: '40px',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                border: '2px solid var(--gray-200)',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-500)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--gray-200)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              }}
            >
              <div style={{ 
                fontSize: '64px', 
                marginBottom: '24px',
                background: 'var(--primary-50)',
                borderRadius: '50%',
                width: '100px',
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>🔰</div>
              <h3 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                marginBottom: '16px', 
                color: 'var(--gray-900)'
              }}>
                부동산 초보자
              </h3>
              <p style={{ 
                color: 'var(--gray-600)', 
                lineHeight: '1.7',
                fontSize: '18px',
                marginBottom: '24px'
              }}>
                부동산 투자나 구매가 처음이신 분들을 위한<br />
                기초적이고 이해하기 쉬운 정보를 제공합니다
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px',
                marginTop: '24px'
              }}>
                <div style={{ 
                  background: 'var(--gray-50)', 
                  padding: '16px', 
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '15px',
                  color: 'var(--gray-700)',
                  fontWeight: '500'
                }}>
                  📚 부동산 기초 용어 설명
                </div>
                <div style={{ 
                  background: 'var(--gray-50)', 
                  padding: '16px', 
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '15px',
                  color: 'var(--gray-700)',
                  fontWeight: '500'
                }}>
                  🏠 주택 구매 프로세스 가이드
                </div>
                <div style={{ 
                  background: 'var(--gray-50)', 
                  padding: '16px', 
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '15px',
                  color: 'var(--gray-700)',
                  fontWeight: '500'
                }}>
                  📈 기본적인 시장 동향 해석
                </div>
              </div>
            </div>

            {/* 신혼부부·초년생 그룹 */}
            <div 
              onClick={() => saveUserGroup('신혼부부·초년생')}
              style={{ 
                background: 'white',
                borderRadius: 'var(--radius-2xl)',
                padding: '40px',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                border: '2px solid var(--gray-200)',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--success)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--gray-200)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              }}
            >
              <div style={{ 
                fontSize: '64px', 
                marginBottom: '24px',
                background: '#dcfce7',
                borderRadius: '50%',
                width: '100px',
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>💑</div>
              <h3 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                marginBottom: '16px', 
                color: 'var(--gray-900)'
              }}>
                신혼부부·사회초년생
              </h3>
              <p style={{ 
                color: 'var(--gray-600)', 
                lineHeight: '1.7',
                fontSize: '18px',
                marginBottom: '24px'
              }}>
                내 집 마련을 준비하는 신혼부부와 사회초년생을 위한<br />
                실용적인 주거 관련 정보를 제공합니다
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px',
                marginTop: '24px'
              }}>
                <div style={{ 
                  background: '#dcfce7', 
                  padding: '16px', 
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '15px',
                  color: '#065f46',
                  fontWeight: '500'
                }}>
                  🏡 신혼부부 특별공급 정보
                </div>
                <div style={{ 
                  background: '#dcfce7', 
                  padding: '16px', 
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '15px',
                  color: '#065f46',
                  fontWeight: '500'
                }}>
                  💰 생애 첫 주택 구입 혜택
                </div>
                <div style={{ 
                  background: '#dcfce7', 
                  padding: '16px', 
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '15px',
                  color: '#065f46',
                  fontWeight: '500'
                }}>
                  🔑 전세/월세 관련 팁
                </div>
              </div>
            </div>

            {/* 투자자 그룹 */}
            <div 
              onClick={() => saveUserGroup('투자자')}
              style={{ 
                background: 'white',
                borderRadius: 'var(--radius-2xl)',
                padding: '40px',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                border: '2px solid var(--gray-200)',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--warning)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--gray-200)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              }}
            >
              <div style={{ 
                fontSize: '64px', 
                marginBottom: '24px',
                background: '#fef3c7',
                borderRadius: '50%',
                width: '100px',
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>💼</div>
              <h3 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                marginBottom: '16px', 
                color: 'var(--gray-900)'
              }}>
                부동산 투자자
              </h3>
              <p style={{ 
                color: 'var(--gray-600)', 
                lineHeight: '1.7',
                fontSize: '18px',
                marginBottom: '24px'
              }}>
                부동산 투자 경험이 있거나 관심이 많은 분들을 위한<br />
                심층적인 시장 분석과 투자 인사이트를 제공합니다
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px',
                marginTop: '24px'
              }}>
                <div style={{ 
                  background: '#fef3c7', 
                  padding: '16px', 
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '15px',
                  color: '#92400e',
                  fontWeight: '500'
                }}>
                  📊 시장 동향 심층 분석
                </div>
                <div style={{ 
                  background: '#fef3c7', 
                  padding: '16px', 
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '15px',
                  color: '#92400e',
                  fontWeight: '500'
                }}>
                  💎 투자 수익률 및 전략
                </div>
                <div style={{ 
                  background: '#fef3c7', 
                  padding: '16px', 
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '15px',
                  color: '#92400e',
                  fontWeight: '500'
                }}>
                  📋 정책 변화의 투자 영향
                </div>
              </div>
            </div>
          </div>

          <div style={{ 
            padding: '32px', 
            background: 'linear-gradient(135deg, var(--primary-50) 0%, white 100%)', 
            borderRadius: 'var(--radius-xl)',
            marginTop: '48px',
            border: '1px solid var(--primary-200)'
          }}>
            <p style={{ 
              color: 'var(--primary-700)', 
              fontSize: '16px',
              fontWeight: '500'
            }}>
              💡 <strong>언제든지 변경 가능해요!</strong><br />
              선택하신 그룹은 나중에 설정에서 언제든 바꿀 수 있으니 편하게 선택해보세요
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  // 사용자 그룹이 선택되지 않았다면 선택 화면 표시
  if (!userGroup) {
    return <UserGroupSelection />
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
              <a href="/newsletter" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>
                뉴스레터
              </a>
              <button 
                onClick={handleLogout}
                className="button"
                style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: '14px',
                  padding: '8px 16px'
                }}
              >
                로그아웃
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '16px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* 헤더 섹션 */}
          <div style={{ 
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--gray-200)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h1 style={{ 
                  fontSize: '32px', 
                  fontWeight: '800', 
                  color: 'var(--gray-900)',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  {userGroup === '초보자' && '🔰 부동산 초보자'} 
                  {userGroup === '신혼부부·초년생' && '💑 신혼부부·사회초년생'} 
                  {userGroup === '투자자' && '💼 부동산 투자자'} 
                  <span style={{ fontSize: '24px', color: 'var(--primary-600)' }}>맞춤 뉴스</span>
                </h1>
                <p style={{ 
                  color: 'var(--gray-600)', 
                  fontSize: '18px',
                  lineHeight: '1.6'
                }}>
                  {userGroup === '초보자' && '복잡한 부동산 용어도 쉽게 풀어서 설명해드려요'}
                  {userGroup === '신혼부부·초년생' && '내 집 마련에 꼭 필요한 실용적인 정보를 모았어요'}
                  {userGroup === '투자자' && '시장 분석과 수익성 있는 투자 인사이트를 제공해요'}
                </p>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem('userGroup')
                  setUserGroup(null)
                  setActiveTab('')
                  setNews([])
                }}
                style={{
                  background: 'var(--gray-100)',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '10px 16px',
                  fontSize: '14px',
                  color: 'var(--gray-700)',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--gray-200)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--gray-100)'
                }}
              >
                그룹 변경
              </button>
            </div>

            {/* 탭 네비게이션 */}
            <div className="tabs">
              {getTabsForGroup(userGroup).map((tab) => (
                <button
                  key={tab}
                  className={`tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab === '초보자용' && '🔰'} 
                  {tab === '신혼부부용' && '💑'} 
                  {tab === '투자자용' && '💼'}
                  {tab === '정책뉴스' && '📋'}
                  {tab === '시장분석' && '📈'}
                  {tab === '지원혜택' && '🎁'}
                  <span style={{ marginLeft: '6px' }}>{tab}</span>
                </button>
              ))}
            </div>
          </div>

          {newsLoading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p style={{ 
                marginTop: '24px', 
                color: 'var(--gray-600)',
                fontSize: '18px',
                fontWeight: '500'
              }}>
                {activeTab} 맞춤 뉴스를 AI가 요약하고 있어요...
              </p>
            </div>
          ) : (
            <div>
              {/* 탭 설명 */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, var(--primary-50) 0%, white 100%)', 
                  padding: '24px', 
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--primary-200)',
                  textAlign: 'center'
                }}>
                  <p style={{ 
                    color: 'var(--primary-700)', 
                    fontWeight: '600',
                    fontSize: '16px',
                    lineHeight: '1.6'
                  }}>
                    {activeTab === '초보자용' && '🔰 부동산 초보자를 위한 쉬운 설명과 핵심 포인트만 골라서 정리했어요'}
                    {activeTab === '신혼부부용' && '💑 내 집 마련을 준비하는 신혼부부를 위한 실용적인 정보를 모았어요'}
                    {activeTab === '투자자용' && '💼 투자 관점에서 분석한 시장 동향과 수익 기회를 알려드려요'}
                    {activeTab === '정책뉴스' && '📋 부동산 관련 정책 변화와 규제 동향을 빠르게 파악하세요'}
                    {activeTab === '시장분석' && '📈 전문가 수준의 시장 동향 분석과 투자 기회를 제공해요'}
                    {activeTab === '지원혜택' && '🎁 신혼부부와 청년을 위한 각종 지원 혜택 정보를 놓치지 마세요'}
                  </p>
                </div>
              </div>

              {/* 초보자용 탭일 때 Q&A 바로가기 버튼 */}
              {userGroup === '초보자' && activeTab === '초보자용' && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  marginBottom: '24px' 
                }}>
                  <button
                    onClick={() => {
                      const faqSection = document.getElementById('beginner-faq')
                      if (faqSection) {
                        faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }}
                    style={{
                      background: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                      border: '1px solid var(--primary-300)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all var(--transition-base)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--primary-200)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--primary-100)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    💡 초보자 Q&A 바로가기 ↓
                  </button>
                </div>
              )}

              {/* 뉴스 카드들 */}
              <div style={{ display: 'grid', gap: '20px' }} id="news-list">
                {news.map((item, index) => (
                  <div key={item.id} style={{
                    background: 'white',
                    borderRadius: 'var(--radius-xl)',
                    padding: '32px',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--gray-200)',
                    transition: 'all var(--transition-base)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                  }}
                  >
                    {/* 중요도 표시 */}
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      background: index === 0 ? '#fee2e2' : index === 1 ? '#fef3c7' : '#e0f2fe',
                      color: index === 0 ? '#dc2626' : index === 1 ? '#d97706' : '#0369a1',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {index === 0 && '🔥 HOT'}
                      {index === 1 && '📈 TREND'}
                      {index === 2 && '💡 TIP'}
                      {index === 3 && '🎯 PICK'}
                    </div>

                    <h2 style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      marginBottom: '16px',
                      color: 'var(--gray-900)',
                      lineHeight: '1.4',
                      paddingRight: '80px'
                    }}>
                      {item.title}
                    </h2>
                    
                    <p style={{
                      color: 'var(--gray-600)',
                      lineHeight: '1.7',
                      marginBottom: '16px',
                      fontSize: '16px'
                    }}>
                      {item.summary || item.content}
                    </p>
                    
                    {/* 초보자 그룹에서만 쉬운 설명 표시 */}
                    {userGroup === '초보자' && item.glossary && (
                      <div style={{
                        background: '#f0f9ff',
                        border: '1px solid #0ea5e9',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px',
                        marginBottom: '24px',
                        borderLeft: '4px solid #0ea5e9'
                      }}>
                        <div style={{
                          color: '#0c4a6e',
                          fontSize: '14px',
                          fontWeight: '600',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          📖 쉬운 설명
                        </div>
                        <div style={{
                          color: '#0369a1',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          whiteSpace: 'pre-line'
                        }}>
                          {item.glossary}
                        </div>
                      </div>
                    )}
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <div style={{
                        fontSize: '14px',
                        color: 'var(--gray-500)',
                        fontWeight: '500'
                      }}>
                        📅 {new Date(item.publishedAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <a 
                        href={item.url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="button"
                        style={{ 
                          fontSize: '14px', 
                          padding: '10px 20px',
                          background: 'var(--primary-600)',
                          textDecoration: 'none',
                          fontWeight: '600'
                        }}
                      >
                        원문 읽기 →
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* 초보자 전용 Q&A 섹션 */}
              {userGroup === '초보자' && activeTab === '초보자용' && (
                <section 
                  id="beginner-faq" 
                  style={{ 
                    marginTop: '64px',
                    scrollMarginTop: '100px' // 헤더 겹침 방지
                  }}
                >
                  <div style={{
                    background: 'white',
                    borderRadius: 'var(--radius-2xl)',
                    padding: '20px',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--gray-200)',
                    marginBottom: '32px'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginBottom: '16px' 
                    }}>
                      <h3 style={{ 
                        fontSize: '28px', 
                        fontWeight: '700', 
                        color: 'var(--gray-900)',
                        margin: 0
                      }}>
                        🔰 초보자 Q&A · 부동산 기초 가이드
                      </h3>
                      <a
                        href="#beginner-faq"
                        style={{
                          fontSize: '12px',
                          color: 'var(--gray-500)',
                          textDecoration: 'none',
                          opacity: 0.7
                        }}
                        aria-label="초보자 Q&A 바로가기"
                      >
                        #바로가기
                      </a>
                    </div>

                    <p style={{ 
                      fontSize: '16px', 
                      color: 'var(--gray-600)', 
                      lineHeight: '1.6',
                      margin: '0 0 32px 0'
                    }}>
                      처음 주택대출 준비할 때 가장 많이 묻는 질문을 한 페이지에서 정리했습니다.<br />
                      (기준일은 각 항목 '기준: YYYY-MM-DD' 참고)
                    </p>

                    {/* LoanFaq 컴포넌트 동적 임포트 */}
                    <LoanFaq items={LoanFaqData as any[]} embedded={true} />
                  </div>
                </section>
              )}

              {/* CTA 섹션 */}
              <div style={{ 
                marginTop: '48px', 
                padding: '40px', 
                background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)', 
                borderRadius: 'var(--radius-2xl)',
                textAlign: 'center',
                border: '1px solid #fbbf24'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
                <h3 style={{ 
                  color: '#92400e', 
                  marginBottom: '12px',
                  fontSize: '24px',
                  fontWeight: '700'
                }}>
                  매일 아침 7시, 맞춤 뉴스를 받아보세요!
                </h3>
                <p style={{ 
                  color: '#92400e', 
                  marginBottom: '24px',
                  fontSize: '18px',
                  lineHeight: '1.6'
                }}>
                  출근길 3분이면 충분한 부동산 뉴스 요약본을<br />
                  이메일로 편리하게 받아보세요
                </p>
                <a 
                  href="/newsletter" 
                  className="button" 
                  style={{ 
                    background: '#d97706',
                    fontSize: '18px',
                    padding: '16px 32px',
                    fontWeight: '700'
                  }}
                >
                  무료 뉴스레터 구독하기
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--gray-400)',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '12px',
            padding: '4px 8px'
          }}
          aria-label="로그아웃"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}
