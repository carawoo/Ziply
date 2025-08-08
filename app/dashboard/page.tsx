'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { getSampleNews, getNewsForGroup, getNewsForTab, summarizeNews, NewsItem } from '@/lib/ai'

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
      // 탭에 따른 맞춤형 뉴스 가져오기
      const sampleNews = getNewsForTab(tab)
      
      // AI 요약 생성
      const newsWithSummaries = await Promise.all(
        sampleNews.map(async (item) => {
          const summary = await summarizeNews(item.content, tab)
          return { ...item, summary }
        })
      )
      
      setNews(newsWithSummaries)
    } catch (error) {
      console.error('뉴스 로딩 오류:', error)
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
    <div>
      <header className="header">
        <div className="container">
          <nav className="nav">
            <div className="logo">부동산 뉴스 큐레이터</div>
            <div>
              <button 
                onClick={handleLogout}
                className="button"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                로그아웃
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', color: '#1f2937' }}>
              맞춤형 서비스를 위해<br />그룹을 선택해주세요 🎯
            </h1>
            <p style={{ color: '#6b7280', fontSize: '18px', lineHeight: '1.6' }}>
              선택하신 그룹에 따라 최적화된 부동산 정보를 제공해드립니다
            </p>
          </div>

          <div style={{ display: 'grid', gap: '24px', marginBottom: '32px' }}>
            {/* 초보자 그룹 */}
            <div 
              onClick={() => saveUserGroup('초보자')}
              className="card"
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '2px solid #e5e7eb',
                padding: '32px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4f46e5'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔰</div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
                초보자
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                부동산 투자나 구매가 처음이신 분들을 위한<br />
                기초적이고 이해하기 쉬운 정보를 제공합니다
              </p>
              <ul style={{ textAlign: 'left', marginTop: '16px', color: '#6b7280' }}>
                <li>• 부동산 기초 용어 설명</li>
                <li>• 주택 구매 프로세스 가이드</li>
                <li>• 기본적인 시장 동향 해석</li>
              </ul>
            </div>

            {/* 신혼부부·초년생 그룹 */}
            <div 
              onClick={() => saveUserGroup('신혼부부·초년생')}
              className="card"
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '2px solid #e5e7eb',
                padding: '32px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#10b981'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💑</div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
                신혼부부·초년생
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                내 집 마련을 준비하는 신혼부부와 사회초년생을 위한<br />
                실용적인 주거 관련 정보를 제공합니다
              </p>
              <ul style={{ textAlign: 'left', marginTop: '16px', color: '#6b7280' }}>
                <li>• 신혼부부 특별공급 정보</li>
                <li>• 생애 첫 주택 구입 혜택</li>
                <li>• 전세/월세 관련 팁</li>
              </ul>
            </div>

            {/* 투자자 그룹 */}
            <div 
              onClick={() => saveUserGroup('투자자')}
              className="card"
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '2px solid #e5e7eb',
                padding: '32px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#f59e0b'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💼</div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
                투자자
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                부동산 투자 경험이 있거나 관심이 많은 분들을 위한<br />
                심층적인 시장 분석과 투자 인사이트를 제공합니다
              </p>
              <ul style={{ textAlign: 'left', marginTop: '16px', color: '#6b7280' }}>
                <li>• 시장 동향 심층 분석</li>
                <li>• 투자 수익률 및 전략</li>
                <li>• 정책 변화의 투자 영향</li>
              </ul>
            </div>
          </div>

          <div style={{ 
            padding: '20px', 
            background: '#f8fafc', 
            borderRadius: '8px',
            marginTop: '24px'
          }}>
            <p style={{ color: '#475569', fontSize: '14px' }}>
              💡 <strong>언제든지 변경 가능</strong>: 선택하신 그룹은 나중에 설정에서 변경할 수 있습니다
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
    <div>
      <header className="header">
        <div className="container">
          <nav className="nav">
            <div className="logo">부동산 뉴스 큐레이터</div>
            <div>
              <a href="/" style={{ marginRight: '16px', color: 'white' }}>
                홈
              </a>
              <a href="/newsletter" style={{ marginRight: '16px', color: 'white' }}>
                뉴스레터
              </a>
              <button 
                onClick={handleLogout}
                className="button"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                로그아웃
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="card">
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
                {userGroup === '초보자' && '🔰 초보자'} 
                {userGroup === '신혼부부·초년생' && '💑 신혼부부·초년생'} 
                {userGroup === '투자자' && '💼 투자자'} 맞춤 뉴스
              </h1>
              <button 
                onClick={() => {
                  localStorage.removeItem('userGroup')
                  setUserGroup(null)
                  setActiveTab('')
                  setNews([])
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                그룹 변경
              </button>
            </div>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              {userGroup === '초보자' && '이해하기 쉬운 부동산 정보를 제공합니다'}
              {userGroup === '신혼부부·초년생' && '내 집 마련에 도움이 되는 실용적인 정보를 제공합니다'}
              {userGroup === '투자자' && '시장 분석과 투자 인사이트를 제공합니다'}
            </p>
          </div>

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
                {tab}
              </button>
            ))}
          </div>

          {newsLoading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p style={{ marginTop: '16px', color: '#6b7280' }}>
                {activeTab} 맞춤 뉴스를 요약하고 있습니다...
              </p>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <div style={{ 
                  background: '#f0f9ff', 
                  padding: '16px', 
                  borderRadius: '8px',
                  border: '1px solid #0ea5e9'
                }}>
                  <p style={{ color: '#0369a1', fontWeight: '500' }}>
                    {activeTab === '초보자용' && '🔰 부동산 초보자를 위한 쉬운 설명과 핵심 포인트'}
                    {activeTab === '신혼부부용' && '💑 내 집 마련을 준비하는 신혼부부를 위한 실용 정보'}
                    {activeTab === '투자자용' && '💼 투자 관점에서 분석한 시장 동향과 기회'}
                    {activeTab === '정책뉴스' && '📋 부동산 관련 정책 변화와 규제 동향'}
                    {activeTab === '시장분석' && '📈 시장 동향과 투자 기회 분석'}
                    {activeTab === '지원혜택' && '🎁 신혼부부와 청년을 위한 지원 혜택 정보'}
                  </p>
                </div>
              </div>

              <div>
                {news.map((item, index) => (
                  <div key={item.id} className="news-item">
                    <div className="news-title">
                      <span style={{ marginRight: '8px' }}>
                        {index === 0 && '🔥'}
                        {index === 1 && '📈'}
                        {index === 2 && '💡'}
                        {index === 3 && '🎯'}
                      </span>
                      {item.title}
                    </div>
                    <div className="news-summary">
                      {item.summary || item.content}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="news-date">
                        {new Date(item.publishedAt).toLocaleDateString('ko-KR')}
                      </div>
                      <a 
                        href={item.url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="button"
                        style={{ 
                          fontSize: '12px', 
                          padding: '6px 12px',
                          background: '#6b7280',
                          textDecoration: 'none',
                          display: 'inline-block'
                        }}
                      >
                        원문 보기
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ 
                marginTop: '32px', 
                padding: '20px', 
                background: '#fef3c7', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#92400e', marginBottom: '8px' }}>💡 더 많은 뉴스가 필요하세요?</h3>
                <p style={{ color: '#92400e', marginBottom: '16px' }}>
                  뉴스레터를 구독하고 매일 아침 맞춤 뉴스를 받아보세요!
                </p>
                <a href="/newsletter" className="button" style={{ background: '#d97706' }}>
                  뉴스레터 구독하기
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
