import { NextResponse } from 'next/server'
import { getNewsForTab } from '@/lib/ai'

export async function GET() {
  try {
    console.log('getNewsForTab 테스트 API 호출')
    
    // 각 탭별로 getNewsForTab 함수 테스트
    const tabs = ['초보자용', '신혼부부용', '투자자용', '정책뉴스', '시장분석', '지원혜택']
    const results: Record<string, any> = {}
    
    for (const tab of tabs) {
      console.log(`=== ${tab} 탭 테스트 시작 ===`)
      const news = await getNewsForTab(tab)
      results[tab] = {
        count: news.length,
        categories: news.map(n => n.category),
        titles: news.map(n => n.title)
      }
      console.log(`=== ${tab} 탭 테스트 완료: ${news.length}개 ===`)
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
