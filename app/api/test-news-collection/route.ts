import { NextResponse } from 'next/server'
import { fetchMultiSourceNews } from '@/lib/ai'

export async function GET() {
  try {
    console.log('뉴스 수집 테스트 API 호출')
    
    // 부동산 정책 뉴스 수집 테스트
    const policyNews = await fetchMultiSourceNews('부동산 정책')
    
    // 부동산 시장 뉴스 수집 테스트
    const marketNews = await fetchMultiSourceNews('부동산 시장')
    
    // 뉴스 링크 유효성 분석
    const policyLinks = policyNews.map((news: any) => ({
      title: news.title,
      url: news.url,
      domain: news.url ? new URL(news.url).hostname : 'N/A'
    }))
    
    const marketLinks = marketNews.map((news: any) => ({
      title: news.title,
      url: news.url,
      domain: news.url ? new URL(news.url).hostname : 'N/A'
    }))
    
    // 도메인별 분포 분석
    const policyDomains = new Map<string, number>()
    const marketDomains = new Map<string, number>()
    
    policyLinks.forEach((link: any) => {
      policyDomains.set(link.domain, (policyDomains.get(link.domain) || 0) + 1)
    })
    
    marketLinks.forEach((link: any) => {
      marketDomains.set(link.domain, (marketDomains.get(link.domain) || 0) + 1)
    })
    
    return NextResponse.json({
      success: true,
      policy: {
        count: policyNews.length,
        links: policyLinks,
        domainDistribution: Object.fromEntries(policyDomains)
      },
      market: {
        count: marketNews.length,
        links: marketLinks,
        domainDistribution: Object.fromEntries(marketDomains)
      },
      summary: {
        totalPolicy: policyNews.length,
        totalMarket: marketNews.length,
        totalUniqueDomains: new Set([
          ...Array.from(policyDomains.keys()),
          ...Array.from(marketDomains.keys())
        ]).size
      }
    })
  } catch (error) {
    console.error('뉴스 수집 테스트 오류:', error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}
