import { NextResponse } from 'next/server'
import { testNewsLinks } from '@/lib/ai'

export async function GET() {
  try {
    console.log('뉴스 링크 테스트 API 호출')
    
    const results = await testNewsLinks()
    
    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        valid: results.filter(r => r.valid).length,
        invalid: results.filter(r => !r.valid).length
      }
    })
  } catch (error) {
    console.error('뉴스 링크 테스트 오류:', error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}
