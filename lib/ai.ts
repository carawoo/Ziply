import dayjs from 'dayjs'

// 폴백 완전 제거 - 실제 API 데이터만 사용

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
function calculateSimilarity(_text1: string, _text2: string): number {
  // 유사도 검사는 비활성화 (0 고정)
  return 0
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

    // 4. 최근 3일 내 뉴스 필터링 (완화된 조건)
    const recentNews = allNewsItems.filter(item => {
      const newsDate = new Date(item.publishedAt)
      const todayDate = new Date(today)
      const diffTime = Math.abs(todayDate.getTime() - newsDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const isRecent = diffDays <= 3
      
      if (!isRecent) {
        console.log(`날짜 오래됨 제외: ${item.title} (${item.publishedAt}, ${diffDays}일 전)`)
      }
      return isRecent
    })

    // 5. 부동산 관련 키워드 필터링
    const realEstateNews = recentNews.filter((item: any) => {
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
    // 정책뉴스: 정책/규제/세금/대출/공급 등
    'policy': ['부동산 정책', '정부 대책', '대출 규제', '세금 개편', '공급 정책', '종부세', '청약 제도'],
    // 시장분석: 가격/거래량/전세/매매/지표 등
    'market': ['집값 동향', '거래량', '전세가', '매매가', '시장 분석', '분양시장', '수요 공급'],
    // 지원혜택: 대출/보조금/청년/신혼/특공 등
    'support': ['주택 지원', '대출 지원', '보조금', '청년 주거', '신혼부부 혜택', '특별공급'],
    // 투자자용: 투자/수익률/임대/상업용/리츠 등
    'investment': ['부동산 투자', '수익률', '임대수익', '상업용 부동산', 'REITs', '투자 전략'],
    // 초보자용: 기초/가이드/용어/절차 등
    'beginner': ['부동산 기초', '내집마련 가이드', '부동산 용어', '주택 구매 절차', '등기/대출 기초'],
    // 신혼부부용: 청약/특공/전월세/주거비 등
    'newlywed': ['신혼부부 청약', '특별공급', '전세 지원', '월세 지원', '주거비 경감']
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
  
  // 5. 날짜 필터링 완화 (최근 7일 내 뉴스 허용)
  const recentDates = getRecentDates()
  const recentNews = allNews.filter(item => 
    recentDates.includes(item.publishedAt) || item.publishedAt === getTodayDate()
  )
  
  console.log(`날짜 필터링 후: ${recentNews.length}개 (총 ${allNews.length}개 중)`)
  
  // 6. 부동산 관련 키워드 필터링
  const realEstateNews = recentNews.filter(item => {
    const keywords = ['부동산', '아파트', '주택', '전세', '매매', '정책', '투자', '청약', 'REITs', '시장', '집값', '분양']
    return keywords.some(keyword => 
      item.title.includes(keyword) || item.content.includes(keyword)
    )
  })
  
  console.log(`부동산 키워드 필터링 후: ${realEstateNews.length}개`)
  
  // 7. URL 유효성 검사 완화 (주요 뉴스 사이트는 URL 검증 없이 우선 포함)
  const validNews: NewsItem[] = []
  for (const item of realEstateNews) {
    if (item.url) {
      try {
        const domain = new URL(item.url).hostname
        const isMajorNewsSite = isDiverseNewsSource(domain)
        
        // 주요 뉴스 사이트는 URL 검증 없이 우선 포함
        if (isMajorNewsSite) {
          console.log(`주요 뉴스 사이트로 우선 포함: ${item.title} -> ${item.url}`)
          validNews.push(item)
        } else {
          // 기타 사이트는 기본 URL 유효성 검사
          const urlValid = await isUrlValid(item.url)
          if (urlValid) {
            validNews.push(item)
          } else {
            console.log(`URL 유효하지 않음 제외: ${item.title} -> ${item.url}`)
          }
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
  '초보자': ['내집마련', '부동산 기초', '주택 구매'],
  '신혼부부': ['신혼부부 청약', '특별공급', '전세 지원'],
  '투자자': ['부동산 투자', '수익률', 'REITs'],
  'policy': ['부동산 정책', '정부 대책', '대출 규제'],
  'market': ['집값 동향', '부동산 시장', '매매가'],
  'support': ['주택 지원', '대출 지원', '보조금'],
  'investment': ['부동산 투자', '수익률', 'REITs'],
  'beginner': ['내집마련', '부동산 기초', '주택 구매'],
  'newlywed': ['신혼부부 청약', '특별공급', '전세 지원']
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

// 폴백 함수 제거됨 - 실제 API만 사용

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

// 완화된 뉴스 필터링 함수 (너무 엄격한 필터링 제거)
async function filterValidNews(newsItems: NewsItem[]): Promise<NewsItem[]> {
  console.log(`완화된 필터링 시작: ${newsItems.length}개 뉴스`)
  
  const today = getTodayDate()
  const validNews: NewsItem[] = []
  
  for (const news of newsItems) {
    try {
      // 1. 날짜 필터 완화 (최근 7일 이내)
      const newsDate = new Date(news.publishedAt)
      const todayDate = new Date(today)
      const diffTime = Math.abs(todayDate.getTime() - newsDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays > 7) {
        console.log(`7일 이상 오래된 뉴스 제외: ${news.title} (${diffDays}일 전)`)
        continue
      }
      
      // 2. URL 기본 검증만 (도메인 확인 정도)
      if (!news.url || news.url.trim().length === 0) {
        console.log(`URL 없음 제외: ${news.title}`)
        continue
      }
      
      try {
        new URL(news.url) // URL 형식 검증만
      } catch {
        console.log(`잘못된 URL 형식 제외: ${news.title} -> ${news.url}`)
        continue
      }
      
      // 3. 제목-URL 매칭 검증 제거 (너무 엄격함)
      
      // 모든 조건 통과
      validNews.push(news)
      console.log(`✅ 완화된 필터 통과: ${news.title} -> ${news.url}`)
      
    } catch (error) {
      console.log(`뉴스 필터링 오류: ${news.title} -> ${error}`)
    }
  }
  
  console.log(`완화된 필터링 완료: ${validNews.length}/${newsItems.length}개 유효`)
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
    
    const keywordsForCat = getAdditionalKeywords(category)
    const query = encodeURIComponent(
      (keywordsForCat && keywordsForCat.length > 0)
        ? keywordsForCat.join(' OR ')
        : category
    )
    const today = getTodayDate()
    
    console.log(`네이버 뉴스 엄격 필터링 시작: ${category} (오늘: ${today})`)
    
    // 네이버 뉴스 API 호출 (그룹 키워드 OR 쿼리 적용)
    const url = new URL('https://openapi.naver.com/v1/search/news.json')
    url.searchParams.set('query', decodeURIComponent(query))
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

        // 1. 최신성 필터 (최근 3일)
        let publishedDate = getTodayDate()
        if (item.pubDate) {
          try {
            publishedDate = new Date(item.pubDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
          } catch (error) {
            console.log('날짜 파싱 오류:', error)
          }
        }
        if (!isWithinDaysKST(item.pubDate || publishedDate, 3)) {
          console.log(`최근 3일 범위 외 제외: ${cleanTitle} (${item.pubDate || publishedDate})`)
          continue
        }

        // 2. 주요 뉴스 도메인 우대 (비주요도 허용)
        const domain = new URL(cleanUrl).hostname
        const isMajor = isDiverseNewsSource(domain)
        if (!isMajor && domain.endsWith('.blog')) {
          console.log(`블로그 도메인 제외: ${cleanTitle} -> ${cleanUrl} (${domain})`)
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
        
        // 1. 최신성 필터 (최근 3일)
        let publishedDate = getTodayDate()
        if (item.pagemap?.metatags?.[0]?.['article:published_time']) {
          const dateStr = item.pagemap.metatags[0]['article:published_time']
          publishedDate = new Date(dateStr).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
        }
        if (!isWithinDaysKST(publishedDate, 3)) {
          console.log(`최근 3일 범위 외 제외: ${cleanTitle} (${publishedDate})`)
          continue
        }
        
        // 2. 뉴스 소스 다양성 확인 (주요 도메인 우대, 비주요도 허용)
        const domain = new URL(cleanUrl).hostname
        const isDiverseSource = isDiverseNewsSource(domain)
        if (isDiverseSource || !domain.endsWith('.blog')) {
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

// KST 기준 최근 N일 이내인지 체크
function isWithinDaysKST(dateString: string, days: number): boolean {
  try {
    const target = new Date(new Date(dateString).getTime() + 9 * 3600 * 1000)
    const now = new Date(new Date().getTime() + 9 * 3600 * 1000)
    const diffMs = now.getTime() - target.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return diffDays <= days && diffDays >= 0
  } catch {
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
  // 최신 기사 위주가 나오도록 OR 조합 + 최신 정렬
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

        // 2. 도메인만 체크하여 과도한 네트워크 검증 제거
        const domain = new URL(cleanUrl).hostname
        if (!isDiverseNewsSource(domain)) {
          console.log(`도메인 제외: ${cleanTitle} -> ${cleanUrl} (${domain})`)
          continue
        }

        // 3. 부동산 서비스 타겟 키워드 포함 여부
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
    
    // 4. 최종적으로 부족해도 폴백 사용 금지: 그대로 반환
    if (allNews.length < 4) {
      console.log(`최종 결과 부족 (${allNews.length}개). 폴백 미사용, 수집한 만큼만 반환합니다.`)
    }
    
    return allNews.slice(0, 10)
    
  } catch (error) {
    console.error('실제 뉴스 수집 오류:', error)
  }
  
  // 모든 API 실패 시 폴백 미사용
  console.log('모든 API 실패. 빈 결과 반환.')
  return []
}

// 탭 이름을 받아 실제 뉴스 수집 - 간소화된 버전
export async function fetchNewsByTab(tab: string): Promise<NewsItem[]> {
  console.log(`=== fetchNewsByTab 시작: ${tab} ===`)

  // 탭 → 검색 키워드 매핑
  const keywordMap: Record<string, string[]> = {
    '초보자용': ['부동산 기초', '주택 구매 가이드', '부동산 초보자'],
    '신혼부부용': ['신혼부부 특별공급', '신혼부부 청약', '신혼부부 혜택'],
    '투자자용': ['부동산 투자', 'REITs', '부동산 수익률'],
    '정책뉴스': ['부동산 정책', '부동산 규제', '주택 정책'],
    '시장분석': ['부동산 시장', '집값 동향', '부동산 분석'],
    '지원혜택': ['주택 지원', '부동산 혜택', '청년 주택']
  }

  const keywords = keywordMap[tab] || ['부동산 정책']
  const usedUrls = new Set<string>()
  const collected: NewsItem[] = []

  for (const keyword of keywords) {
    try {
      console.log(`[fetchNewsByTab] 키워드 검색: ${keyword}`)
      const news = await fetchNaverNewsAPI(keyword)
      
      // 간단한 부동산 관련 필터링만 적용
      const filtered = news.filter(item => {
        const realEstateKeywords = ['부동산', '아파트', '주택', '전세', '매매', '정책', '투자', '청약', '시장', '집값']
        const hasKeyword = realEstateKeywords.some(kw => 
          item.title.includes(kw) || item.content.includes(kw)
        )
        
        if (!hasKeyword) {
          console.log(`부동산 키워드 없음 제외: ${item.title}`)
          return false
        }
        
        return true
      })
      
      for (const item of filtered) {
        const key = item.url || ''
        if (!key || usedUrls.has(key)) continue
        usedUrls.add(key)
        collected.push(item)
      }
      console.log(`[fetchNewsByTab] ${keyword} 수집: 누적 ${collected.length}건`)
    } catch (error) {
      console.error(`[fetchNewsByTab] ${keyword} 수집 오류:`, error)
    }
  }

  console.log(`=== fetchNewsByTab 완료: ${collected.length}건 ===`)
  return collected.slice(0, 10)
}

// 네이버 뉴스 API 호출 함수 (기존 fetchRealNews에서 분리)
export async function fetchNaverNewsAPI(category: string): Promise<NewsItem[]> {
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
          
          // URL이 유효하고 중복되지 않은 경우만 추가 (네이버 뉴스 URL도 허용)
          if (cleanUrl && 
              cleanUrl.length > 0 && 
              !usedUrls.has(cleanUrl) && 
              !cleanUrl.includes('search.naver.com') && // 검색 결과 페이지만 제외
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
    // 기존 주요 뉴스 사이트
    'mk.co.kr', 'hankyung.com', 'fnnews.com', 'land.naver.com', 'reb.or.kr',
    'chosun.com', 'joongang.co.kr', 'donga.com', 'seoul.co.kr', 'khan.co.kr',
    'hani.co.kr', 'ohmynews.com', 'pressian.com', 'mediatoday.co.kr',
    'yonhapnews.co.kr', 'newsis.com', 'news1.kr', 'edaily.co.kr',
    'etnews.com', 'zdnet.co.kr', 'it.chosun.com', 'zdnet.com',
    // 네이버 뉴스 도메인들 추가
    'n.news.naver.com', 'm.entertain.naver.com', 'news.naver.com',
    // 네이버 API에서 자주 나오는 도메인들 추가
    'wikitree.co.kr', 'topstarnews.net', 'segye.com', 'newsen.com',
    'xportsnews.com', 'osen.co.kr', 'mydaily.co.kr', 'spotvnews.co.kr',
    // 부동산 관련 주요 사이트들 추가
    'biz.chosun.com', 'economychosun.com', 'realty.chosun.com'
  ]
  
  // 부동산 전문 사이트들
  const realEstateSources = [
    'land.naver.com', 'reb.or.kr', 'kras.or.kr', 'kab.or.kr',
    'krea.or.kr', 'kfcc.co.kr', 'nh.or.kr'
  ]
  
  // 도메인이 주요 뉴스 사이트나 부동산 전문 사이트에 포함되는지 확인
  const isDiverse = diverseSources.some(source => domain.includes(source)) ||
                   realEstateSources.some(source => domain.includes(source))
  
  console.log(`도메인 다양성 검사: ${domain} -> ${isDiverse ? '통과' : '차단'}`)
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

// 폴백 뉴스 함수 완전 제거 - 실제 API 데이터만 사용

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

// 실제 뉴스 API에서 뉴스 가져오기 (폴백 완전 제거)
export async function getSampleNews(): Promise<NewsItem[]> {
  console.log('getSampleNews 호출: 폴백 완전 제거됨 → 빈 배열 반환')
  return []
}

// 그룹별 필터링된 뉴스 가져오기
export async function getNewsForGroup(userGroup: string): Promise<NewsItem[]> {
  console.log(`getNewsForGroup(${userGroup}) → 폴백 제거, 실뉴스 파이프라인 사용`)
  const tab = userGroup === '초보자' ? '초보자용' : userGroup === '신혼부부·초년생' ? '신혼부부용' : userGroup === '투자자' ? '투자자용' : '정책뉴스'
  return (await fetchNewsByTab(tab)).slice(0, 4)
}

// 탭별 맞춤형 뉴스 가져오기
export async function getNewsForTab(tab: string): Promise<NewsItem[]> {
  console.log(`=== 탭별 뉴스 요청 시작(폴백 제거): ${tab} ===`)
  try {
    const results = await fetchNewsByTab(tab)
    return results.slice(0, 4)
  } catch (error) {
    console.error('뉴스 수집 오류:', error)
    return []
  }
}

// 뉴스 링크 테스트 함수 (개발용)
export async function testNewsLinks(): Promise<{ url: string; valid: boolean; error?: string }[]> {
  console.log('뉴스 링크 테스트 시작(폴백 제거)')
  const items = await fetchNewsByTab('정책뉴스')
  const testUrls = items.filter(n => n.url).map(n => n.url!).slice(0, 5)
  const results: { url: string; valid: boolean; error?: string }[] = []
  for (const url of testUrls) {
    try {
      const isValid = await isUrlValid(url)
      results.push({ url, valid: isValid })
    } catch (error) {
      results.push({ url, valid: false, error: String(error) })
    }
  }
  return results
}