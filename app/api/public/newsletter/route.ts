import { NextRequest, NextResponse } from 'next/server'
import { fetchNewsByTab, summarizeWithGlossary } from '@/lib/ai'
import he from 'he'

// 다른 서비스에서 사용할 수 있는 공개 뉴스레터 API
// 캐시 설정: 30분마다 갱신
export const revalidate = 1800 // 30분

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'
    const format = searchParams.get('format') || 'json' // json, html
    const limit = parseInt(searchParams.get('limit') || '4')
    const includeGlossary = searchParams.get('glossary') !== 'false' // 기본값 true
    
    console.log('=== 공개 뉴스레터 API 호출 ===')
    console.log('카테고리:', category)
    console.log('포맷:', format)
    console.log('제한:', limit)
    console.log('용어풀이 포함:', includeGlossary)
    
    // 지원되는 카테고리 목록
    const supportedCategories = [
      '정책뉴스', '시장분석', '지원혜택', 
      '초보자용', '신혼부부용', '투자자용'
    ]
    
    let newsItems: any[] = []
    
    if (category === 'all') {
      // 모든 카테고리의 뉴스를 수집
      const allNews = await Promise.all(
        supportedCategories.map(async (cat) => {
          try {
            const items = await fetchNewsByTab(cat)
            return items.slice(0, Math.ceil(limit / supportedCategories.length)).map(item => ({
              ...item,
              category: cat
            }))
          } catch (error) {
            console.error(`카테고리 ${cat} 수집 실패:`, error)
            return []
          }
        })
      )
      newsItems = allNews.flat()
    } else if (supportedCategories.includes(category)) {
      // 특정 카테고리만 수집
      try {
        const items = await fetchNewsByTab(category)
        newsItems = items.slice(0, limit).map(item => ({
          ...item,
          category: category
        }))
      } catch (error) {
        console.error(`카테고리 ${category} 수집 실패:`, error)
        return NextResponse.json({
          success: false,
          error: '해당 카테고리의 뉴스를 가져올 수 없습니다.',
          category: category
        }, { status: 404 })
      }
    } else {
      return NextResponse.json({
        success: false,
        error: '지원하지 않는 카테고리입니다.',
        supportedCategories: supportedCategories,
        usage: 'category=all 또는 category=정책뉴스&format=json&limit=4&glossary=true'
      }, { status: 400 })
    }
    
    // 뉴스가 없는 경우
    if (newsItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: '수집된 뉴스가 없습니다.',
        category: category,
        message: '잠시 후 다시 시도해주세요.'
      }, { status: 404 })
    }
    
    // AI 요약 및 용어 풀이 생성
    const processedNews = await Promise.all(
      newsItems.map(async (item) => {
        try {
          // HTML 엔티티 디코딩 및 태그 제거
          const decodedTitle = he.decode((item.title || '').toString())
          const decodedContent = he.decode((item.content || '').toString())
          const cleanTitle = decodedTitle.replace(/<[^>]*>/g, '').trim()
          const cleanContent = decodedContent.replace(/<[^>]*>/g, '').trim()
          
          const result = await summarizeWithGlossary(cleanTitle, cleanContent, item.category || category)
          
          return {
            id: item.id || Math.random().toString(36).substr(2, 9),
            title: cleanTitle,
            summary: result.summary,
            content: cleanContent,
            url: item.url,
            publishedAt: item.publishedAt || new Date().toISOString(),
            category: item.category || category,
            source: item.source || 'Ziply',
            ...(includeGlossary && { glossary: result.glossary })
          }
        } catch (error) {
          console.error('뉴스 처리 실패:', error)
          return {
            id: item.id || Math.random().toString(36).substr(2, 9),
            title: item.title || '',
            summary: item.summary || item.content || '',
            content: item.content || '',
            url: item.url,
            publishedAt: item.publishedAt || new Date().toISOString(),
            category: item.category || category,
            source: item.source || 'Ziply',
            ...(includeGlossary && { glossary: '용어 설명을 생성할 수 없습니다.' })
          }
        }
      })
    )
    
    // 응답 포맷 결정
    if (format === 'html') {
      const htmlContent = generateNewsletterHTML(processedNews, category)
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=1800' // 30분 캐시
        }
      })
    }
    
    // JSON 응답
    const response = {
      success: true,
      data: {
        newsletter: {
          title: `${category === 'all' ? '종합' : category} 부동산 뉴스`,
          date: new Date().toLocaleDateString('ko-KR'),
          category: category,
          totalItems: processedNews.length,
          items: processedNews
        },
        meta: {
          generatedAt: new Date().toISOString(),
          source: 'Ziply Newsletter API',
          version: '1.0',
          supportedCategories: supportedCategories,
          usage: {
            categories: 'category=정책뉴스|시장분석|지원혜택|초보자용|신혼부부용|투자자용|all',
            format: 'format=json|html',
            limit: 'limit=1-20 (기본값: 4)',
            glossary: 'glossary=true|false (기본값: true)'
          }
        }
      }
    }
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=1800', // 30분 캐시
        'Access-Control-Allow-Origin': '*', // CORS 허용
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
    
  } catch (error) {
    console.error('❌ 공개 뉴스레터 API 오류:', error)
    return NextResponse.json({
      success: false,
      error: '뉴스레터 데이터를 가져오는 중 오류가 발생했습니다.',
      message: '서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// HTML 포맷용 뉴스레터 생성 함수
function generateNewsletterHTML(newsItems: any[], category: string): string {
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  
  const newsHTML = newsItems.map((news, index) => {
    const glossarySection = news.glossary ? `
      <div style="margin-top: 12px; padding: 12px; background: #f0f9ff; border-radius: 6px; border-left: 3px solid #0ea5e9;">
        <div style="color: #0c4a6e; font-size: 13px; font-weight: 600; margin-bottom: 6px;">📖 쉬운 설명</div>
        <div style="color: #0369a1; font-size: 12px; line-height: 1.5; white-space: pre-line;">${news.glossary}</div>
      </div>` : '';

    return `
      <div style="margin-bottom: 24px; padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #4f46e5;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">
          ${index === 0 ? '🔥' : index === 1 ? '📈' : index === 2 ? '💡' : '🎯'} ${news.title}
        </h3>
        <p style="margin: 0 0 12px 0; color: #6b7280; line-height: 1.6; font-size: 14px;">
          ${news.summary || news.content}
        </p>
        ${glossarySection}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
          <span style="color: #9ca3af; font-size: 12px;">
            ${new Date(news.publishedAt).toLocaleDateString('ko-KR')}
          </span>
          <a href="${news.url || '#'}" style="color: #4f46e5; text-decoration: none; font-size: 12px; font-weight: 600;">원문 보기 →</a>
        </div>
      </div>`;
  }).join('');

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${category === 'all' ? '종합' : category} 부동산 뉴스 - Ziply API</title>
    </head>
    <body style="margin:0;padding:24px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tr>
          <td align="center">
            <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 20px rgba(0,0,0,0.06);">
              <tr>
                <td align="center" style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);padding:28px;">
                  <div style="color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.02em;">📈 Ziply API</div>
                  <div style="color:rgba(255,255,255,0.9);margin-top:8px;font-size:14px;">${today} ${category === 'all' ? '종합' : category} 부동산 뉴스</div>
                </td>
              </tr>
              <tr>
                <td style="padding:28px;">
                  <h2 style="margin:0 0 12px 0;color:#111827;font-size:20px;">${category === 'all' ? '종합' : category} 부동산 뉴스</h2>
                  <p style="margin:0 0 16px 0;color:#6b7280;line-height:1.7;">Ziply API를 통해 제공되는 최신 부동산 뉴스입니다.</p>
                  ${newsHTML}
                  <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;">
                    <div style="color:#9ca3af;font-size:12px;margin:0 0 12px 0;">Powered by Ziply Newsletter API</div>
                    <div style="margin-bottom:6px;">
                      <a href="https://ziply-nine.vercel.app/" style="color:#2563eb;text-decoration:none;font-weight:700;">Ziply 웹사이트</a>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

// OPTIONS 요청 처리 (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
