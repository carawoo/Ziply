import { NextRequest, NextResponse } from 'next/server'
import { fetchNewsByTab, summarizeWithGlossary, generateDefaultSummary } from '@/lib/ai'
import he from 'he'

// 캐시 끄기
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab')
    
    if (!tab) {
      return NextResponse.json({
        success: false,
        error: 'tab parameter is required',
        reason: 'API 파라미터 누락'
      }, { status: 400 })
    }
    
    console.log('=== 뉴스 API 호출 시작 ===')
    console.log('요청된 탭:', tab)
    
    // 뉴스 수집 실패 원인 추적을 위한 디버그 정보
    const debugInfo = {
      step: '',
      error: '',
      apiStatus: '',
      naverApiAvailable: !!process.env.NAVER_CLIENT_ID,
      environmentCheck: process.env.NODE_ENV
    }
    
    // 탭 기반 실제 뉴스 수집 파이프라인 사용 (타임아웃 가드)
    console.log('탭 기반 실제 뉴스 수집 시작...')
    debugInfo.step = '뉴스 수집 시작'
    
    let news: any[] = []
    
    try {
      const NEWS_TIMEOUT_MS = 15000 // 15초로 증가 (안정성 개선)
      news = await Promise.race([
        fetchNewsByTab(tab),
        new Promise((resolve) => setTimeout(() => {
          debugInfo.error = '뉴스 수집 타임아웃 (15초 초과)'
          resolve([])
        }, NEWS_TIMEOUT_MS))
      ]) as any[]
      
      console.log('탭 기반 실제 뉴스 수집 완료:', news.length, '개')
      debugInfo.step = '뉴스 수집 완료'
      
    } catch (fetchError) {
      console.error('뉴스 수집 중 오류:', fetchError)
      debugInfo.step = '뉴스 수집 실패'
      debugInfo.error = String(fetchError)
      
      return NextResponse.json({
        success: false,
        error: '가져오지 못했습니다.',
        reason: `뉴스 수집 API 오류: ${debugInfo.error}`,
        debug: debugInfo,
        message: '뉴스 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
      }, { status: 503 })
    }
    
    // 뉴스가 없는 경우 처리
    if (news.length === 0) {
      console.log('❌ 실제 뉴스를 가져오지 못했습니다.')
      debugInfo.error = debugInfo.error || '네이버 뉴스 API에서 해당 탭의 최신 뉴스를 찾지 못함'
      
      return NextResponse.json({ 
        success: false, 
        error: '가져오지 못했습니다.',
        reason: debugInfo.error,
        debug: debugInfo,
        message: `${tab} 탭에 해당하는 최신 부동산 뉴스를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.`
      }, { status: 404 })
    }
    
    // AI 요약 생성 (에러/타임아웃 처리 포함)
    debugInfo.step = 'AI 요약 생성 시작'
    const SUMMARY_TIMEOUT_MS = 3000 // 3초로 증가 (안정성 개선)
    const newsWithSummaries = await Promise.all(
      news.map(async (item: any) => {
        // HTML 엔티티 디코딩 및 태그 제거
        const decodedTitle = he.decode((item.title || '').toString())
        const decodedContent = he.decode((item.content || '').toString())
        const cleanTitle = decodedTitle.replace(/<[^>]*>/g, '').trim()
        const cleanContent = decodedContent.replace(/<[^>]*>/g, '').trim()
        
        try {
          const result = await Promise.race([
            summarizeWithGlossary(cleanTitle, cleanContent, tab),
            new Promise((_, reject) => setTimeout(() => reject(new Error('summary-timeout')), SUMMARY_TIMEOUT_MS))
          ]) as { summary: string; glossary: string }
          
          return { 
            ...item, 
            title: cleanTitle, 
            content: cleanContent, 
            summary: result.summary, 
            glossary: result.glossary 
          }
        } catch (summaryError) {
          console.error('요약 생성 실패:', summaryError)
          
          // ⚠️ 하드코딩된 fallback 제거 - 스마트 분석 시스템 사용
          console.log('AI 요약 실패 - 스마트 분석 시스템으로 대체')
          const result = await summarizeWithGlossary(cleanTitle, cleanContent, tab)
          
          return { 
            ...item, 
            title: cleanTitle, 
            content: cleanContent, 
            summary: result.summary, 
            glossary: result.glossary 
          }
        }
      })
    )
    
    console.log('요약 완료된 뉴스 개수:', newsWithSummaries.length)
    console.log('=== 뉴스 API 호출 완료 ===')
    
    return NextResponse.json({
      success: true,
      news: newsWithSummaries.slice(0, 4)
    })
    
  } catch (error) {
    console.error('❌ 뉴스 API 치명적 오류:', error)
    return NextResponse.json({
      success: false,
      error: '가져오지 못했습니다.',
      reason: `API 서버 내부 오류: ${String(error)}`,
      message: '뉴스 서비스에 심각한 문제가 발생했습니다. 개발팀에 문의해주세요.',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}


