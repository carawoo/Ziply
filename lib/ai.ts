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

// 그룹별 맞춤형 샘플 뉴스 데이터
export function getSampleNews(): NewsItem[] {
  return [
    // 정책 관련 뉴스
    {
      id: '1',
      title: '2024년 부동산 정책 변화, 주택담보대출 규제 완화',
      content: '정부가 2024년 부동산 시장 안정화를 위해 주택담보대출 규제를 단계적으로 완화한다고 발표했습니다. DSR(총부채원리금상환비율) 기준이 기존 40%에서 50%로 상향 조정되며, 1주택자에 대한 대출 규제도 완화됩니다.',
      summary: '',
      category: 'policy',
      publishedAt: '2024-01-15',
      url: 'https://www.land.naver.com/news/newsView.naver?newsId=20240115000001'
    },
    
    // 시장 동향 뉴스
    {
      id: '2',
      title: '서울 아파트 전세가율 70% 돌파, 매매 시장 영향은?',
      content: '서울 주요 지역의 아파트 전세가율이 70%를 돌파하면서 전세 시장의 변화가 감지되고 있습니다. 강남구 일부 단지는 전세가율이 75%에 달하며, 이는 매매 시장에도 영향을 미칠 것으로 전망됩니다.',
      summary: '',
      category: 'market',
      publishedAt: '2024-01-14',
      url: 'https://www.land.naver.com/news/newsView.naver?newsId=20240114000002'
    },
    
    // 신혼부부 지원 뉴스
    {
      id: '3',
      title: '신혼부부 전용 청약통장 출시, 최대 2억원 지원',
      content: '정부가 신혼부부의 내 집 마련을 지원하기 위해 전용 청약통장을 출시합니다. 5년간 최대 2억원을 지원하며, 첫 주택 구입 시 우대금리도 적용됩니다. 혼인신고일로부터 7년 이내 부부가 대상입니다.',
      summary: '',
      category: 'support',
      publishedAt: '2024-01-13',
      url: 'https://www.land.naver.com/news/newsView.naver?newsId=20240113000003'
    },
    
    // 투자 관련 뉴스
    {
      id: '4',
      title: '부동산 투자 트렌드 변화, REITs 관심 급증',
      content: '최근 부동산 투자 트렌드가 직접 투자에서 REITs(부동산투자신탁)로 이동하고 있습니다. 높은 배당수익률과 낮은 진입장벽으로 개인투자자들의 관심이 급증하고 있으며, 올해 REITs 시장 규모가 30% 성장할 것으로 예상됩니다.',
      summary: '',
      category: 'investment',
      publishedAt: '2024-01-12',
      url: 'https://www.land.naver.com/news/newsView.naver?newsId=20240112000004'
    },
    
    // 추가 초보자용 뉴스
    {
      id: '5',
      title: '처음 집 사는 사람을 위한 부동산 기초 가이드',
      content: '부동산 구매가 처음인 분들이 알아야 할 필수 정보들을 정리했습니다. 전세권, 근저당권, 중도금 대출 등의 기본 용어부터 실제 계약 과정까지 단계별로 설명합니다.',
      summary: '',
      category: 'beginner',
      publishedAt: '2024-01-16',
      url: 'https://www.land.naver.com/news/newsView.naver?newsId=20240116000005'
    },
    
    // 추가 신혼부부용 뉴스
    {
      id: '6',
      title: '신혼부부 특별공급, 2024년 새로운 신청 조건 공개',
      content: '2024년 신혼부부 특별공급 신청 조건이 일부 완화됩니다. 혼인 기간이 7년에서 8년으로 연장되며, 소득 기준도 상향 조정됩니다. 또한 맞벌이 부부에 대한 추가 혜택도 신설됩니다.',
      summary: '',
      category: 'newlywed',
      publishedAt: '2024-01-11',
      url: 'https://www.land.naver.com/news/newsView.naver?newsId=20240111000006'
    },
    
    // 추가 투자자용 뉴스
    {
      id: '7',
      title: '2024년 부동산 투자 전략, 지역별 수익률 분석',
      content: '2024년 부동산 투자 유망 지역과 예상 수익률을 분석했습니다. 수도권 외곽 지역의 개발 호재와 교통망 확충이 투자 포인트로 떠오르고 있으며, 상업용 부동산의 임대 수익률도 상승세를 보이고 있습니다.',
      summary: '',
      category: 'investment',
      publishedAt: '2024-01-10',
      url: 'https://www.land.naver.com/news/newsView.naver?newsId=20240110000007'
    },
    
    // 추가 정책 뉴스
    {
      id: '8',
      title: '토지거래허가제 일부 해제, 투자 시장에 미치는 영향',
      content: '정부가 부동산 시장 정상화를 위해 토지거래허가제를 일부 지역에서 해제한다고 발표했습니다. 수도권 일부 지역과 광역시 외곽 지역이 대상이며, 이로 인한 토지 거래 활성화가 예상됩니다.',
      summary: '',
      category: 'policy',
      publishedAt: '2024-01-09',
      url: 'https://www.land.naver.com/news/newsView.naver?newsId=20240109000008'
    },
    
    // 추가 시장 분석 뉴스
    {
      id: '9',
      title: '2024년 1분기 부동산 시장 전망, 금리 인하 기대감',
      content: '올해 1분기 부동산 시장이 금리 인하 기대감으로 활기를 찾을 것으로 전망됩니다. 한국은행의 기준금리 인하 가능성이 높아지면서 주택담보대출 금리도 하락세를 보일 것으로 예상됩니다.',
      summary: '',
      category: 'market',
      publishedAt: '2024-01-08',
      url: 'https://www.land.naver.com/news/newsView.naver?newsId=20240108000009'
    }
  ]
}

// 그룹별 필터링된 뉴스 가져오기
export function getNewsForGroup(userGroup: string): NewsItem[] {
  const allNews = getSampleNews()
  
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
export function getNewsForTab(tab: string): NewsItem[] {
  const allNews = getSampleNews()
  
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
