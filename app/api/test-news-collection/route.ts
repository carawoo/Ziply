import { NextResponse } from 'next/server'

// dev 테스트용: 빌드 시 정적 생성 방지
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'
import { getNewsForTab, fetchNewsByTab, fetchNaverNewsAPI } from '@/lib/ai'

export async function GET() {
  try {
    console.log('getNewsForTab 테스트 API 호출')
    
    // 각 탭별로 getNewsForTab / fetchNewsByTab / fetchNaverNewsAPI 교차 테스트
    const tabs = ['초보자용', '신혼부부용', '투자자용', '정책뉴스', '시장분석', '지원혜택']
    const results: Record<string, any> = {}
    
    for (const tab of tabs) {
      console.log(`=== ${tab} 탭 테스트 시작 ===`)
      const apiNews = await getNewsForTab(tab)
      const realNews = await fetchNewsByTab(tab)
      // 네이버 API는 카테고리 키워드로 테스트 (대략적인 매핑)
      const naverCategory = tab === '초보자용' ? 'beginner' :
                            tab === '신혼부부용' ? 'newlywed' :
                            tab === '투자자용' ? 'investment' :
                            tab === '정책뉴스' ? 'policy' :
                            tab === '시장분석' ? 'market' : 'support'
      const naverNews = await fetchNaverNewsAPI(naverCategory)

      results[tab] = {
        apiPipeline: {
          count: apiNews.length,
          titles: apiNews.map(n => n.title)
        },
        realPipeline: {
          count: realNews.length,
          titles: realNews.map(n => n.title)
        },
        naverApi: {
          count: naverNews.length,
          sample: naverNews.slice(0, 5).map(n => ({ title: n.title, url: n.url }))
        }
      }
      console.log(`=== ${tab} 탭 테스트 완료: api ${apiNews.length} / real ${realNews.length} / naver ${naverNews.length} ===`)
    }
    
    return NextResponse.json({
      success: true,
      results,
      summary: {
        totalTabs: tabs.length,
        totalNews: Object.values(results).reduce((sum: any, tab: any) => sum + tab.count, 0)
      }
    })
  } catch (error) {
    console.error('getNewsForTab 테스트 오류:', error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}
