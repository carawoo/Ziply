'use client'

import { useState, useEffect } from 'react'

interface NewsItem {
  id: string
  title: string
  summary: string
  content: string
  url: string
  publishedAt: string
  category: string
  source: string
  glossary?: string
}

interface ApiResponse {
  success: boolean
  data?: {
    newsletter: {
      title: string
      date: string
      category: string
      totalItems: number
      items: NewsItem[]
    }
    meta: {
      generatedAt: string
      source: string
      version: string
      supportedCategories: string[]
    }
  }
  error?: string
}

export default function ApiDemo() {
  const [category, setCategory] = useState('all')
  const [limit, setLimit] = useState(4)
  const [includeGlossary, setIncludeGlossary] = useState(true)
  const [format, setFormat] = useState('json')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const categories = [
    { value: 'all', label: '종합' },
    { value: '정책뉴스', label: '정책뉴스' },
    { value: '시장분석', label: '시장분석' },
    { value: '지원혜택', label: '지원혜택' },
    { value: '초보자용', label: '초보자용' },
    { value: '신혼부부용', label: '신혼부부용' },
    { value: '투자자용', label: '투자자용' }
  ]

  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const params = new URLSearchParams({
        category,
        limit: limit.toString(),
        format,
        glossary: includeGlossary.toString()
      })

      const apiUrl = `/api/public/newsletter?${params.toString()}`
      console.log('API 호출:', apiUrl)

      const res = await fetch(apiUrl)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const generateCodeExample = () => {
    const params = new URLSearchParams({
      category,
      limit: limit.toString(),
      format,
      glossary: includeGlossary.toString()
    })
    
    return `// JavaScript 예시
const response = await fetch('https://ziply-nine.vercel.app/api/public/newsletter?${params.toString()}');
const data = await response.json();

if (data.success) {
  const newsItems = data.data.newsletter.items;
  newsItems.forEach(news => {
    console.log(news.title);
    console.log(news.summary);
    ${includeGlossary ? 'if (news.glossary) console.log("용어 설명:", news.glossary);' : ''}
  });
}`
  }

  useEffect(() => {
    // 페이지 로드 시 자동으로 한 번 호출
    fetchNews()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📰 Ziply Newsletter API 데모
          </h1>
          <p className="text-lg text-gray-600">
            다른 서비스에서 Ziply의 뉴스레터 콘텐츠를 사용할 수 있는 공개 API를 테스트해보세요
          </p>
        </div>

        {/* API 설정 패널 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🔧 API 설정</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                뉴스 개수
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                응답 포맷
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="json">JSON</option>
                <option value="html">HTML</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="glossary"
                checked={includeGlossary}
                onChange={(e) => setIncludeGlossary(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="glossary" className="text-sm font-medium text-gray-700">
                용어 풀이 포함
              </label>
            </div>
          </div>

          <button
            onClick={fetchNews}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? '로딩 중...' : '🚀 API 호출하기'}
          </button>
        </div>

        {/* 코드 예시 */}
        <div className="bg-gray-900 text-green-400 rounded-lg p-6 mb-8 font-mono text-sm">
          <h3 className="text-white mb-4">💻 코드 예시</h3>
          <pre className="whitespace-pre-wrap overflow-x-auto">
            {generateCodeExample()}
          </pre>
        </div>

        {/* 응답 결과 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h3 className="text-red-800 font-semibold mb-2">❌ 오류 발생</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {response && (
          <div className="space-y-8">
            {/* 메타 정보 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">📊 응답 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">제목:</span> {response.data?.newsletter.title}
                </div>
                <div>
                  <span className="font-medium">날짜:</span> {response.data?.newsletter.date}
                </div>
                <div>
                  <span className="font-medium">총 뉴스:</span> {response.data?.newsletter.totalItems}개
                </div>
              </div>
            </div>

            {/* 뉴스 목록 */}
            {format === 'json' && response.data?.newsletter.items && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-6">📰 뉴스 목록</h3>
                <div className="space-y-6">
                  {response.data.newsletter.items.map((news, index) => (
                    <div key={news.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-900 flex-1 mr-4">
                          {index === 0 ? '🔥' : index === 1 ? '📈' : index === 2 ? '💡' : '🎯'} {news.title}
                        </h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {news.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3 leading-relaxed">
                        {news.summary}
                      </p>

                      {news.glossary && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <div className="text-blue-800 font-medium text-sm mb-1">
                            📖 쉬운 설명
                          </div>
                          <div className="text-blue-700 text-sm leading-relaxed whitespace-pre-line">
                            {news.glossary}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          {new Date(news.publishedAt).toLocaleDateString('ko-KR')}
                        </span>
                        <a
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          원문 보기 →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HTML 응답 */}
            {format === 'html' && response.data && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">🌐 HTML 응답</h3>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: response.data as any }}
                  />
                </div>
              </div>
            )}

            {/* 원본 JSON 응답 */}
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6">
              <h3 className="text-white mb-4">📋 원본 JSON 응답</h3>
              <pre className="whitespace-pre-wrap overflow-x-auto text-sm">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
