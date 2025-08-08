import { NextRequest, NextResponse } from 'next/server'
import { getNewsForTab, summarizeNews, generateDefaultSummary } from '@/lib/ai'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab')
    
    if (!tab) {
      return NextResponse.json({
        success: false,
        error: 'tab parameter is required'
      }, { status: 400 })
    }
    
    console.log('뉴스 API 호출:', tab)
    
    // 탭에 따른 맞춤형 뉴스 가져오기
    const sampleNews = await getNewsForTab(tab)
    console.log('가져온 뉴스 개수:', sampleNews.length)
    
    if (sampleNews.length === 0) {
      console.log('뉴스가 없습니다.')
      return NextResponse.json({
        success: true,
        news: []
      })
    }
    
    // AI 요약 생성 (에러 처리 포함)
    const newsWithSummaries = await Promise.all(
      sampleNews.map(async (item) => {
        try {
          const summary = await summarizeNews(item.content, tab)
          return { ...item, summary }
        } catch (summaryError) {
          console.error('요약 생성 실패:', summaryError)
          // 요약 실패 시 기본 요약 사용
          const defaultSummary = generateDefaultSummary(item.content, tab)
          return { ...item, summary: defaultSummary }
        }
      })
    )
    
    console.log('요약 완료된 뉴스 개수:', newsWithSummaries.length)
    
    return NextResponse.json({
      success: true,
      news: newsWithSummaries
    })
    
  } catch (error) {
    console.error('뉴스 API 오류:', error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}
