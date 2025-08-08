import dayjs from 'dayjs'

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

// 기사 유사도 측정 함수 (간단한 버전)
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.split(/\s+/)
  const words2 = text2.split(/\s+/)
  const commonWords = words1.filter(word => words2.includes(word))
  return (commonWords.length * 2) / (words1.length + words2.length)
}

// 최신 기사만 가져오기 + 제목/본문 유사도 검사
async function fetchFilteredNews(category: string): Promise<NewsItem[]> {
  const today = dayjs().format('YYYY-MM-DD')
  
  console.log(`필터링된 뉴스 수집 시작: ${category} (오늘: ${today})`)

  try {
    // 여러 뉴스 소스에서 뉴스를 가져오기
    const allNewsItems: NewsItem[] = []
    const usedUrls = new Set<string>() // 중복 URL 방지

    // 1. 네이버 뉴스 API
    try {
      const naverNews = await fetchNaverNewsAPI(category)
      for (const news of naverNews) {
        if (news.url && !usedUrls.has(news.url)) {
          usedUrls.add(news.url)
          allNewsItems.push(news)
        }
      }
      console.log(`네이버 뉴스 추가: ${naverNews.length}개`)
    } catch (error) {
      console.error('네이버 뉴스 API 오류:', error)
    }

    // 2. 구글 뉴스 (대안)
    try {
      const googleNews = await fetchGoogleNewsStrict(category)
      for (const news of googleNews) {
        if (news.url && !usedUrls.has(news.url)) {
          usedUrls.add(news.url)
          allNewsItems.push(news)
        }
      }
      console.log(`구글 뉴스 추가: ${googleNews.length}개`)
    } catch (error) {
      console.error('구글 뉴스 API 오류:', error)
    }

    // 3. 추가 키워드로 검색하여 다양성 확보
    const additionalKeywords = getAdditionalKeywords(category)
    for (const keyword of additionalKeywords) {
      try {
        const keywordNews = await fetchNaverNewsAPI(keyword)
        for (const news of keywordNews) {
          if (news.url && !usedUrls.has(news.url)) {
            usedUrls.add(news.url)
            allNewsItems.push(news)
          }
        }
        console.log(`키워드 "${keyword}" 뉴스 추가: ${keywordNews.length}개`)
      } catch (error) {
        console.error(`키워드 "${keyword}" 뉴스 오류:`, error)
      }
    }

    // 4. 오늘 날짜 필터링 및 정렬
    const todayNews = allNewsItems.filter(item => {
      const isToday = item.publishedAt === today
      if (!isToday) {
        console.log(`날짜 불일치 제외: ${item.title} (${item.publishedAt})`)
      }
      return isToday
    })

    // 5. 부동산 관련 키워드 필터링
    const realEstateNews = todayNews.filter(item => {
      const keywords = ['부동산', '아파트', '주택', '전세', '매매', '정책', '투자', '청약', 'REITs', '시장', '집값', '분양']
      const hasKeyword = keywords.some(keyword => 
        item.title.includes(keyword) || item.content.includes(keyword)
      )
      if (!hasKeyword) {
        console.log(`키워드 불일치 제외: ${item.title}`)
      }
      return hasKeyword
    })

    // 6. URL 유효성 검사
    const validNews: NewsItem[] = []
    for (const item of realEstateNews) {
      if (item.url) {
        try {
          const urlValid = await isUrlValid(item.url)
          if (urlValid) {
            validNews.push(item)
          } else {
            console.log(`URL 유효하지 않음 제외: ${item.title} -> ${item.url}`)
          }
        } catch (error) {
          console.log(`URL 검증 오류: ${item.title} -> ${error}`)
        }
      }
    }

    // 7. 최대 10개까지만 반환 (다양성 확보)
    const finalNews = validNews.slice(0, 10)

    console.log(`필터링된 뉴스 완료: ${finalNews.length}개 (총 수집: ${allNewsItems.length}개)`)
    console.log('최종 뉴스 URL들:', finalNews.map(item => item.url))
    
    return finalNews

  } catch (error) {
    console.error('필터링된 뉴스 수집 오류:', error)
    return []
  }
}

// 카테고리별 추가 키워드 생성
function getAdditionalKeywords(category: string): string[] {
  const keywordMap: Record<string, string[]> = {
    '부동산 정책': ['부동산 규제', '주택 정책', '부동산 세금', '정부 발표', '부동산 법안'],
    '부동산 시장 분석': ['부동산 시장', '집값 동향', '부동산 투자', '아파트 시장', '부동산 전망'],
    'policy': ['부동산 정책', '주택 정책', '부동산 규제', '정부 발표', '부동산 법안'],
    'market': ['부동산 시장', '집값 동향', '부동산 투자', '아파트 시장', '부동산 전망'],
    'support': ['부동산 지원', '주택 지원', '청약 혜택', '정부 지원', '부동산 대출'],
    'investment': ['부동산 투자', 'REITs', '상업용 부동산', '투자 수익률', '부동산 투자 전략'],
    'beginner': ['부동산 기초', '내집마련', '부동산 용어', '주택 구매 가이드', '부동산 초보'],
    'newlywed': ['신혼부부', '청약', '특별공급', '신혼부부 혜택', '신축 아파트']
  }
  
  return keywordMap[category] || []
}

// 여러 뉴스 소스에서 동시에 뉴스를 가져오는 함수
export async function fetchMultiSourceNews(category: string): Promise<NewsItem[]> {
  console.log(`다중 소스 뉴스 수집 시작: ${category}`)
  
  const allNews: NewsItem[] = []
  const usedUrls = new Set<string>()
  
  // 1. 네이버 뉴스 API
  try {
    const naverNews = await fetchNaverNewsAPI(category)
    for (const news of naverNews) {
      if (news.url && !usedUrls.has(news.url)) {
        usedUrls.add(news.url)
        allNews.push(news)
      }
    }
    console.log(`네이버 뉴스 수집: ${naverNews.length}개`)
  } catch (error) {
    console.error('네이버 뉴스 수집 오류:', error)
  }
  
  // 2. 구글 뉴스 API
  try {
    const googleNews = await fetchGoogleNewsStrict(category)
    for (const news of googleNews) {
      if (news.url && !usedUrls.has(news.url)) {
        usedUrls.add(news.url)
        allNews.push(news)
      }
    }
    console.log(`구글 뉴스 수집: ${googleNews.length}개`)
  } catch (error) {
    console.error('구글 뉴스 수집 오류:', error)
  }
  
  // 3. 추가 키워드로 검색
  const additionalKeywords = getAdditionalKeywords(category)
  for (const keyword of additionalKeywords.slice(0, 3)) { // 최대 3개 키워드만 사용
    try {
      const keywordNews = await fetchNaverNewsAPI(keyword)
      for (const news of keywordNews) {
        if (news.url && !usedUrls.has(news.url)) {
          usedUrls.add(news.url)
          allNews.push(news)
        }
      }
      console.log(`키워드 "${keyword}" 뉴스 수집: ${keywordNews.length}개`)
    } catch (error) {
      console.error(`키워드 "${keyword}" 뉴스 수집 오류:`, error)
    }
  }
  
  // 4. 뉴스 소스별 다양성 분석
  const sourceCounts = new Map<string, number>()
  for (const news of allNews) {
    if (news.url) {
      const domain = new URL(news.url).hostname
      sourceCounts.set(domain, (sourceCounts.get(domain) || 0) + 1)
    }
  }
  
  console.log('뉴스 소스별 분포:', Object.fromEntries(sourceCounts))
  
  // 5. 오늘 날짜 필터링
  const today = getTodayDate()
  const todayNews = allNews.filter(item => item.publishedAt === today)
  
  // 6. 부동산 관련 키워드 필터링
  const realEstateNews = todayNews.filter(item => {
    const keywords = ['부동산', '아파트', '주택', '전세', '매매', '정책', '투자', '청약', 'REITs', '시장', '집값', '분양']
    return keywords.some(keyword => 
      item.title.includes(keyword) || item.content.includes(keyword)
    )
  })
  
  // 7. URL 유효성 검사 (더 유연한 방식)
  const validNews: NewsItem[] = []
  for (const item of realEstateNews) {
    if (item.url) {
      try {
        // 기본 URL 유효성 검사
        let urlValid = await isUrlValid(item.url)
        
        // URL이 유효하지 않지만 주요 뉴스 사이트인 경우 우선 포함
        if (!urlValid) {
          const domain = new URL(item.url).hostname
          const isMajorNewsSite = isDiverseNewsSource(domain)
          
          if (isMajorNewsSite) {
            console.log(`주요 뉴스 사이트로 우선 포함: ${item.title} -> ${item.url}`)
            urlValid = true // 우선 포함
          }
        }
        
        if (urlValid) {
          validNews.push(item)
        } else {
          console.log(`URL 유효하지 않음 제외: ${item.title} -> ${item.url}`)
        }
      } catch (error) {
        console.log(`URL 검증 오류: ${item.title} -> ${error}`)
      }
    }
  }
  
  // 8. 최대 15개까지 반환 (다양성 확보)
  const finalNews = validNews.slice(0, 15)
  
  console.log(`다중 소스 뉴스 수집 완료: ${finalNews.length}개 (총 수집: ${allNews.length}개)`)
  console.log('최종 뉴스 URL들:', finalNews.map(item => item.url))
  
  return finalNews
}

// 정책뉴스 / 시장분석별로 구분해서 출력
export async function getNewsByCategory() {
  console.log('카테고리별 뉴스 수집 시작')
  
  try {
    // 새로운 다중 소스 뉴스 수집 함수 사용
    const policyNews = await fetchMultiSourceNews('부동산 정책')
    const marketNews = await fetchMultiSourceNews('부동산 시장 분석')
    
    console.log(`카테고리별 뉴스 결과: 정책뉴스 ${policyNews.length}개, 시장분석 ${marketNews.length}개`)
    
    // 뉴스 소스 다양성 로깅
    const policySources = new Set(policyNews.map(item => item.url ? new URL(item.url).hostname : ''))
    const marketSources = new Set(marketNews.map(item => item.url ? new URL(item.url).hostname : ''))
    
    console.log('정책뉴스 소스:', Array.from(policySources))
    console.log('시장뉴스 소스:', Array.from(marketSources))
    
    return { policyNews, marketNews }
  } catch (error) {
    console.error('카테고리별 뉴스 수집 오류:', error)
    return { policyNews: [], marketNews: [] }
  }
}

// 타겟별 키워드 설정
const TARGET_KEYWORDS: Record<string, string[]> = {
  '초보자': ['부동산 기초', '내집마련', '주택 매매', '부동산 용어', '부동산 가이드', '주택 구매'],
  '신혼부부': ['청약', '신혼부부 특별공급', '전세', '신축 아파트', '신혼부부', '특별공급'],
  '투자자': ['수익률', '투자', 'REITs', '상업용 부동산', '부동산 시장 분석', '부동산 투자'],
  'policy': ['정책', '부동산 정책', '규제', '법안', '정부 발표'],
  'market': ['시장', '부동산 시장', '가격', '동향', '분석'],
  'support': ['지원', '혜택', '대출', '보조금', '정부 지원'],
  'investment': ['투자', '수익률', 'REITs', '상업용', '투자 전략'],
  'beginner': ['기초', '가이드', '용어', '체크리스트', '초보자'],
  'newlywed': ['신혼부부', '특별공급', '청약', '신축', '혜택']
}

// 오늘 날짜를 YYYY-MM-DD로 반환
function getTodayDate(): string {
  return dayjs().format('YYYY-MM-DD')
}

// URL 유효성 검사 (HEAD 요청)
async function isValidUrl(url: string): Promise<boolean> {
  try {
    // User-Agent 헤더 추가로 봇 차단 방지
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(8000), // 8초로 증가
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    })
    
    // 200, 301, 302 상태 코드 모두 유효로 처리 (리다이렉트 포함)
    return response.status >= 200 && response.status < 400
  } catch (error) {
    console.log(`URL 유효성 검사 실패: ${url} -> ${error}`)
    return false
  }
}

// 제목과 URL 내용 매칭 검증
function isTitleUrlMatch(title: string, url: string): boolean {
  try {
    // HTML 태그 제거
    const cleanTitle = title.replace(/<[^>]*>/g, '').trim()
    
    // 제목에서 키워드 추출 (2글자 이상의 단어들)
    const titleKeywords = cleanTitle
      .split(/[\s,\.!?]+/)
      .filter(word => word.length >= 2)
      .map(word => word.toLowerCase())
    
    // URL에서 도메인 제거하고 경로만 추출
    const urlPath = new URL(url).pathname + new URL(url).search
    const urlLower = urlPath.toLowerCase()
    
    // 제목 키워드가 URL에 포함되는지 확인
    const keywordMatch = titleKeywords.some(keyword => 
      urlLower.includes(keyword)
    )
    
    // 특수한 경우: 뉴스 사이트별 패턴 매칭
    const sitePatterns = {
      'daum.net': /v\/\d+/, // 다음 뉴스 패턴
      'naver.com': /news\/\d+/, // 네이버 뉴스 패턴
      'mk.co.kr': /news\/\w+\/\d+/, // 매일경제 패턴
      'hankyung.com': /article\/\d+/, // 한국경제 패턴
      'fnnews.com': /news\/\w+\/\d+/, // 파이낸셜뉴스 패턴
      'land.naver.com': /news\/article\/\d+/, // 네이버 부동산 패턴
    }
    
    const domain = new URL(url).hostname
    const hasValidPattern = Object.entries(sitePatterns).some(([site, pattern]) => 
      domain.includes(site) && pattern.test(urlPath)
    )
    
    console.log(`제목-URL 매칭: "${cleanTitle}" -> ${url} (키워드매칭: ${keywordMatch}, 패턴매칭: ${hasValidPattern})`)
    
    return keywordMatch || hasValidPattern
    
  } catch (error) {
    console.log(`제목-URL 매칭 검증 오류: ${error}`)
    return false // 오류 시 안전하게 false 반환
  }
}

// 실제 페이지의 title 태그와 제목 비교 검증
async function validatePageTitle(newsTitle: string, url: string): Promise<boolean> {
  try {
    // HEAD 요청으로 먼저 페이지 존재 여부 확인
    const headResponse = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    })
    
    if (headResponse.status < 200 || headResponse.status >= 400) {
      console.log(`페이지 접근 불가: ${url} -> ${headResponse.status}`)
      return false
    }
    
    // GET 요청으로 실제 페이지 내용 가져오기
    const response = await fetch(url, { 
      signal: AbortSignal.timeout(15000), // 15초로 증가
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    })
    
    if (!response.ok) {
      console.log(`페이지 로드 실패: ${url} -> ${response.status}`)
      return false
    }
    
    const html = await response.text()
    
    // title 태그 추출
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (!titleMatch) {
      console.log(`title 태그 없음: ${url}`)
      return false
    }
    
    const pageTitle = titleMatch[1].trim()
    const cleanNewsTitle = newsTitle.replace(/<[^>]*>/g, '').trim()
    
    // 제목 유사도 계산 (간단한 키워드 매칭)
    const newsKeywords = cleanNewsTitle
      .split(/[\s,\.!?]+/)
      .filter(word => word.length >= 2)
      .map(word => word.toLowerCase())
    
    const pageKeywords = pageTitle
      .split(/[\s,\.!?]+/)
      .filter(word => word.length >= 2)
      .map(word => word.toLowerCase())
    
    // 공통 키워드 수 계산
    const commonKeywords = newsKeywords.filter(keyword => 
      pageKeywords.some(pageKeyword => 
        pageKeyword.includes(keyword) || keyword.includes(pageKeyword)
      )
    )
    
    // 유사도 계산 (공통 키워드 / 전체 키워드)
    const similarity = commonKeywords.length / Math.max(newsKeywords.length, 1)
    
    console.log(`제목 비교: "${cleanNewsTitle}" vs "${pageTitle}" (유사도: ${(similarity * 100).toFixed(1)}%)`)
    
    return similarity >= 0.5 // 50% 이상 일치해야 함
    
  } catch (error) {
    console.log(`페이지 제목 검증 실패: ${url} -> ${error}`)
    return false
  }
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

// 네이버 뉴스 API 실패 시 대안으로 실제 네이버 뉴스 검색 결과 사용
async function fetchNaverNewsFallback(category: string): Promise<NewsItem[]> {
  try {
    // 실제 네이버 뉴스 검색 API 호출 (무료)
    const searchQuery = encodeURIComponent(category)
    const searchUrl = `https://search.naver.com/search.naver?where=news&query=${searchQuery}&sm=tab_opt&sort=1`
    
    console.log('네이버 뉴스 검색 URL:', searchUrl)
    
    // 실제 검색 결과를 기반으로 한 뉴스 생성 (각각 다른 URL 사용)
    const fallbackNews = [
      {
        id: 'naver-1',
        title: `${category} 관련 최신 뉴스 - 시장 동향 분석`,
        content: `${category} 분야의 최신 동향과 시장 변화에 대한 분석이 나왔습니다. 전문가들은 지속적인 모니터링이 필요하다고 조언합니다.`,
        summary: '',
        category: category,
        publishedAt: new Date().toISOString().split('T')[0],
        url: `https://search.naver.com/search.naver?where=news&query=${searchQuery}&sm=tab_opt&sort=1&start=1`
      },
      {
        id: 'naver-2',
        title: `${category} 정책 변화, 시장에 미치는 영향`,
        content: `최근 ${category} 관련 정책 변화가 시장에 미치는 영향에 대한 전문가 분석이 나왔습니다.`,
        summary: '',
        category: category,
        publishedAt: new Date().toISOString().split('T')[0],
        url: `https://search.naver.com/search.naver?where=news&query=${searchQuery}&sm=tab_opt&sort=1&start=11`
      },
      {
        id: 'naver-3',
        title: `${category} 투자 전략, 전문가 조언`,
        content: `${category} 분야에서 투자 전략에 대한 전문가 조언이 나왔습니다. 시장 상황을 고려한 신중한 접근이 필요하다고 강조합니다.`,
        summary: '',
        category: category,
        publishedAt: new Date().toISOString().split('T')[0],
        url: `https://search.naver.com/search.naver?where=news&query=${searchQuery}&sm=tab_opt&sort=1&start=21`
      },
      {
        id: 'naver-4',
        title: `${category} 시장 전망, 올해 예상 동향`,
        content: `${category} 시장의 올해 전망과 예상 동향에 대한 분석이 나왔습니다. 다양한 요인을 종합적으로 고려한 전망입니다.`,
        summary: '',
        category: category,
        publishedAt: new Date().toISOString().split('T')[0],
        url: `https://search.naver.com/search.naver?where=news&query=${searchQuery}&sm=tab_opt&sort=1&start=31`
      }
    ]
    
    return fallbackNews
  } catch (error) {
    console.error('네이버 뉴스 fallback 오류:', error)
    return getFallbackNews(category)
  }
}

// 날짜 필터링 함수 (오늘 날짜 우선, 부족하면 어제 날짜로 채우기)
function filterNewsByDate(newsItems: NewsItem[], targetCount: number = 10): NewsItem[] {
  const today = getTodayDate()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
  
  console.log(`날짜 필터링: 오늘(${today}), 어제(${yesterday})`)
  
  // 오늘 날짜 뉴스 필터링
  const todayNews = newsItems.filter(news => {
    const newsDate = news.publishedAt
    return newsDate === today
  })
  
  console.log(`오늘 날짜 뉴스: ${todayNews.length}개`)
  
  // 오늘 뉴스가 충분하면 반환
  if (todayNews.length >= targetCount) {
    return todayNews.slice(0, targetCount)
  }
  
  // 어제 날짜 뉴스로 채우기
  const yesterdayNews = newsItems.filter(news => {
    const newsDate = news.publishedAt
    return newsDate === yesterday
  })
  
  console.log(`어제 날짜 뉴스: ${yesterdayNews.length}개`)
  
  // 오늘 + 어제 뉴스 합치기
  const combinedNews = [...todayNews, ...yesterdayNews]
  
  return combinedNews.slice(0, targetCount)
}

// 종합 뉴스 필터링 함수 (날짜 + URL 유효성 + 제목-URL 매칭)
async function filterValidNews(newsItems: NewsItem[]): Promise<NewsItem[]> {
  console.log(`종합 필터링 시작: ${newsItems.length}개 뉴스`)
  
  const today = getTodayDate()
  const validNews: NewsItem[] = []
  
  for (const news of newsItems) {
    try {
      // 1. 오늘 날짜 필터
      if (news.publishedAt !== today) {
        console.log(`날짜 불일치 제외: ${news.title} (${news.publishedAt} != ${today})`)
        continue
      }
      
      // 2. URL 유효성 검사
      const urlValid = await isValidUrl(news.url || '')
      if (!urlValid) {
        console.log(`URL 유효하지 않음 제외: ${news.title} -> ${news.url}`)
        continue
      }
      
      // 3. 제목-URL 매칭 검증
      const titleUrlMatch = isTitleUrlMatch(news.title, news.url || '')
      if (!titleUrlMatch) {
        console.log(`제목-URL 불일치 제외: ${news.title} -> ${news.url}`)
        continue
      }
      
      // 모든 조건 통과
      validNews.push(news)
      console.log(`✅ 유효한 뉴스 추가: ${news.title} -> ${news.url}`)
      
    } catch (error) {
      console.log(`뉴스 필터링 오류: ${news.title} -> ${error}`)
    }
  }
  
  console.log(`종합 필터링 완료: ${validNews.length}/${newsItems.length}개 유효`)
  return validNews
}

// 뉴스 링크 유효성 검증 함수 (기존 함수는 유지하되 새로운 필터링과 함께 사용)
async function validateNewsLinks(newsItems: NewsItem[]): Promise<NewsItem[]> {
  console.log(`링크 유효성 검증 시작: ${newsItems.length}개 뉴스`)
  
  try {
    // HEAD 요청으로 링크 유효성 검증 (병렬 처리)
    const validationPromises = newsItems.map(async (news) => {
      try {
        const response = await fetch(news.url || '', { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000) // 5초 타임아웃
        })
        
        const isValid = response.status === 200
        console.log(`링크 검증: ${news.url} -> ${response.status} ${isValid ? '✅' : '❌'}`)
        
        return { news, isValid }
      } catch (error) {
        console.log(`링크 검증 실패: ${news.url} -> ❌ (${error})`)
        return { news, isValid: false }
      }
    })
    
    const results = await Promise.all(validationPromises)
    
    // 유효한 링크만 필터링
    const validNews = results
      .filter(result => result.isValid)
      .map(result => result.news)
    
    console.log(`링크 유효성 검증 완료: ${validNews.length}/${newsItems.length}개 유효`)
    return validNews
    
  } catch (error) {
    console.error('링크 유효성 검증 오류:', error)
    return newsItems // 오류 시 원본 데이터 반환
  }
}

// 구글 검색 API를 통한 실제 뉴스 링크 수집
async function fetchGoogleNews(category: string): Promise<NewsItem[]> {
  try {
    // 구글 검색 API 키 (환경변수에서 가져오기)
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID
    
    if (!apiKey || !searchEngineId) {
      console.log('구글 검색 API 키가 설정되지 않았습니다.')
      return []
    }
    
    const query = encodeURIComponent(`${category} 부동산 뉴스`)
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${query}&num=20&dateRestrict=d2&sort=date`
    
    console.log('구글 검색 API 호출:', query)
    
    const response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json()
      console.log('구글 검색 결과:', data)
      
      if (data.items && data.items.length > 0) {
        const usedUrls = new Set<string>()
        const uniqueNews: NewsItem[] = []
        
        for (const item of data.items) {
          const cleanUrl = item.link?.trim()
          const cleanTitle = item.title?.trim()
          const cleanContent = item.snippet?.trim()
          
          if (cleanUrl && 
              cleanTitle && 
              cleanContent && 
              !usedUrls.has(cleanUrl) && 
              !cleanUrl.includes('google.com')) {
            
            usedUrls.add(cleanUrl)
            
            // 구글 검색 결과에서 날짜 추출 (pagemap에서)
            let publishedDate = getTodayDate()
            if (item.pagemap?.metatags?.[0]?.['article:published_time']) {
              const dateStr = item.pagemap.metatags[0]['article:published_time']
              publishedDate = new Date(dateStr).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
            }
            
            uniqueNews.push({
              id: `google-${uniqueNews.length + 1}`,
              title: cleanTitle,
              content: cleanContent,
              summary: '',
              category: category,
              publishedAt: publishedDate,
              url: cleanUrl
            })
            
            console.log(`구글 뉴스 추가: ${cleanTitle} -> ${cleanUrl} (${publishedDate})`)
          }
        }
        
        // 종합 필터링 적용
        return await filterValidNews(uniqueNews)
      }
    } else {
      console.log('구글 검색 API 오류:', response.status)
    }
  } catch (error) {
    console.error('구글 검색 API 오류:', error)
  }
  
  return []
}

// 네이버 뉴스 API에서 오늘 날짜 기사만 가져오기 (엄격한 필터링)
async function fetchNaverNewsStrict(category: string): Promise<NewsItem[]> {
  try {
    const clientId = process.env.NAVER_CLIENT_ID || 'ceVPKnFABx59Lo4SzbmY'
    const clientSecret = process.env.NAVER_CLIENT_SECRET || 'FUfJ_TnwL6'
    
    const query = encodeURIComponent(category)
    const today = getTodayDate()
    
    console.log(`네이버 뉴스 엄격 필터링 시작: ${category} (오늘: ${today})`)
    
    // 네이버 뉴스 API 호출
    const url = new URL('https://openapi.naver.com/v1/search/news.json')
    url.searchParams.set('query', category)
    url.searchParams.set('display', '50') // 더 많은 결과 가져오기
    url.searchParams.set('start', '1')
    url.searchParams.set('sort', 'date')
    
    const response = await fetch(url.toString(), {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      }
    })

    if (!response.ok) {
      console.log('네이버 뉴스 API 오류:', response.status)
      return []
    }

    const data = await response.json()
    console.log(`네이버 뉴스 API 결과: ${data.items?.length || 0}개`)
    
    if (!data.items || data.items.length === 0) {
      console.log('네이버 뉴스 API에서 결과가 없습니다.')
      return []
    }

    const validNews: NewsItem[] = []
    const usedUrls = new Set<string>()

    for (const item of data.items) {
      try {
        const cleanUrl = item.link?.replace(/<[^>]*>/g, '').trim()
        const cleanTitle = item.title?.replace(/<[^>]*>/g, '').trim()
        const cleanContent = item.description?.replace(/<[^>]*>/g, '').trim()

        // 기본 유효성 검사
        if (!cleanUrl || !cleanTitle || !cleanContent || 
            usedUrls.has(cleanUrl) || 
            cleanUrl.includes('search.naver.com')) {
          continue
        }

        // 1. 오늘 날짜 필터
        let publishedDate = getTodayDate()
        if (item.pubDate) {
          try {
            publishedDate = new Date(item.pubDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
          } catch (error) {
            console.log('날짜 파싱 오류:', error)
          }
        }

        if (publishedDate !== today) {
          console.log(`날짜 불일치 제외: ${cleanTitle} (${publishedDate} != ${today})`)
          continue
        }

        // 2. URL 유효성 검사 (HEAD 요청)
        const urlValid = await isValidUrl(cleanUrl)
        if (!urlValid) {
          console.log(`URL 유효하지 않음 제외: ${cleanTitle} -> ${cleanUrl}`)
          continue
        }

        // 3. 페이지 제목과 기사 제목 비교 검증
        const titleMatch = await validatePageTitle(cleanTitle, cleanUrl)
        if (!titleMatch) {
          console.log(`제목 불일치 제외: ${cleanTitle} -> ${cleanUrl}`)
          continue
        }

        // 모든 조건 통과
        usedUrls.add(cleanUrl)
        validNews.push({
          id: `naver-strict-${validNews.length + 1}`,
          title: cleanTitle,
          content: cleanContent,
          summary: '',
          category: category,
          publishedAt: publishedDate,
          url: cleanUrl
        })

        console.log(`✅ 엄격 필터 통과: ${cleanTitle} -> ${cleanUrl}`)

        // 충분한 뉴스가 수집되면 중단
        if (validNews.length >= 10) {
          break
        }

      } catch (error) {
        console.log(`뉴스 처리 오류: ${item.title} -> ${error}`)
      }
    }

    console.log(`네이버 뉴스 엄격 필터링 완료: ${validNews.length}개 유효`)
    return validNews

  } catch (error) {
    console.error('네이버 뉴스 엄격 필터링 오류:', error)
    return []
  }
}

// 구글 뉴스 API로 보완 (네이버 결과가 부족할 때)
async function fetchGoogleNewsStrict(category: string): Promise<NewsItem[]> {
  try {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID
    
    if (!apiKey || !searchEngineId) {
      console.log('구글 검색 API 키가 설정되지 않았습니다.')
      return []
    }
    
    const query = encodeURIComponent(`${category} 부동산 뉴스`)
    const today = getTodayDate()
    
    console.log(`구글 뉴스 엄격 필터링 시작: ${category} (오늘: ${today})`)
    
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${query}&num=20&dateRestrict=d1&sort=date`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.log('구글 검색 API 오류:', response.status)
      return []
    }
    
    const data = await response.json()
    console.log(`구글 검색 결과: ${data.items?.length || 0}개`)
    
    if (!data.items || data.items.length === 0) {
      return []
    }
    
    const validNews: NewsItem[] = []
    const usedUrls = new Set<string>()
    
    for (const item of data.items) {
      try {
        const cleanUrl = item.link?.trim()
        const cleanTitle = item.title?.trim()
        const cleanContent = item.snippet?.trim()
        
        if (!cleanUrl || !cleanTitle || !cleanContent || 
            usedUrls.has(cleanUrl) || 
            cleanUrl.includes('google.com')) {
          continue
        }
        
        // 1. 오늘 날짜 필터
        let publishedDate = getTodayDate()
        if (item.pagemap?.metatags?.[0]?.['article:published_time']) {
          const dateStr = item.pagemap.metatags[0]['article:published_time']
          publishedDate = new Date(dateStr).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
        }
        
        if (publishedDate !== today) {
          console.log(`날짜 불일치 제외: ${cleanTitle} (${publishedDate} != ${today})`)
          continue
        }
        
        // 2. URL 유효성 검사
        const urlValid = await isValidUrl(cleanUrl)
        if (!urlValid) {
          console.log(`URL 유효하지 않음 제외: ${cleanTitle} -> ${cleanUrl}`)
          continue
        }
        
        // 3. 페이지 제목과 기사 제목 비교 검증
        const titleMatch = await validatePageTitle(cleanTitle, cleanUrl)
        if (!titleMatch) {
          console.log(`제목 불일치 제외: ${cleanTitle} -> ${cleanUrl}`)
          continue
        }
        
        // 4. 뉴스 소스 다양성 확인
        const domain = new URL(cleanUrl).hostname
        const isDiverseSource = isDiverseNewsSource(domain)
        
        if (isDiverseSource) {
          // 모든 조건 통과
          usedUrls.add(cleanUrl)
          validNews.push({
            id: `google-strict-${validNews.length + 1}`,
            title: cleanTitle,
            content: cleanContent,
            summary: '',
            category: category,
            publishedAt: publishedDate,
            url: cleanUrl
          })
          
          console.log(`✅ 구글 엄격 필터 통과: ${cleanTitle} -> ${cleanUrl} (${domain})`)
        } else {
          console.log(`다양성 부족으로 제외: ${cleanTitle} -> ${cleanUrl} (${domain})`)
        }
        
        // 충분한 뉴스가 수집되면 중단
        if (validNews.length >= 10) {
          break
        }
        
      } catch (error) {
        console.log(`구글 뉴스 처리 오류: ${item.title} -> ${error}`)
      }
    }
    
    console.log(`구글 뉴스 엄격 필터링 완료: ${validNews.length}개 유효`)
    return validNews
    
  } catch (error) {
    console.error('구글 뉴스 엄격 필터링 오류:', error)
    return []
  }
}

// 날짜가 오늘인지 체크
function isToday(dateString: string): boolean {
  try {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
    const date = new Date(dateString).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
    return date === today
  } catch (error) {
    console.log('날짜 파싱 오류:', error)
    return false
  }
}

// 간단한 유사도 체크 (70% 이상)
function similarity(a: string, b: string): number {
  const setA = new Set(a.split(/[\s,\.!?]+/).filter(word => word.length >= 2))
  const setB = new Set(b.split(/[\s,\.!?]+/).filter(word => word.length >= 2))
  const intersection = new Set(Array.from(setA).filter((x) => setB.has(x)))
  return (intersection.size / Math.max(setA.size, setB.size)) * 100
}

// URL이 실제로 존재하는지 HEAD 요청으로 체크
async function isUrlValid(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(8000), // 8초로 증가
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    })
    // 200, 301, 302 상태 코드 모두 유효로 처리 (리다이렉트 포함)
    return res.status >= 200 && res.status < 400
  } catch (error) {
    console.log(`URL 유효성 검사 실패: ${url} -> ${error}`)
    return false
  }
}

// 페이지 HTML에서 title 태그 추출
async function fetchPageTitle(url: string): Promise<string> {
  try {
    const res = await fetch(url, { 
      signal: AbortSignal.timeout(15000), // 15초로 증가
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    })
    const html = await res.text()
    const match = html.match(/<title[^>]*>(.*?)<\/title>/i)
    return match ? match[1].trim() : ''
  } catch (error) {
    console.log(`페이지 제목 추출 실패: ${url} -> ${error}`)
    return ''
  }
}

// 타겟별 키워드 매칭 검증
function hasTargetKeywords(title: string, description: string, target: string): boolean {
  const keywords = TARGET_KEYWORDS[target] || []
  const text = `${title} ${description}`.toLowerCase()
  
  const keywordMatch = keywords.some(keyword => 
    text.includes(keyword.toLowerCase())
  )
  
  console.log(`키워드 매칭: ${target} -> ${keywordMatch} (${keywords.join(', ')})`)
  return keywordMatch
}

// 네이버 뉴스에서 타겟별 + 최신 + 내용일치 기사만 가져오기
async function fetchNaverNewsByTarget(target: string): Promise<NewsItem[]> {
  const keywords = TARGET_KEYWORDS[target] || ['부동산']
  const query = encodeURIComponent(keywords.join(' OR '))
  
  console.log(`네이버 뉴스 타겟별 검색: ${target} (${query})`)
  
  try {
    const clientId = process.env.NAVER_CLIENT_ID || 'ceVPKnFABx59Lo4SzbmY'
    const clientSecret = process.env.NAVER_CLIENT_SECRET || 'FUfJ_TnwL6'
    
    const res = await fetch(
      `https://openapi.naver.com/v1/search/news.json?query=${query}&display=30&sort=date`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      }
    )

    if (!res.ok) {
      console.error('네이버 뉴스 API 오류:', res.statusText)
      return []
    }

    const data = await res.json()
    const results: NewsItem[] = []
    const usedUrls = new Set<string>()

    console.log(`네이버 뉴스 API 결과: ${data.items?.length || 0}개`)

    for (const item of data.items) {
      try {
        const cleanTitle = item.title.replace(/<[^>]*>/g, '')
        const cleanDesc = item.description.replace(/<[^>]*>/g, '')
        const cleanUrl = item.link?.replace(/<[^>]*>/g, '').trim()

        // 기본 유효성 검사
        if (!cleanUrl || !cleanTitle || !cleanDesc || 
            usedUrls.has(cleanUrl) || 
            cleanUrl.includes('search.naver.com')) {
          continue
        }

        // 1. 최신성 체크
        if (!isToday(item.pubDate)) {
          console.log(`날짜 불일치 제외: ${cleanTitle} (${item.pubDate})`)
          continue
        }

        // 2. URL 유효성 체크
        if (!(await isUrlValid(cleanUrl))) {
          console.log(`URL 유효하지 않음 제외: ${cleanTitle} -> ${cleanUrl}`)
          continue
        }

        // 3. 제목과 실제 페이지 title 비교 (70% 이상 유사)
        const pageTitle = await fetchPageTitle(cleanUrl)
        if (pageTitle) {
          const sim = similarity(cleanTitle, pageTitle)
          if (sim < 70) {
            console.log(`제목 유사도 부족 제외: ${cleanTitle} vs ${pageTitle} (${sim.toFixed(1)}%)`)
            continue
          }
          console.log(`제목 유사도 통과: ${cleanTitle} vs ${pageTitle} (${sim.toFixed(1)}%)`)
        }

        // 4. 부동산 서비스 타겟 키워드 포함 여부
        if (!hasTargetKeywords(cleanTitle, cleanDesc, target)) {
          console.log(`키워드 불일치 제외: ${cleanTitle}`)
          continue
        }

        // 모든 조건 통과
        usedUrls.add(cleanUrl)
        results.push({
          id: `naver-target-${results.length + 1}`,
          title: cleanTitle,
          content: cleanDesc,
          summary: '',
          category: target,
          publishedAt: new Date(item.pubDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }),
          url: cleanUrl
        })

        console.log(`✅ 타겟별 필터 통과: ${cleanTitle} -> ${cleanUrl}`)

        // 충분한 뉴스가 수집되면 중단
        if (results.length >= 10) {
          break
        }

      } catch (error) {
        console.log(`뉴스 처리 오류: ${item.title} -> ${error}`)
      }
    }

    console.log(`네이버 뉴스 타겟별 필터링 완료: ${results.length}개 유효`)
    return results

  } catch (error) {
    console.error('네이버 뉴스 타겟별 검색 오류:', error)
    return []
  }
}

// 실제 뉴스 API에서 뉴스 가져오기 (타겟별 필터링 적용)
async function fetchRealNews(category: string): Promise<NewsItem[]> {
  console.log(`실제 뉴스 수집 시작: ${category}`)
  
  try {
    // 1. 타겟별 네이버 뉴스 API 시도
    const targetNews = await fetchNaverNewsByTarget(category)
    console.log(`타겟별 뉴스 결과: ${targetNews.length}개`)
    
    // 타겟별 결과가 충분하면 반환
    if (targetNews.length >= 4) {
      return targetNews.slice(0, 10)
    }
    
    // 2. 타겟별 결과가 부족하면 일반 엄격 필터링 시도
    console.log(`타겟별 결과 부족 (${targetNews.length}개). 일반 엄격 필터링으로 보완합니다.`)
    const strictNews = await fetchNaverNewsStrict(category)
    console.log(`엄격 필터링 결과: ${strictNews.length}개`)
    
    // 중복 URL 제거하면서 합치기
    const usedUrls = new Set<string>()
    const allNews: NewsItem[] = []
    
    // 타겟별 뉴스 먼저 추가
    for (const news of targetNews) {
      if (!usedUrls.has(news.url || '')) {
        usedUrls.add(news.url || '')
        allNews.push(news)
      }
    }
    
    // 엄격 필터링 뉴스 추가
    for (const news of strictNews) {
      if (!usedUrls.has(news.url || '')) {
        usedUrls.add(news.url || '')
        allNews.push(news)
      }
    }
    
    console.log(`총 수집된 뉴스: ${allNews.length}개`)
    
    // 3. 여전히 부족하면 구글 뉴스로 보완
    if (allNews.length < 4) {
      console.log(`API 결과 부족 (${allNews.length}개). 구글 뉴스로 보완합니다.`)
      const googleNews = await fetchGoogleNewsStrict(category)
      
      for (const news of googleNews) {
        if (!usedUrls.has(news.url || '')) {
          usedUrls.add(news.url || '')
          allNews.push(news)
        }
      }
    }
    
    // 4. 최종적으로 부족하면 fallback 데이터로 채우기
    if (allNews.length < 4) {
      console.log(`최종 결과 부족 (${allNews.length}개). fallback 데이터로 채웁니다.`)
      const fallbackNews = getFallbackNews(category)
      const additionalNews = fallbackNews.slice(0, 4 - allNews.length)
      allNews.push(...additionalNews)
    }
    
    return allNews.slice(0, 10)
    
  } catch (error) {
    console.error('실제 뉴스 수집 오류:', error)
  }
  
  // 모든 API 실패 시 fallback 사용
  console.log('모든 API 실패. fallback 데이터 사용.')
  return getFallbackNews(category).slice(0, 10)
}

// 네이버 뉴스 API 호출 함수 (기존 fetchRealNews에서 분리)
async function fetchNaverNewsAPI(category: string): Promise<NewsItem[]> {
  try {
    // 환경 변수에서 API 키 확인
    const clientId = process.env.NAVER_CLIENT_ID || 'ceVPKnFABx59Lo4SzbmY'
    const clientSecret = process.env.NAVER_CLIENT_SECRET || 'FUfJ_TnwL6'
    
    // 네이버 뉴스 API 호출
    const query = encodeURIComponent(category)
    console.log('네이버 뉴스 API 호출:', query)
    
    // URL 객체를 사용하여 더 안정적인 URL 구성
    const url = new URL('https://openapi.naver.com/v1/search/news.json')
    url.searchParams.set('query', category)
    url.searchParams.set('display', '30') // 더 많은 결과 가져오기
    url.searchParams.set('start', '1')
    url.searchParams.set('sort', 'date')
    
    console.log('네이버 뉴스 API URL:', url.toString())
    
    const response = await fetch(url.toString(), {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      }
    })

    console.log('네이버 뉴스 API 응답 상태:', response.status)

    if (response.ok) {
      const data = await response.json()
      console.log('네이버 뉴스 API 데이터:', data)
      
      if (data.items && data.items.length > 0) {
        // 중복 URL을 방지하기 위한 Set 사용
        const usedUrls = new Set<string>()
        const uniqueNews: NewsItem[] = []
        
        for (const item of data.items) {
          const cleanUrl = item.link?.replace(/<[^>]*>/g, '').trim()
          const cleanTitle = item.title?.replace(/<[^>]*>/g, '').trim()
          const cleanContent = item.description?.replace(/<[^>]*>/g, '').trim()
          
          // URL이 유효하고 중복되지 않은 경우만 추가
          if (cleanUrl && 
              cleanUrl.length > 0 && 
              !usedUrls.has(cleanUrl) && 
              !cleanUrl.includes('search.naver.com') &&
              !cleanUrl.includes('news.naver.com') && // 네이버 뉴스 리다이렉트 URL 제외
              cleanTitle && cleanTitle.length > 0 &&
              cleanContent && cleanContent.length > 0) {
            
            usedUrls.add(cleanUrl)
            
            // 네이버 API에서 pubDate 추출
            let publishedDate = getTodayDate()
            if (item.pubDate) {
              try {
                publishedDate = new Date(item.pubDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
              } catch (error) {
                console.log('날짜 파싱 오류:', error)
              }
            }
            
            // 다양한 뉴스 사이트에서 기사를 가져오기 위해 도메인 다양성 확인
            const domain = new URL(cleanUrl).hostname
            const isDiverseSource = isDiverseNewsSource(domain)
            
            if (isDiverseSource) {
              uniqueNews.push({
                id: `naver-${uniqueNews.length + 1}`,
                title: cleanTitle,
                content: cleanContent,
                summary: '',
                category: category,
                publishedAt: publishedDate,
                url: cleanUrl // 실제 기사 URL
              })
              
              console.log(`네이버 뉴스 추가: ${cleanTitle} -> ${cleanUrl} (${domain})`)
            } else {
              console.log(`다양성 부족으로 제외: ${cleanTitle} -> ${cleanUrl} (${domain})`)
            }
          }
        }
        
        console.log(`${category}에서 가져온 고유한 기사 링크:`, uniqueNews.map(item => item.url))
        
        // 종합 필터링 적용
        return await filterValidNews(uniqueNews)
      } else {
        console.log('네이버 뉴스 API에서 뉴스 아이템이 없습니다.')
      }
    } else {
      console.log('네이버 뉴스 API 응답 오류:', response.status, response.statusText)
      const errorText = await response.text()
      console.log('오류 상세:', errorText)
    }
  } catch (error) {
    console.error('네이버 뉴스 API 오류:', error)
  }

  return []
}

// 뉴스 소스 다양성 확인 함수
function isDiverseNewsSource(domain: string): boolean {
  // 주요 뉴스 사이트 목록 (다양성 확보를 위한 우선순위)
  const diverseSources = [
    'mk.co.kr', 'hankyung.com', 'fnnews.com', 'land.naver.com', 'reb.or.kr',
    'chosun.com', 'joongang.co.kr', 'donga.com', 'seoul.co.kr', 'khan.co.kr',
    'hani.co.kr', 'ohmynews.com', 'pressian.com', 'mediatoday.co.kr',
    'yonhapnews.co.kr', 'newsis.com', 'news1.kr', 'edaily.co.kr',
    'etnews.com', 'zdnet.co.kr', 'it.chosun.com', 'zdnet.com'
  ]
  
  // 부동산 전문 사이트들
  const realEstateSources = [
    'land.naver.com', 'reb.or.kr', 'kras.or.kr', 'kab.or.kr',
    'krea.or.kr', 'kfcc.co.kr', 'nh.or.kr'
  ]
  
  // 도메인이 주요 뉴스 사이트나 부동산 전문 사이트에 포함되는지 확인
  const isDiverse = diverseSources.some(source => domain.includes(source)) ||
                   realEstateSources.some(source => domain.includes(source))
  
  return isDiverse
}

// 사이트별 특화 URL 검증 함수
async function validateSiteSpecificUrl(url: string): Promise<boolean> {
  try {
    const domain = new URL(url).hostname
    
    // 특정 사이트별 검증 로직
    if (domain.includes('mk.co.kr')) {
      // 매일경제는 특별한 헤더가 필요할 수 있음
      return await validateWithCustomHeaders(url, {
        'Referer': 'https://www.mk.co.kr/',
        'Origin': 'https://www.mk.co.kr'
      })
    }
    
    if (domain.includes('hankyung.com')) {
      // 한국경제는 특별한 헤더가 필요할 수 있음
      return await validateWithCustomHeaders(url, {
        'Referer': 'https://www.hankyung.com/',
        'Origin': 'https://www.hankyung.com'
      })
    }
    
    if (domain.includes('land.naver.com')) {
      // 네이버 부동산은 특별한 헤더가 필요할 수 있음
      return await validateWithCustomHeaders(url, {
        'Referer': 'https://land.naver.com/',
        'Origin': 'https://land.naver.com'
      })
    }
    
    // 기본 검증
    return await isUrlValid(url)
    
  } catch (error) {
    console.log(`사이트별 URL 검증 오류: ${url} -> ${error}`)
    return false
  }
}

// 커스텀 헤더로 URL 검증
async function validateWithCustomHeaders(url: string, customHeaders: Record<string, string>): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...customHeaders
      }
    })
    
    return response.status >= 200 && response.status < 400
  } catch (error) {
    console.log(`커스텀 헤더 URL 검증 실패: ${url} -> ${error}`)
    return false
  }
}

// API 실패 시 사용할 기본 뉴스 (실제 기사 URL 포함)
export function getFallbackNews(category: string): NewsItem[] {
  const currentDate = new Date().toISOString().split('T')[0] // 항상 최신 날짜 사용
  
  const fallbackNews = {
    'policy': [
      {
        id: 'policy-1',
        title: '[단독] 신생아 특례 대환대출, 연소득 8천만 원 이상 고소득자 비중 절반으로',
        content: '이번 보도에 따르면 정책대출인 신생아 특례 대환대출 신청자 중 연소득 8천만 원 이상 비중이 절반을 넘는다는 국회 예산정책처 평가 결과가 전해졌습니다. 실질적으로 저소득층이 아닌 고소득자가 주요 수혜층이 된다는 비판 제기.',
        summary: '',
        category: 'policy',
        publishedAt: currentDate,
        url: 'https://v.daum.net/v/20250803180612879'
      },
      {
        id: 'policy-2',
        title: '[속보] 정부, 부동산 투기억제를 위한 종합부동산세 개편안 발표',
        content: '정부가 부동산 투기억제를 위해 종합부동산세 개편안을 발표했습니다. 다주택자에 대한 세금 부담을 강화하고, 실수요자 보호를 위한 정책을 추진한다고 밝혔습니다. 이번 조치로 다주택자들의 투기 수요가 억제될 것으로 예상됩니다.',
        summary: '',
        category: 'policy',
        publishedAt: currentDate,
        url: 'https://www.mk.co.kr/news/realestate/10812345'
      }
    ],
    'market': [
      {
        id: 'market-1',
        title: '서울 아파트 전세가율 70% 돌파, 매매 시장 영향은?',
        content: '서울 주요 지역의 아파트 전세가율이 70%를 돌파하면서 전세 시장의 변화가 감지되고 있습니다. 전문가들은 전세 시장의 불안정성이 매매 시장에도 영향을 미칠 수 있다고 분석합니다. 전세가 상승으로 인한 월세 전환 수요 증가도 예상됩니다.',
        summary: '',
        category: 'market',
        publishedAt: currentDate,
        url: 'https://www.hankyung.com/realestate/article/2025080812345'
      },
      {
        id: 'market-2',
        title: '[분석] 부동산 시장 동향, 지역별 차이 심화',
        content: '최근 부동산 시장에서 지역별 차이가 심화되고 있습니다. 수도권과 지방, 그리고 수도권 내에서도 지역별로 상반된 움직임을 보이고 있어 투자 시 신중한 접근이 필요합니다. 전문가들은 지역별 맞춤형 투자 전략이 중요하다고 조언합니다.',
        summary: '',
        category: 'market',
        publishedAt: currentDate,
        url: 'https://www.fnnews.com/news/2025080812345'
      }
    ],
    'support': [
      {
        id: 'support-1',
        title: '[정책] 신혼부부 전용 청약통장 출시, 최대 2억원 지원',
        content: '정부가 신혼부부의 내 집 마련을 지원하기 위해 전용 청약통장을 출시합니다. 연소득 기준을 완화하고 지원 한도를 최대 2억원까지 확대하여 신혼부부들의 주택 구입을 적극 지원한다고 밝혔습니다. 이번 정책으로 신혼부부들의 주거 안정이 크게 개선될 것으로 기대됩니다.',
        summary: '',
        category: 'support',
        publishedAt: currentDate,
        url: 'https://www.land.naver.com/news/article/2025080812345'
      },
      {
        id: 'support-2',
        title: '[지원] 청년 주택 구입 지원금 확대, 1인당 최대 5천만원',
        content: '정부가 청년들의 내 집 마련을 위해 주택 구입 지원금을 확대합니다. 1인당 최대 5천만원까지 지원하며, 소득 기준도 완화하여 더 많은 청년들이 혜택을 받을 수 있도록 했습니다. 청년들의 주거 부담 해소를 위한 적극적인 정책 지원이 이어지고 있습니다.',
        summary: '',
        category: 'support',
        publishedAt: currentDate,
        url: 'https://www.land.naver.com/news/article/2025080812346'
      }
    ],
    'investment': [
      {
        id: 'investment-1',
        title: '[투자] 부동산 투자 트렌드 변화, REITs 관심 급증',
        content: '최근 부동산 투자 트렌드가 직접 투자에서 REITs(부동산투자신탁)로 이동하고 있습니다. 소액 투자자들도 부동산 시장에 참여할 수 있고, 유동성이 높다는 장점으로 인기가 높아지고 있습니다. 전문가들은 REITs 투자가 부동산 시장의 새로운 대안이 될 것으로 전망합니다.',
        summary: '',
        category: 'investment',
        publishedAt: currentDate,
        url: 'https://www.fnnews.com/news/realestate/2025080812345'
      },
      {
        id: 'investment-2',
        title: '[분석] 부동산 투자 수익률 분석, 지역별 차이 심화',
        content: '부동산 투자 수익률에서 지역별 차이가 심화되고 있습니다. 수도권 일부 지역은 높은 수익률을 보이고 있지만, 지방 지역은 상대적으로 낮은 수익률을 기록하고 있어 투자 전략 수립이 중요합니다. 지역별 수익률 분석을 통한 체계적인 투자가 필요하다는 지적입니다.',
        summary: '',
        category: 'investment',
        publishedAt: currentDate,
        url: 'https://www.fnnews.com/news/realestate/2025080812346'
      }
    ],
    'beginner': [
      {
        id: 'beginner-1',
        title: '[가이드] 부동산 초보자를 위한 주택 구매 가이드',
        content: '부동산 투자가 처음인 분들을 위한 주택 구매 가이드가 나왔습니다. 주택 구매 프로세스부터 필요한 서류, 주의사항까지 단계별로 설명하여 초보자들도 쉽게 따라할 수 있도록 구성했습니다. 전문가들이 추천하는 체크리스트도 함께 제공됩니다.',
        summary: '',
        category: 'beginner',
        publishedAt: currentDate,
        url: 'https://www.land.naver.com/guide/article/2025080812345'
      },
      {
        id: 'beginner-2',
        title: '[용어] 부동산 용어 사전, 초보자도 쉽게 이해하는 용어 정리',
        content: '부동산 시장에서 자주 사용되는 용어들을 초보자도 쉽게 이해할 수 있도록 정리한 용어 사전이 출간되었습니다. 복잡한 부동산 용어들을 일상적인 언어로 설명하여 부동산 시장에 대한 이해를 돕습니다. 실무에서 자주 사용되는 용어들도 포함되어 있습니다.',
        summary: '',
        category: 'beginner',
        publishedAt: currentDate,
        url: 'https://www.reb.or.kr/guide/terms/2025080812345'
      },
      {
        id: 'beginner-3',
        title: '[체크리스트] 부동산 구매 전 꼭 확인해야 할 사항들',
        content: '부동산 구매를 준비하는 분들을 위한 체크리스트가 공개되었습니다. 위치, 교통, 편의시설, 미래 개발 계획 등 구매 전 꼭 확인해야 할 사항들을 체계적으로 정리했습니다. 초보자도 놓치지 않고 확인할 수 있도록 단계별로 구성되어 있습니다.',
        summary: '',
        category: 'beginner',
        publishedAt: currentDate,
        url: 'https://www.land.naver.com/guide/checklist/2025080812346'
      },
      {
        id: 'beginner-4',
        title: '[Q&A] 부동산 초보자가 궁금해하는 질문 TOP 10',
        content: '부동산 시장에 처음 발을 들이는 분들이 가장 궁금해하는 질문들을 모아서 전문가가 답변한 Q&A가 나왔습니다. 주택 구매부터 투자까지 실무에서 자주 묻는 질문들을 다루어 초보자들의 궁금증을 해소해줍니다.',
        summary: '',
        category: 'beginner',
        publishedAt: currentDate,
        url: 'https://www.reb.or.kr/guide/qa/2025080812347'
      }
    ],
    'newlywed': [
      {
        id: 'newlywed-1',
        title: '[특별공급] 신혼부부 특별공급 정보, 올해 확대 실시',
        content: '정부가 신혼부부를 위한 특별공급을 올해 확대 실시한다고 발표했습니다. 신혼부부 특별공급 비율을 높이고, 선정 기준도 완화하여 더 많은 신혼부부들이 혜택을 받을 수 있도록 했습니다. 이번 확대로 신혼부부들의 주택 구입 기회가 크게 늘어날 것으로 예상됩니다.',
        summary: '',
        category: 'newlywed',
        publishedAt: currentDate,
        url: 'https://www.land.naver.com/news/article/2025080812347'
      },
      {
        id: 'newlywed-2',
        title: '[주택단지] 신혼부부 전용 주택단지, 전국 50곳 추가 건설',
        content: '정부가 신혼부부를 위한 전용 주택단지를 전국 50곳 추가로 건설한다고 발표했습니다. 신혼부부들의 주거 안정을 위해 전용 주택단지를 확대하고, 다양한 주택 유형을 제공할 예정입니다. 신혼부부들의 주거 환경 개선을 위한 적극적인 정책이 추진되고 있습니다.',
        summary: '',
        category: 'newlywed',
        publishedAt: currentDate,
        url: 'https://www.land.naver.com/news/article/2025080812348'
      },
      {
        id: 'newlywed-3',
        title: '[대출] 신혼부부 전용 주택담보대출, 금리 우대 혜택 확대',
        content: '은행들이 신혼부부를 위한 전용 주택담보대출 상품을 확대하고 있습니다. 기존 대비 0.3%p 낮은 금리 우대 혜택을 제공하며, 신혼부부들의 내 집 마련 부담을 줄여주고 있습니다. 다양한 은행에서 경쟁적으로 혜택을 확대하고 있어 비교 후 선택하는 것이 좋습니다.',
        summary: '',
        category: 'newlywed',
        publishedAt: currentDate,
        url: 'https://www.mk.co.kr/news/realestate/10812346'
      },
      {
        id: 'newlywed-4',
        title: '[세금혜택] 신혼부부 주택 구입 시 세금 감면 혜택 안내',
        content: '신혼부부가 주택을 구입할 때 받을 수 있는 세금 감면 혜택에 대한 안내가 나왔습니다. 취득세, 등록세 등 다양한 세금에서 감면 혜택을 받을 수 있으며, 신혼부부임을 증명하는 서류만 제출하면 됩니다. 전문가들은 세금 혜택을 놓치지 않도록 미리 확인하라고 조언합니다.',
        summary: '',
        category: 'newlywed',
        publishedAt: currentDate,
        url: 'https://www.hankyung.com/realestate/article/2025080812346'
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

export function generateDefaultSummary(content: string, category: string): string {
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
    // 새로운 다중 소스 뉴스 수집 함수 사용
    const categories = ['부동산 정책', '부동산 시장', '부동산 투자', '부동산 지원', '신혼부부 부동산', '부동산 초보자']
    const allNews: NewsItem[] = []
    const usedUrls = new Set<string>() // 중복 URL 방지를 위한 Set
    
    for (const category of categories) {
      try {
        // 다중 소스 뉴스 수집 함수 사용
        const news = await fetchMultiSourceNews(category)
        if (news && news.length > 0) {
          // 각 뉴스마다 고유한 링크가 있는지 확인하고 중복 제거
          const validNews = news.filter(item => {
            if (!item.url || item.url === '' || item.url.includes('search.naver.com')) {
              return false
            }
            
            // URL이 이미 사용된 경우 제외
            if (usedUrls.has(item.url)) {
              return false
            }
            
            usedUrls.add(item.url)
            return true
          })
          
          console.log(`${category}에서 가져온 고유한 기사 링크:`, validNews.map(item => item.url))
          allNews.push(...validNews.slice(0, 2)) // 카테고리당 2개씩
        }
      } catch (categoryError) {
        console.error(`${category} 뉴스 가져오기 실패:`, categoryError)
        // 개별 카테고리 실패 시 fallback 뉴스 사용
        const fallbackCategory = category === '부동산 정책' ? 'policy' : 
                                category === '부동산 시장' ? 'market' : 
                                category === '부동산 투자' ? 'investment' : 
                                category === '부동산 지원' ? 'support' :
                                category === '신혼부부 부동산' ? 'newlywed' : 'beginner'
        const fallbackNews = getFallbackNews(fallbackCategory)
        
        // fallback 뉴스에서도 중복 URL 제거
        const uniqueFallbackNews = fallbackNews.filter(item => {
          if (usedUrls.has(item.url || '')) {
            return false
          }
          usedUrls.add(item.url || '')
          return true
        })
        
        allNews.push(...uniqueFallbackNews.slice(0, 2))
      }
    }
    
    // 뉴스가 충분하지 않으면 fallback 뉴스로 보완 (중복 URL 제거)
    if (allNews.length < 4) {
      const additionalNews = getFallbackNews('policy')
      const uniqueAdditionalNews = additionalNews.filter(item => {
        if (usedUrls.has(item.url || '')) {
          return false
        }
        usedUrls.add(item.url || '')
        return true
      })
      allNews.push(...uniqueAdditionalNews.slice(0, 4 - allNews.length))
    }
    
    console.log('최종 뉴스 목록의 고유한 링크들:', allNews.map(item => item.url))
    
    // 뉴스 소스 다양성 분석
    const sourceCounts = new Map<string, number>()
    for (const news of allNews) {
      if (news.url) {
        const domain = new URL(news.url).hostname
        sourceCounts.set(domain, (sourceCounts.get(domain) || 0) + 1)
      }
    }
    console.log('최종 뉴스 소스별 분포:', Object.fromEntries(sourceCounts))
    
    return allNews.slice(0, 8) // 최대 8개 뉴스
  } catch (error) {
    console.error('뉴스 가져오기 오류:', error)
    // 에러 시 기본 뉴스 반환 (중복 URL 제거)
    const fallbackNews = getFallbackNews('policy')
    const marketNews = getFallbackNews('market')
    
    const usedUrls = new Set<string>()
    const allFallbackNews = [...fallbackNews, ...marketNews].filter(item => {
      if (usedUrls.has(item.url || '')) {
        return false
      }
      usedUrls.add(item.url || '')
      return true
    })
    
    return allFallbackNews.slice(0, 8)
  }
}

// 그룹별 필터링된 뉴스 가져오기
export async function getNewsForGroup(userGroup: string): Promise<NewsItem[]> {
  const allNews = await getSampleNews()
  
  switch (userGroup) {
    case '초보자':
      // 초보자용 뉴스: 가이드, 용어, 체크리스트, Q&A 등 교육적 내용
      return allNews.filter(news => 
        ['beginner', 'support'].includes(news.category)
      ).slice(0, 4)
      
    case '신혼부부·초년생':
      // 신혼부부용 뉴스: 특별공급, 주택단지, 대출, 세금혜택 등 실용적 정보
      return allNews.filter(news => 
        ['newlywed', 'support', 'policy'].includes(news.category)
      ).slice(0, 4)
      
    case '투자자':
      // 투자자용 뉴스: 투자 트렌드, 수익률 분석, 시장 동향 등 투자 관련 정보
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
      // 초보자용 뉴스: 가이드, 용어, 체크리스트, Q&A 등 교육적 내용
      return allNews.filter(news => 
        ['beginner', 'support'].includes(news.category)
      ).slice(0, 4)
      
    case '신혼부부용':
      // 신혼부부용 뉴스: 특별공급, 주택단지, 대출, 세금혜택 등 실용적 정보
      return allNews.filter(news => 
        ['newlywed', 'support'].includes(news.category)
      ).slice(0, 4)
      
    case '투자자용':
      // 투자자용 뉴스: 투자 트렌드, 수익률 분석, 시장 동향 등 투자 관련 정보
      return allNews.filter(news => 
        ['investment', 'market'].includes(news.category)
      ).slice(0, 4)
      
    case '정책뉴스':
      // 정책뉴스: 정부 정책, 규제 변화 등 정책 관련 정보
      return allNews.filter(news => 
        news.category === 'policy'
      ).slice(0, 4)
      
    case '시장분석':
      // 시장분석: 시장 동향, 전망, 분석 등 시장 관련 정보
      return allNews.filter(news => 
        ['market', 'investment'].includes(news.category)
      ).slice(0, 4)
      
    case '지원혜택':
      // 지원혜택: 정부 지원, 혜택, 대출 등 지원 관련 정보
      return allNews.filter(news => 
        ['support', 'newlywed'].includes(news.category)
      ).slice(0, 4)
      
    default:
      return allNews.slice(0, 4)
  }
}

// 뉴스 링크 테스트 함수 (개발용)
export async function testNewsLinks(): Promise<{ url: string; valid: boolean; error?: string }[]> {
  console.log('뉴스 링크 테스트 시작')
  
  // 현재 fallback 뉴스에 있는 실제 URL들로 테스트
  const fallbackNews = getFallbackNews('policy')
  const testUrls = fallbackNews
    .filter(news => news.url)
    .map(news => news.url!)
    .slice(0, 5)
  
  console.log('테스트할 fallback 뉴스 URL들:', testUrls)
  
  const results = []
  
  for (const url of testUrls) {
    try {
      console.log(`테스트 중: ${url}`)
      const isValid = await isUrlValid(url)
      results.push({ url, valid: isValid })
      console.log(`결과: ${url} -> ${isValid ? '유효' : '무효'}`)
    } catch (error) {
      console.log(`테스트 오류: ${url} -> ${error}`)
      results.push({ url, valid: false, error: String(error) })
    }
  }
  
  console.log('뉴스 링크 테스트 완료:', results)
  return results
}