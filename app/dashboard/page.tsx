'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { getSampleNews, summarizeNews, NewsItem } from '@/lib/ai'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [newsLoading, setNewsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('초보자용')
  const [news, setNews] = useState<NewsItem[]>([])

  const tabs = ['초보자용', '신혼부부용', '투자자용']

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        window.location.href = '/'
        return
      }
      
      setUser(user)
      setLoading(false)
      
      // 뉴스 로드
      await loadNews('초보자용')
    }

    getUser()
  }, [])

  const loadNews = async (category: string) => {
    setNewsLoading(true)
    try {
      const sampleNews = getSampleNews()
      
      // AI 요약 생성
      const newsWithSummaries = await Promise.all(
        sampleNews.map(async (item) => {
          const summary = await summarizeNews(item.content, category)
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

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
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
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: '#1f2937' }}>
              안녕하세요! 📊
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              오늘의 부동산 뉴스를 맞춤형으로 요약해드립니다
            </p>
          </div>

          <div className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabChange(tab)}
              >
                {tab === '초보자용' && '🔰'} 
                {tab === '신혼부부용' && '💑'} 
                {tab === '투자자용' && '💼'} 
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
                      <button 
                        className="button"
                        style={{ 
                          fontSize: '12px', 
                          padding: '6px 12px',
                          background: '#6b7280'
                        }}
                        onClick={() => alert('원문 보기 기능은 실제 뉴스 API 연동 후 활성화됩니다.')}
                      >
                        원문 보기
                      </button>
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
