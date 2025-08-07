import { NextRequest, NextResponse } from 'next/server'
import { summarizeNews } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { content, category } = await request.json()
    
    if (!content || !category) {
      return NextResponse.json(
        { error: '내용과 카테고리가 필요합니다.' },
        { status: 400 }
      )
    }

    const summary = await summarizeNews(content, category)
    
    return NextResponse.json({ summary })
  } catch (error) {
    console.error('요약 API 오류:', error)
    return NextResponse.json(
      { error: '요약 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
