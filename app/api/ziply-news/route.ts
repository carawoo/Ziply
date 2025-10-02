import { NextRequest, NextResponse } from 'next/server'

// Ziply API를 통해 뉴스를 가져오는 프록시 엔드포인트
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'
    const limit = searchParams.get('limit') || '4'
    
    console.log('=== Ziply API 프록시 호출 ===')
    console.log('카테고리:', category)
    console.log('제한:', limit)
    
    // Ziply 공개 API 호출
    const ziplyApiUrl = `https://ziply-nine.vercel.app/api/public/newsletter?category=${encodeURIComponent(category)}&limit=${limit}&format=json`
    
    console.log('Ziply API URL:', ziplyApiUrl)
    
    const response = await fetch(ziplyApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 타임아웃 설정
      signal: AbortSignal.timeout(10000) // 10초 타임아웃
    })
    
    if (!response.ok) {
      console.error('Ziply API 호출 실패:', response.status, response.statusText)
      return NextResponse.json({
        success: false,
        error: 'Ziply API 호출 실패',
        status: response.status,
        message: 'Ziply API에서 뉴스를 가져올 수 없습니다.'
      }, { status: 503 })
    }
    
    const data = await response.json()
    
    if (!data.success) {
      console.error('Ziply API 응답 오류:', data.error)
      return NextResponse.json({
        success: false,
        error: data.error || 'Ziply API 응답 오류',
        message: 'Ziply API에서 오류가 발생했습니다.'
      }, { status: 503 })
    }
    
    console.log('Ziply API 성공:', data.data?.newsletter?.totalItems, '개 뉴스')
    
    // Ziply API 응답을 기존 형식으로 변환
    const transformedNews = data.data.newsletter.items.map((item: any) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      content: item.content,
      url: item.url,
      publishedAt: item.publishedAt,
      category: item.category,
      source: item.source,
      glossary: item.glossary
    }))
    
    return NextResponse.json({
      success: true,
      news: transformedNews,
      source: 'Ziply API',
      totalItems: transformedNews.length
    })
    
  } catch (error) {
    console.error('❌ Ziply API 프록시 오류:', error)
    return NextResponse.json({
      success: false,
      error: 'Ziply API 프록시 오류',
      message: 'Ziply API 연결 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 })
  }
}
