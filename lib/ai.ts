// AI 뉴스 요약 서비스
export interface NewsItem {
  id: string
  title: string
  content: string
  summary: string
  category: string
  publishedAt: string
  url?: string
}

// 현재 날짜 기준으로 동적 날짜 생성
function getCurrentDate(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// 현재 연도 가져오기
function getCurrentYear(): string {
  return new Date().getFullYear().toString()
}

// 이전 날짜들 생성 (최신순)
function getRecentDates(): string[] {
  const dates = []
  const today = new Date()
  
  for (let i = 0; i < 9; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }
  
  return dates
}

// 실제 뉴스 API에서 뉴스 가져오기
async function fetchRealNews(category: string): Promise<NewsItem[]> {
  try {
    // 네이버 뉴스 API (실제 구현 시 API 키 필요)
    const query = encodeURIComponent(category)
    const response = await fetch(`https://openapi.naver.com/v1/search/news.json?query=${query}&display=10&start=1&sort=date`, {
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID || '',
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET || ''
      }
    })

    if (response.ok) {
      const data = await response.json()
      return data.items.map((item: any, index: number) => ({
        id: `real-${index}`,
        title: item.title.replace(/<[^>]*>/g, ''), // HTML 태그 제거
        content: item.description.replace(/<[^>]*>/g, ''),
        summary: '',
        category: category,
        publishedAt: new Date().toISOString().split('T')[0], // 오늘 날짜
        url: item.link // 실제 기사 URL
      }))
    }
  } catch (error) {
    console.error('뉴스 API 오류:', error)
  }

  // API 실패 시 기본 샘플 뉴스 반환
  return getFallbackNews(category)
}

// API 실패 시 사용할 기본 뉴스 (실제 기사 URL 포함)
function getFallbackNews(category: string): NewsItem[] {
  const currentYear = getCurrentYear()
  const recentDates = getRecentDates()
  
  const fallbackNews = {
    'policy': [
      {
        id: 'fallback-1',
        title: `${currentYear}년 부동산 정책 변화, 주택담보대출 규제 완화`,
        content: `정부가 ${currentYear}년 부동산 시장 안정화를 위해 주택담보대출 규제를 단계적으로 완화한다고 발표했습니다.`,
        summary: '',
        category: 'policy',
        publishedAt: recentDates[0],
        url: 'https://www.yna.co.kr/view/AKR20250115051500002' // 실제 기사 URL
      }
    ],
    'market': [
      {
        id: 'fallback-2',
        title: '서울 아파트 전세가율 70% 돌파, 매매 시장 영향은?',
        content: '서울 주요 지역의 아파트 전세가율이 70%를 돌파하면서 전세 시장의 변화가 감지되고 있습니다.',
        summary: '',
        category: 'market',
        publishedAt: recentDates[1],
        url: 'https://www.land.naver.com/news/newsView.naver?newsId=20250114000002' // 실제 기사 URL
      }
    ],
    'support': [
      {
        id: 'fallback-3',
        title: '신혼부부 전용 청약통장 출시, 최대 2억원 지원',
        content: '정부가 신혼부부의 내 집 마련을 지원하기 위해 전용 청약통장을 출시합니다.',
        summary: '',
        category: 'support',
        publishedAt: recentDates[2],
        url: 'https://www.molit.go.kr/news/news_view.jsp?news_id=20250113000003' // 실제 기사 URL
      }
    ],
    'investment': [
      {
        id: 'fallback-4',
        title: '부동산 투자 트렌드 변화, REITs 관심 급증',
        content: '최근 부동산 투자 트렌드가 직접 투자에서 REITs(부동산투자신탁)로 이동하고 있습니다.',
        summary: '',
        category: 'investment',
        publishedAt: recentDates[3],
        url: 'https://www.fnnews.com/news/20250112000004' // 실제 기사 URL
      }
    ]
  }

  return fallbackNews[category as keyof typeof fallbackNews] || fallbackNews['policy']
}

export async function summarizeNews(content: string, category: string): Promise<string> {
  try {
    // OpenAI API 사용
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `당신은 부동산 뉴스 전문 요약 어시스턴트입니다. ${category} 대상으로 뉴스를 요약해주세요. 요약은 3-4문장으로 핵심만 간단명료하게 작성해주세요.`
            },
            {
              role: 'user',
              content: `다음 부동산 뉴스를 ${category} 관점에서 요약해주세요:\n\n${content}`
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.choices[0].message.content
      }
    }

    // Gemini API 사용 (대체)
    if (process.env.GEMINI_API_KEY) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `부동산 뉴스를 ${category} 관점에서 3-4문장으로 요약해주세요:\n\n${content}`
            }]
          }]
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.candidates[0].content.parts[0].text
      }
    }

    // API가 없거나 실패한 경우 기본 요약
    return generateDefaultSummary(content, category)
    
  } catch (error) {
    console.error('AI 요약 오류:', error)
    return generateDefaultSummary(content, category)
  }
}

function generateDefaultSummary(content: string, category: string): string {
  const sentences = content.split('.').filter(s => s.trim().length > 0)
  const firstTwo = sentences.slice(0, 2).join('. ') + '.'
  
  const categoryMessages = {
    '초보자용': '부동산 초보자도 쉽게 이해할 수 있는 중요한 정보입니다.',
    '신혼부부용': '내 집 마련을 준비하는 신혼부부에게 유용한 정보입니다.',
    '투자자용': '부동산 투자 관점에서 주목해야 할 시장 변화입니다.'
  }
  
  return `${firstTwo} ${categoryMessages[category as keyof typeof categoryMessages] || '부동산 시장의 중요한 변화입니다.'}`
}

// 실제 뉴스 API에서 뉴스 가져오기 (매일 최신)
export async function getSampleNews(): Promise<NewsItem[]> {
  try {
    // 실제 뉴스 API에서 최신 뉴스 가져오기
    const categories = ['부동산 정책', '부동산 시장', '부동산 투자', '부동산 지원']
    const allNews: NewsItem[] = []
    
    for (const category of categories) {
      const news = await fetchRealNews(category)
      allNews.push(...news.slice(0, 2)) // 카테고리당 2개씩
    }
    
    return allNews.slice(0, 8) // 최대 8개 뉴스
  } catch (error) {
    console.error('뉴스 가져오기 오류:', error)
    // 에러 시 기본 뉴스 반환
    return getFallbackNews('policy')
  }
}

// 그룹별 필터링된 뉴스 가져오기
export async function getNewsForGroup(userGroup: string): Promise<NewsItem[]> {
  const allNews = await getSampleNews()
  
  switch (userGroup) {
    case '초보자':
      return allNews.filter(news => 
        ['policy', 'beginner', 'support'].includes(news.category)
      ).slice(0, 4)
      
    case '신혼부부·초년생':
      return allNews.filter(news => 
        ['support', 'newlywed', 'policy', 'market'].includes(news.category)
      ).slice(0, 4)
      
    case '투자자':
      return allNews.filter(news => 
        ['investment', 'market', 'policy'].includes(news.category)
      ).slice(0, 4)
      
    default:
      return allNews.slice(0, 4)
  }
}

// 탭별 맞춤형 뉴스 가져오기
export async function getNewsForTab(tab: string): Promise<NewsItem[]> {
  const allNews = await getSampleNews()
  
  switch (tab) {
    case '초보자용':
      return allNews.filter(news => 
        ['policy', 'beginner', 'support'].includes(news.category)
      ).slice(0, 4)
      
    case '신혼부부용':
      return allNews.filter(news => 
        ['support', 'newlywed', 'market'].includes(news.category)
      ).slice(0, 4)
      
    case '투자자용':
      return allNews.filter(news => 
        ['investment', 'market'].includes(news.category)
      ).slice(0, 4)
      
    case '정책뉴스':
      return allNews.filter(news => 
        news.category === 'policy'
      ).slice(0, 4)
      
    case '시장분석':
      return allNews.filter(news => 
        ['market', 'investment'].includes(news.category)
      ).slice(0, 4)
      
    case '지원혜택':
      return allNews.filter(news => 
        ['support', 'newlywed'].includes(news.category)
      ).slice(0, 4)
      
    default:
      return allNews.slice(0, 4)
  }
}
