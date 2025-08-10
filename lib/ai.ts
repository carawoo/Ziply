import dayjs from 'dayjs'

// 폴백 완전 제거 - 실제 API 데이터만 사용

// 전문 용어를 쉬운 말로 바꾸는 함수
function removeTechnicalTerms(text: string): string {
  const termReplacements: { [key: string]: string } = {
    // 대출 관련 (20~30대 핵심)
    'LTV': '집값 대비 대출 비율',
    'DSR': '소득 대비 대출상환 비율', 
    '전세대출': '전세보증금을 빌리는 대출',
    '주택담보대출': '집을 담보로 한 대출',
    '변동금리': '시장에 따라 바뀌는 금리',
    '고정금리': '처음부터 끝까지 같은 금리',
    '원리금균등': '매월 같은 금액을 내는 방식',
    '거치기간': '이자만 내는 기간',
    
    // 전세/월세 (실생활 용어)
    '임대차보호법': '세입자를 보호하는 법',
    '계약갱신권': '2년 더 살 수 있는 권리',
    '전월세전환율': '전세를 월세로 바꾸는 비율',
    '갱신거절': '집주인이 계약연장을 거부하는 것',
    '보증금반환': '계약 끝나면 돌려받는 돈',
    
    // 지원제도
    '버팀목전세대출': 'HUG 보증 전세대출',
    '디딤돌대출': '정부 지원 주택구입대출',
    '생애최초': '처음으로 집을 사는 사람',
    '청년전세대출': '34세 이하 전세대출',
    '중기청대출': '중소벤처기업부 청년 지원대출',
    
    // 담보/등기
    '근저당': '대출 담보로 잡는 방식',
    '등기부등본': '집의 권리관계를 보여주는 서류',
    '전세권설정': '전세보증금을 보호하는 등기',
    '선순위': '먼저 돈을 받을 수 있는 순서',
    
    // 기존 용어들
    '프로젝트파이낸싱': '건물을 짓기 위해 빌린 돈',
    'PF': '건물을 짓기 위해 빌린 돈',
    'REITs': '부동산에 투자하는 방법',
    '부동산': '집이나 땅',
    '정책': '정부가 내린 규칙',
    '청약': '새 아파트를 살 기회 신청',
    '자산건전성': '돈을 잘 관리하는 정도',
    '평가 등급': '신용도 점수',
    'AA+': '매우 좋은 신용도',
    '한기평': '신용도 평가 회사',
    '선임연구원': '경험 많은 연구원',
    '비중': '차지하는 비율',
    '구성': '어떻게 만들어져 있는지',
    '민감도': '반응하는 정도',
    '관리': '잘 다루는 것',
    '활성화': '더 활발하게 만드는 것',
    '규제': '제한하는 규칙',
    '완화': '규칙을 덜 엄격하게 만드는 것',
    '상향 조정': '기준을 높이는 것',
    '경쟁률': '경쟁하는 사람의 수',
    '조치': '취하는 행동',
    '평가': '어떻게 보는지',
    '분석': '자세히 살펴보는 것',
    '고려': '생각해보는 것',
    '전망': '앞으로 어떻게 될지 예상',
    '동향': '변화하는 모습',
    '트렌드': '유행하는 방향',
    '이슈': '관심을 끄는 주제',
    '이슈화': '많은 사람이 관심을 가지게 되는 것',
    '논란': '의견이 갈리는 문제',
    '갈등': '서로 다른 의견으로 다투는 것',
    '협상': '서로 의견을 맞추려고 하는 것',
    '합의': '의견을 맞춘 것',
    '타결': '문제를 해결한 것',
    '파기': '취소하는 것',
    '무효': '효력이 없는 것',
    '유효': '효력이 있는 것',
    '적용': '사용하는 것',
    '시행': '실행하는 것',
    '발효': '효력을 가지게 되는 것',
    '폐지': '없애는 것',
    '개정': '바꾸는 것',
    '수정': '고치는 것',
    '보완': '부족한 부분을 채우는 것',
    '강화': '더 강하게 만드는 것',
    '약화': '약하게 만드는 것',
    '확대': '더 크게 만드는 것',
    '축소': '작게 만드는 것',
    '증가': '늘어나는 것',
    '감소': '줄어드는 것',
    '상승': '올라가는 것',
    '하락': '떨어지는 것',
    '급등': '빠르게 올라가는 것',
    '급락': '빠르게 떨어지는 것',
    '폭등': '매우 크게 올라가는 것',
    '폭락': '매우 크게 떨어지는 것',
    '안정': '차분한 상태',
    '불안정': '차분하지 않은 상태',
    '변동': '바뀌는 것',
    '변화': '달라지는 것',
    '전환': '바꾸는 것',
    '전환점': '바뀌는 시점',
    '분기점': '갈라지는 지점',
    '기점': '시작하는 점',
    '시점': '어떤 때',
    '시기': '어떤 기간',
    '단계': '어떤 단계',
    '단계별': '단계에 따라',
    '단계적': '단계를 거쳐서',
    '점진적': '조금씩',
    '급진적': '갑자기 크게',
    '급격한': '갑자기 큰',
    '급속한': '빠른',
    '급증': '빠르게 늘어나는 것',
    '급감': '빠르게 줄어드는 것',
    '급증세': '빠르게 늘어나는 흐름',
    '급감세': '빠르게 줄어드는 흐름',
    '증세': '늘어나는 흐름',
    '감세': '줄어드는 흐름',
    '상승세': '올라가는 흐름',
    '하락세': '떨어지는 흐름',
    '회복세': '다시 좋아지는 흐름',
    '침체세': '나빠지는 흐름',
    '부진세': '잘 안 되는 흐름',
    '호조세': '잘 되는 흐름',
    '양호세': '좋은 흐름',
    '불량세': '나쁜 흐름',
    '악화세': '더 나빠지는 흐름',
    '개선세': '더 좋아지는 흐름',
    '악화': '더 나빠지는 것',
    '개선': '더 좋아지는 것',
    '악화되다': '더 나빠지다',
    '개선되다': '더 좋아지다',
    '악화되고': '더 나빠지고',
    '개선되고': '더 좋아지고',
    '악화되어': '더 나빠져서',
    '개선되어': '더 좋아져서',
    '악화된': '더 나빠진',
    '개선된': '더 좋아진',
    '악화하는': '더 나빠지는',
    '개선하는': '더 좋아지는',
    '악화했다': '더 나빠졌다',
    '개선했다': '더 좋아졌다',
    '악화할': '더 나빠질',
    '개선할': '더 좋아질',
    '악화하면': '더 나빠지면',
    '개선하면': '더 좋아지면',
    '악화했을': '더 나빠졌을',
    '개선했을': '더 좋아졌을',
    '악화했던': '더 나빠졌던',
    '개선했던': '더 좋아졌던',
    '악화했으며': '더 나빠졌으며',
    '개선했으며': '더 좋아졌으며',
    '악화했고': '더 나빠졌고',
    '개선했고': '더 좋아졌고',
    '악화했지만': '더 나빠졌지만',
    '개선했지만': '더 좋아졌지만',
    '악화했으므로': '더 나빠졌으므로',
    '개선했으므로': '더 좋아졌으므로',
    '악화했으니': '더 나빠졌으니',
    '개선했으니': '더 좋아졌으니'
  }

  let processedText = text

  // 전문 용어를 쉬운 말로 바꾸기
  Object.entries(termReplacements).forEach(([term, replacement]) => {
    const regex = new RegExp(term, 'gi')
    processedText = processedText.replace(regex, replacement)
  })

  return processedText
}

// AI 뉴스 요약 서비스
export interface NewsItem {
  id: string
  title: string
  content: string
  summary: string
  category: string
  publishedAt: string
  url?: string
  glossary?: string
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
  
  // 6. 부동산 관련 키워드 필터링 (집값, 전세, 월세, 매매 위주)
  const realEstateNews = recentNews.filter(item => {
    const primaryKeywords = ['집값', '전세', '월세', '매매', '아파트', '주택', '부동산']
    const secondaryKeywords = ['정책', '청약', '대출', '분양', '시장', '투자']
    
    // 제목에 주요 키워드가 있으면 우선 포함
    const hasPrimaryInTitle = primaryKeywords.some(keyword => 
      item.title.includes(keyword)
    )
    
    // 제목에 주요 키워드가 없으면 내용에서 확인
    const hasPrimaryInContent = primaryKeywords.some(keyword => 
      item.content.includes(keyword)
    )
    
    // 보조 키워드는 제목에 있을 때만 포함 (내용만 있으면 제외)
    const hasSecondaryInTitle = secondaryKeywords.some(keyword => 
      item.title.includes(keyword)
    )
    
    return hasPrimaryInTitle || hasPrimaryInContent || hasSecondaryInTitle
  })
  
  console.log(`부동산 키워드 필터링 후: ${realEstateNews.length}개`)
  
  // 7. 국내 뉴스 우선 필터링 (해외 뉴스 제외)
  const domesticNews = realEstateNews.filter(item => {
    // 해외 관련 키워드가 제목에 있으면 제외 (더 강화)
    const foreignKeywords = ['미국', '중국', '일본', '유럽', '글로벌', '해외', '외국', '트럼프', '바이든', '시진핑', '연준', 'FED', '달러', '엔화', '위안화', '유로']
    const hasForeignKeyword = foreignKeywords.some(keyword => 
      item.title.includes(keyword)
    )
    
    // 국내 지역 키워드가 있으면 우선 포함
    const domesticKeywords = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주', '한국', '국내', '지방', '지역']
    const hasDomesticKeyword = domesticKeywords.some(keyword => 
      item.title.includes(keyword) || item.content.includes(keyword)
    )
    
    // 해외 키워드가 있으면 무조건 제외 (국내 키워드가 있어도)
    if (hasForeignKeyword) {
      return false
    }
    
    // 국내 키워드가 있으면 포함
    return hasDomesticKeyword
  })
  
  console.log(`국내 뉴스 필터링 후: ${domesticNews.length}개`)
  
  // 8. URL 유효성 검사 완화 (주요 뉴스 사이트는 URL 검증 없이 우선 포함)
  const validNews: NewsItem[] = []
  for (const item of domesticNews) {
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

// 타겟별 키워드 설정 (실제 사용자 니즈 기반)
const TARGET_KEYWORDS: Record<string, string[]> = {
  '초보자': ['월세', '전세', '전세대출', '보증금', '임대차', '계약갱신', 'LTV', 'DSR', '대출한도', '청년전세', '버팀목전세'],
  '신혼부부': ['신혼부부 청약', '특별공급', '신혼부부 대출', '디딤돌대출', '내집마련', '생애최초'],
  '투자자': ['부동산 투자', '수익률', 'REITs', '임대수익', '양도세', '종부세'],
  'policy': ['부동산 정책', '정부 대책', '대출 규제', '금리인상', '대출한도'],
  'market': ['집값 동향', '부동산 시장', '매매가', '전세가', '월세시장'],
  'support': ['주택 지원', '대출 지원', '보조금', '청년 주거', '전세대출', '중기청'],
  'investment': ['부동산 투자', '수익률', 'REITs', '임대사업', '세무'],
  'beginner': ['월세', '전세', '전세대출', '보증금', '임대차', '계약갱신', 'LTV', 'DSR'],
  'newlywed': ['신혼부부 청약', '특별공급', '신혼부부 대출', '디딤돌대출']
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

  // 탭 → 검색 키워드 매핑 (실제 사용자 니즈 기반)
  const keywordMap: Record<string, string[]> = {
    '초보자용': ['전세대출', '월세 임대차', 'LTV DSR', '청년 전세', '보증금 계약'],
    '신혼부부용': ['신혼부부 특별공급', '디딤돌대출', '생애최초 혜택'],
    '투자자용': ['부동산 투자', 'REITs', '임대수익률'],
    '정책뉴스': ['대출 정책', '금리 변화', 'LTV DSR 규제'],
    '시장분석': ['전세가 동향', '월세 시장', '집값 분석'],
    '지원혜택': ['청년 주거지원', '버팀목대출', '중기청 대출']
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
          model: 'gpt-4o-mini',
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
          temperature: 0.3
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

// 초등학생도 이해할 수 있는 쉬운 요약 (용어 풀이 대신)
export async function summarizeWithGlossary(title: string, content: string, category: string): Promise<{ summary: string; glossary: string }> {
  try {
    // OpenAI API 사용
    if (process.env.OPENAI_API_KEY) {
      const prompt = `
당신은 부동산 뉴스를 어린아이도 쉽게 이해할 수 있도록 설명하는 전문가입니다.

다음 기사를 분석해주세요:

기사 제목: ${title}
기사 내용: ${content}
카테고리: ${category}

다음 두 부분으로 나누어 답변해주세요:

1) 📰 뉴스 요약 (3-4줄)
- 기사의 핵심 내용을 간단명료하게 요약
- 전문 용어는 절대 사용하지 말고 일반인이 이해할 수 있는 표현만 사용

2) 📖 쉬운 설명 (2-3줄)
- 초등학생도 이해할 수 있는 수준으로 설명
- 모든 전문 용어를 일상적인 말로 바꿔서 설명
- "이 뉴스가 우리 일상에 어떤 영향을 주는지", "왜 중요한지"를 중심으로 설명

⚠️ 절대 사용하면 안 되는 전문 용어들 (반드시 쉬운 말로 바꿔서 설명):
- "프로젝트파이낸싱(PF)" → "건물을 짓기 위해 빌린 돈"
- "익스포저" → "빌린 돈의 양"
- "기초자산" → "투자한 돈이 들어간 곳"
- "우량 채권" → "안전한 투자"
- "주식시장의 변동성" → "주식 가격이 오르내리는 정도"
- "시장 위험" → "투자할 때 생길 수 있는 손실"
- "REITs" → "부동산에 투자하는 방법"
- "LTV" → "집값 대비 빌릴 수 있는 돈의 비율"
- "DTI" → "수입 대비 빌릴 수 있는 돈의 비율"
- "종부세" → "집을 가진 사람이 내는 세금"
- "부동산" → "집이나 땅"
- "투자" → "돈을 넣어서 더 많은 돈을 만들려는 것"
- "시장" → "사람들이 물건을 사고 파는 곳"
- "정책" → "정부가 내린 규칙"
- "분양" → "새로 지은 집을 파는 것"
- "청약" → "새 집을 살 기회를 신청하는 것"

✅ 올바른 설명 예시:
- "집값이 오른다는 것은 우리가 집을 살 때 더 많은 돈을 내야 한다는 뜻이에요. 하지만 이미 집을 가진 사람들은 집값이 올라서 좋을 수도 있어요."
- "정부가 새로운 규칙을 만들었다는 것은 우리가 집을 살 때 도움이 될 수도 있고, 어려워질 수도 있다는 뜻이에요."
- "은행이 돈을 빌려주는 조건이 바뀌었다는 것은 우리가 집을 살 때 더 쉽게 돈을 빌릴 수 있게 되었다는 뜻이에요."

❌ 절대 하면 안 되는 것:
- 전문 용어를 그대로 사용
- 어려운 경제 용어 사용
- 복잡한 설명

응답 형식:
📰 뉴스 요약
[3-4줄 요약 - 전문 용어 없이]

📖 쉬운 설명
[초등학생도 이해할 수 있는 아주 쉬운 설명 - 2-3줄]
`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        })
      })

      if (response.ok) {
        const data = await response.json()
        const result = data.choices[0].message.content
        
        // 응답을 요약과 쉬운 설명으로 분리
        const summaryMatch = result.match(/📰 뉴스 요약\s*([\s\S]*?)(?=📖 쉬운 설명|$)/)
        const glossaryMatch = result.match(/📖 쉬운 설명\s*([\s\S]*?)$/)
        
        const summary = summaryMatch ? summaryMatch[1].trim() : result
        const glossary = glossaryMatch ? glossaryMatch[1].trim() : ''
        
        // 전문 용어 후처리 함수 적용
        const processedSummary = removeTechnicalTerms(summary)
        const processedGlossary = removeTechnicalTerms(glossary)
        
        return { summary: processedSummary, glossary: processedGlossary }
      }
    }

    // Gemini API 사용 (대체)
      if (process.env.GEMINI_API_KEY) {
        const prompt = `
당신은 부동산 뉴스를 어린아이도 쉽게 이해할 수 있도록 설명하는 전문가입니다.

다음 기사를 분석해주세요:

기사 제목: ${title}
기사 내용: ${content}
카테고리: ${category}

다음 두 부분으로 나누어 답변해주세요:

1) 📰 뉴스 요약 (3-4줄)
- 기사의 핵심 내용을 간단명료하게 요약
- 전문 용어는 절대 사용하지 말고 일반인이 이해할 수 있는 표현만 사용

2) 📖 쉬운 설명 (2-3줄)
- 초등학생도 이해할 수 있는 수준으로 설명
- 모든 전문 용어를 일상적인 말로 바꿔서 설명
- "이 뉴스가 우리 일상에 어떤 영향을 주는지", "왜 중요한지"를 중심으로 설명

⚠️ 절대 사용하면 안 되는 전문 용어들 (반드시 쉬운 말로 바꿔서 설명):
- "프로젝트파이낸싱(PF)" → "건물을 짓기 위해 빌린 돈"
- "익스포저" → "빌린 돈의 양"
- "기초자산" → "투자한 돈이 들어간 곳"
- "우량 채권" → "안전한 투자"
- "주식시장의 변동성" → "주식 가격이 오르내리는 정도"
- "시장 위험" → "투자할 때 생길 수 있는 손실"
- "REITs" → "부동산에 투자하는 방법"
- "LTV" → "집값 대비 빌릴 수 있는 돈의 비율"
- "DTI" → "수입 대비 빌릴 수 있는 돈의 비율"
- "종부세" → "집을 가진 사람이 내는 세금"
- "부동산" → "집이나 땅"
- "투자" → "돈을 넣어서 더 많은 돈을 만들려는 것"
- "시장" → "사람들이 물건을 사고 파는 곳"
- "정책" → "정부가 내린 규칙"
- "분양" → "새로 지은 집을 파는 것"
- "청약" → "새 집을 살 기회를 신청하는 것"

✅ 올바른 설명 예시:
- "집값이 오른다는 것은 우리가 집을 살 때 더 많은 돈을 내야 한다는 뜻이에요. 하지만 이미 집을 가진 사람들은 집값이 올라서 좋을 수도 있어요."
- "정부가 새로운 규칙을 만들었다는 것은 우리가 집을 살 때 도움이 될 수도 있고, 어려워질 수도 있다는 뜻이에요."
- "은행이 돈을 빌려주는 조건이 바뀌었다는 것은 우리가 집을 살 때 더 쉽게 돈을 빌릴 수 있게 되었다는 뜻이에요."

❌ 절대 하면 안 되는 것:
- 전문 용어를 그대로 사용
- 어려운 경제 용어 사용
- 복잡한 설명

응답 형식:
📰 뉴스 요약
[3-4줄 요약 - 전문 용어 없이]

📖 쉬운 설명
[초등학생도 이해할 수 있는 아주 쉬운 설명 - 2-3줄]
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      })

      if (response.ok) {
        const data = await response.json()
        const result = data.candidates[0].content.parts[0].text
        
        // 응답을 요약과 쉬운 설명으로 분리
        const summaryMatch = result.match(/📰 뉴스 요약\s*([\s\S]*?)(?=📖 쉬운 설명|$)/)
        const glossaryMatch = result.match(/📖 쉬운 설명\s*([\s\S]*?)$/)
        
        const summary = summaryMatch ? summaryMatch[1].trim() : result
        const glossary = glossaryMatch ? glossaryMatch[1].trim() : ''
        
        // 전문 용어 후처리 함수 적용
        const processedSummary = removeTechnicalTerms(summary)
        const processedGlossary = removeTechnicalTerms(glossary)
        
        return { summary: processedSummary, glossary: processedGlossary }
      }
    }

    // API가 없거나 실패한 경우 스마트한 기본 분석 사용
    console.log('AI API 없음 - 스마트 분석 시스템 사용')
    const analysis = analyzeNewsContent(title, content)
    const defaultSummary = generateDefaultSummary(content, category)
    const smartGlossary = generateSmartGlossary(title, content, analysis.detectedTerms)
    
    return { 
      summary: defaultSummary, 
      glossary: smartGlossary
    }
    
  } catch (error) {
    console.error('AI 쉬운 설명 요약 오류:', error)
    console.log('오류 발생 - 스마트 분석 시스템으로 대체')
    const analysis = analyzeNewsContent(title, content)
    const defaultSummary = generateDefaultSummary(content, category)
    const smartGlossary = generateSmartGlossary(title, content, analysis.detectedTerms)
    
    return { 
      summary: defaultSummary, 
      glossary: smartGlossary
    }
  }
}

// 실제 뉴스 내용을 분석해서 의미 있는 요약과 용어 설명을 생성하는 함수
function analyzeNewsContent(title: string, content: string): { detectedTerms: string[]; keyPoints: string[]; difficulty: 'easy' | 'medium' | 'hard' } {
  const text = `${title} ${content}`.toLowerCase()
  
  // 전문 용어 탐지 (20~30대 초보자 중심으로 확장)
  const technicalTerms = [
    // 대출 관련 (가장 중요)
    'ltv', 'dsr', '전세대출', '주택담보대출', '신용대출', '대출한도', '대출금리', '변동금리', '고정금리',
    '원리금균등', '원금균등', '거치기간', '상환기간', '중도상환', '연체', '신용등급',
    
    // 전세/월세 실무 (20~30대 핵심)
    '전세', '월세', '보증금', '임대료', '관리비', '계약갱신', '임대차보호법', '전세권', '임대차계약',
    '전월세전환율', '전세가율', '갱신거절', '계약해지', '보증금반환', '임대인', '임차인',
    
    // 청년/신혼 지원제도
    '청년전세대출', '버팀목전세대출', '디딤돌대출', '생애최초', '신혼부부대출', '중기청대출',
    '청년 주거급여', '월세지원', '전세자금대출', 'hug', '주택도시보증공사',
    
    // 담보/등기 관련
    '저당권', '근저당', '등기부등본', '소유권이전', '전세권설정', '채권최고액', '담보설정',
    '선순위', '후순위', '가압류', '경매', '공매',
    
    // 세금 관련
    '취득세', '등록세', '인지세', '양도세', '종부세', '재산세', '증여세', '상속세',
    
    // 기타 실무 용어
    '청약', '분양', '입주', '잔금', '계약금', '중도금', '대출승계', '명도', '중개수수료',
    '프로젝트파이낸싱', 'pf', 'reits', '경공매'
  ]
  
  const detectedTerms = technicalTerms.filter(term => text.includes(term))
  
  // 20~30대 초보자가 관심있어할 키포인트 추출
  const keyPoints: string[] = []
  
  // 전세/월세 관련 (가장 중요)
  if (text.includes('전세') || text.includes('월세') || text.includes('보증금')) {
    keyPoints.push('전세나 월세 시장에 변화가 있어요')
  }
  
  // 대출 관련 (핵심 관심사)
  if (text.includes('대출') || text.includes('금리') || text.includes('ltv') || text.includes('dsr')) {
    keyPoints.push('집 관련 대출 조건이 바뀔 수 있어요')
  }
  
  // 청년/신혼 지원 관련
  if (text.includes('청년') || text.includes('신혼') || text.includes('생애최초') || text.includes('버팀목') || text.includes('디딤돌')) {
    keyPoints.push('청년이나 신혼부부를 위한 지원 정책이에요')
  }
  
  // 가격 변동 (실생활 영향)
  if (text.includes('오른') || text.includes('상승') || text.includes('증가')) {
    keyPoints.push('집값이나 전세가가 오르고 있어요')
  }
  if (text.includes('떨어') || text.includes('하락') || text.includes('감소')) {
    keyPoints.push('집값이나 전세가가 내려가고 있어요')
  }
  
  // 계약/권리 보호 관련
  if (text.includes('계약') || text.includes('임대차') || text.includes('갱신') || text.includes('보호')) {
    keyPoints.push('임대차 계약이나 세입자 권리와 관련된 내용이에요')
  }
  
  // 세금 관련
  if (text.includes('세금') || text.includes('취득세') || text.includes('종부세')) {
    keyPoints.push('집 관련 세금에 변화가 있을 수 있어요')
  }
  
  // 어려움 정도 판단
  const difficulty = detectedTerms.length > 5 ? 'hard' : detectedTerms.length > 2 ? 'medium' : 'easy'
  
  return { detectedTerms, keyPoints, difficulty }
}

// 스마트한 용어 설명 생성
function generateSmartGlossary(title: string, content: string, detectedTerms: string[]): string {
  const explanations: string[] = []
  
  // 발견된 용어들에 대한 쉬운 설명 (20~30대 실무 중심)
  const termExplanations: { [key: string]: string } = {
    // 대출 관련 (가장 중요 - 실제 사용 예시 포함)
    'ltv': '집값 대비 대출 비율이에요. 3억 집에 LTV 70%면 최대 2.1억까지 대출 가능해요',
    'dsr': '소득 대비 대출상환 비율이에요. 월급 300만원에 DSR 40%면 월상환금은 120만원까지만 가능해요',
    '전세대출': '전세보증금을 대출로 빌리는 것이에요. 보통 전세금의 80% 정도까지 빌릴 수 있어요',
    '주택담보대출': '집을 담보로 잡고 돈을 빌리는 대출이에요. 보통 금리가 낮아요',
    '대출한도': '은행에서 빌릴 수 있는 최대 금액이에요. 소득과 신용등급에 따라 달라져요',
    '변동금리': '시장 금리에 따라 대출금리가 계속 바뀌는 방식이에요',
    '고정금리': '처음 정한 금리가 계속 유지되는 방식이에요. 안전하지만 보통 변동금리보다 높아요',
    '원리금균등': '매월 내는 돈(원금+이자)이 똑같은 상환 방식이에요. 가장 일반적이에요',
    '거치기간': '이자만 내고 원금은 나중에 갚는 기간이에요. 초기 부담이 적어요',
    
    // 전세/월세 실무 (20~30대 핵심)
    '전세': '보증금만 내고 월세 없이 사는 방식이에요. 계약 끝나면 보증금 전액 돌려받아요',
    '월세': '매달 일정 금액을 내고 사는 방식이에요. 보증금은 전세보다 적어요',
    '보증금': '집을 빌릴 때 미리 맡기는 돈이에요. 계약 끝나면 돌려받아야 해요',
    '계약갱신': '임대차 계약을 연장하는 것이에요. 임차인이 원하면 2년 더 살 수 있어요',
    '임대차보호법': '세입자를 보호하는 법이에요. 보증금 반환, 갱신권 등을 보장해줘요',
    '전월세전환율': '전세를 월세로 바꿀 때 사용하는 비율이에요. 보통 연 4-6% 정도예요',
    '갱신거절': '집주인이 계약 연장을 거부하는 것이에요. 정당한 사유가 있어야 해요',
    '보증금반환': '계약이 끝나면 집주인이 보증금을 돌려줘야 해요. 늦으면 이자도 줘야 해요',
    
    // 청년/신혼 지원제도
    '청년전세대출': '만 34세 이하 청년이 받을 수 있는 전세대출이에요. 금리가 저렴해요',
    '버팀목전세대출': 'HUG에서 보증하는 전세대출이에요. 소득 기준을 만족하면 금리가 낮아요',
    '디딤돌대출': '생애최초 주택구입자를 위한 정부 지원 대출이에요. 금리가 시중보다 낮아요',
    '생애최초': '본인과 배우자 모두 집을 처음 사는 경우예요. 세제혜택과 대출혜택이 있어요',
    '신혼부부대출': '결혼한 지 7년 이내 부부가 받을 수 있는 특별 대출이에요',
    '중기청대출': '중소벤처기업부에서 청년에게 지원하는 전세자금대출이에요',
    'hug': '주택도시보증공사예요. 전세보증보험과 대출보증을 해주는 공기업이에요',
    
    // 담보/등기 관련
    '저당권': '대출을 갚지 못하면 집을 팔아서 돈을 받을 수 있는 권리예요',
    '근저당': '앞으로 생길 빚까지 포함해서 담보로 잡는 방식이에요. 대출에서 주로 사용해요',
    '등기부등본': '집의 소유자와 권리관계를 확인할 수 있는 서류예요. 계약 전 필수 확인사항이에요',
    '전세권설정': '전세보증금을 보호하기 위해 등기하는 것이에요. 집주인 동의가 필요해요',
    '선순위': '권리 행사 순서가 앞선다는 뜻이에요. 돈을 받을 때도 먼저 받을 수 있어요',
    '후순위': '권리 행사 순서가 뒤라는 뜻이에요. 위험이 더 크죠',
    
    // 세금 관련
    '취득세': '집을 살 때 내는 세금이에요. 집값의 1-3% 정도예요',
    '종부세': '비싼 집(9억 이상)을 가진 사람이 매년 내는 세금이에요',
    '양도세': '집을 팔 때 이익이 생기면 내는 세금이에요',
    
    // 기타 실무 용어
    '청약': '새로 짓는 아파트를 살 권리를 얻기 위해 신청하는 것이에요',
    '계약금': '집을 계약할 때 먼저 내는 돈이에요. 보통 매매가의 10% 정도예요',
    '잔금': '집값에서 계약금과 중도금을 뺀 나머지 돈이에요. 열쇠를 받을 때 내요',
    '중개수수료': '부동산중개사에게 주는 수수료예요. 거래가격의 0.5-0.9% 정도예요'
  }
  
  // 발견된 용어 중 상위 3개만 설명
  const topTerms = detectedTerms.slice(0, 3)
  
  for (const term of topTerms) {
    const explanation = termExplanations[term]
    if (explanation) {
      explanations.push(`• ${term}: ${explanation}`)
    }
  }
  
  // 내용 기반 추가 설명 (20~30대 실생활 중심)
  const text = `${title} ${content}`.toLowerCase()
  
  if (text.includes('전세') && (text.includes('오른') || text.includes('상승'))) {
    explanations.push('• 전세 상승: 전세보증금이 올라서 더 많은 돈이 필요해질 수 있어요')
  }
  
  if (text.includes('ltv') || text.includes('dsr')) {
    explanations.push('• LTV/DSR: 대출받을 수 있는 한도를 정하는 기준이에요. 낮아지면 대출이 어려워져요')
  }
  
  if (text.includes('전세대출') || text.includes('버팀목') || text.includes('디딤돌')) {
    explanations.push('• 정부 지원대출: 청년이나 무주택자를 위한 저금리 대출 제도예요')
  }
  
  if (text.includes('계약갱신') || text.includes('임대차')) {
    explanations.push('• 임대차 계약: 세입자가 2년 더 살 수 있는 권리가 있어요. 월세도 제한적으로만 올릴 수 있어요')
  }
  
  if (text.includes('청년') && text.includes('지원')) {
    explanations.push('• 청년 주거지원: 만 34세 이하 청년을 위한 다양한 주거 지원 정책이 있어요')
  }
  
  if (text.includes('보증금') && text.includes('보호')) {
    explanations.push('• 보증금 보호: 전세보증보험이나 전세권 설정으로 보증금을 안전하게 보호할 수 있어요')
  }
  
  if (explanations.length === 0) {
    return '📖 쉬운 설명\n• 이 뉴스는 우리가 살고 있는 집이나 집을 사는 것과 관련된 중요한 소식이에요.\n• 어려운 용어 대신 쉬운 말로 설명해드리면, 우리 일상에 영향을 주는 변화가 있다는 뜻이에요.'
  }
  
  return `📖 쉬운 설명\n${explanations.join('\n')}`
}

export function generateDefaultSummary(content: string, category: string): string {
  // 전문 용어를 쉬운 말로 변환
  const processedContent = removeTechnicalTerms(content)
  
  // 문장을 나누되, 더 스마트하게 처리
  const sentences = processedContent.split(/[.!?]/).filter(s => s.trim().length > 10)
  const firstTwo = sentences.slice(0, 2).join('. ') + '.'
  
  const categoryMessages = {
    '초보자용': '이 뉴스는 집이나 땅을 처음 사려는 분들에게 도움이 되는 중요한 정보예요.',
    '신혼부부용': '내 집 마련을 꿈꾸는 신혼부부에게 유용한 소식이에요.',
    '투자자용': '집이나 땅에 돈을 투자하려는 분들이 알아두면 좋은 변화 소식이에요.',
    '부동산 기초': '집이나 땅과 관련된 기본적인 내용을 다룬 소식이에요.'
  }
  
  return `${firstTwo} ${categoryMessages[category as keyof typeof categoryMessages] || '집이나 땅과 관련된 중요한 소식이에요.'}`
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