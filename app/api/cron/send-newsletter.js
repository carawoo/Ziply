require('dotenv').config({ path: '.env' })
const cron = require('node-cron')
const { createClient } = require('@supabase/supabase-js')
const nodemailer = require('nodemailer')
// Node.js 환경에서 fetch 사용 (undici)
let fetchFn
try {
  // Node 18+ 에서는 글로벌 fetch 가 있을 수 있음
  if (typeof fetch !== 'undefined') {
    fetchFn = fetch
  } else {
    const { fetch: undiciFetch } = require('undici')
    fetchFn = undiciFetch
  }
} catch {
  const { fetch: undiciFetch } = require('undici')
  fetchFn = undiciFetch
}

// Supabase 클라이언트 생성 (서비스 롤 키 우선)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// 이메일 전송기 설정
const createTransporter = () => {
  const protocol = String(process.env.EMAIL_PROTOCOL || '').toLowerCase() // 'ssl' | 'tls' | ''(auto)
  const port = parseInt(process.env.EMAIL_PORT || (protocol === 'ssl' ? '465' : '587'))
  const secure = protocol === 'ssl' || (String(process.env.EMAIL_SECURE || '').toLowerCase() === 'true') || port === 465
  
  // 환경변수 정리 및 검증
  const emailUser = String(process.env.EMAIL_USER || '').trim()
  const emailPass = String(process.env.EMAIL_PASS || '').replace(/\s+/g, '')
  
  console.log('📧 이메일 설정 확인:')
  console.log(`- Host: ${process.env.EMAIL_HOST}`)
  console.log(`- Port: ${port}`)
  console.log(`- Secure: ${secure}`)
  console.log(`- User: ${emailUser}`)
  console.log(`- Pass length: ${emailPass.length}자`)
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure,
    requireTLS: protocol === 'tls',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  })
}

// 기본 사이트 URL (API 호출용)
const BASE_URL = process.env.APP_BASE_URL || 'https://ziply-nine.vercel.app/'

// 탭별 뉴스 수집 (Next API 사용)
const fetchNewsByTab = async (tab) => {
  const url = `${BASE_URL}/api/news?tab=${encodeURIComponent(tab)}`
  const res = await fetchFn(url, { method: 'GET' })
  if (!res.ok) {
    console.error(`[fetchNewsByTab] 실패: ${tab} -> ${res.status}`)
    return []
  }
  const data = await res.json()
  return Array.isArray(data.news) ? data.news : []
}

// 뉴스레터 HTML 생성 (용어 풀이 포함)
const buildNewsletterHtml = (byTab) => {
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  const sectionHtml = Object.entries(byTab).map(([tab, items]) => {
    const list = items.slice(0, 4).map((n, idx) => {
      // 용어 풀이가 있는 경우에만 표시
      const glossarySection = n.glossary ? `
        <div style="margin-top: 10px; padding: 10px; background: #f0f9ff; border-radius: 6px; border-left: 3px solid #0ea5e9;">
          <div style="color: #0c4a6e; font-size: 12px; font-weight: 600; margin-bottom: 4px;">📖 용어 풀이</div>
          <div style="color: #0369a1; font-size: 11px; line-height: 1.4; white-space: pre-line;">${n.glossary}</div>
        </div>
      ` : '';

      return `
        <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:8px;border-left:4px solid #4f46e5;">
          <h3 style="margin:0 0 8px 0;color:#111827;font-size:16px;">${idx === 0 ? '🔥' : idx === 1 ? '📈' : idx === 2 ? '💡' : '🎯'} ${n.title}</h3>
          <p style="margin:0 0 10px 0;color:#4b5563;line-height:1.6;font-size:14px;">${(n.summary || n.content || '').toString().slice(0, 300)}</p>
          ${glossarySection}
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
            <span style="color:#9ca3af;font-size:12px;">${new Date(n.publishedAt || Date.now()).toLocaleDateString('ko-KR')}</span>
            <a href="${n.url || '#'}" style="color:#4f46e5;text-decoration:none;font-size:12px;font-weight:600;">원문 보기 →</a>
          </div>
        </div>
      `;
    }).join('')
    return `
      <div style="margin-bottom:24px;">
        <h2 style="margin:0 0 12px 0;color:#111827;font-size:18px;">${tab}</h2>
        ${list || '<p style="color:#6b7280;font-size:14px;">수집된 뉴스가 없습니다.</p>'}
      </div>
    `
  }).join('')

  return `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>${today} 부동산 뉴스</title></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f3f4f6;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;">
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:28px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">📈 Ziply</h1>
          <p style="color:rgba(255,255,255,0.9);margin:8px 0 0 0;font-size:14px;">${today} 오늘의 주요 부동산 뉴스</p>
        </div>
        <div style="padding:24px;">
          ${sectionHtml}
          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0 0 12px 0;">이 뉴스레터는 매일 아침 7시에 발송됩니다.</p>
            <a href="${BASE_URL.replace(/\/$/, '')}/dashboard" style="color:#4f46e5;text-decoration:none;font-weight:600;">웹사이트 방문하기</a>
            <div style="margin-top:4px;">
              <a href="${BASE_URL.replace(/\/$/, '')}/api/newsletter/unsubscribe?email={{EMAIL}}&redirect=1" style="color:#cbd5e1;font-size:11px;text-decoration:underline;opacity:.6;">구독 취소</a>
            </div>
          </div>
        </div>
      </div>
    </body></html>
  `
}

// 실제 뉴스레터 발송 (그룹별 맞춤 뉴스 사용)
const sendRealNewsletter = async (email, html) => {
  try {
    const transporter = createTransporter()
    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `[Ziply] ${today} 오늘의 부동산 뉴스`,
      html,
    }
    const result = await (await transporter).sendMail(mailOptions)
    console.log('✅ 뉴스레터 발송 완료:', email)
    return result
  } catch (error) {
    console.error('❌ 뉴스레터 발송 실패:', error)
    throw error
  }
}

// 이메일 환경변수 사전 점검
function validateEmailEnv() {
  const required = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM']
  const missing = required.filter((k) => !process.env[k] || String(process.env[k]).trim() === '')
  if (missing.length > 0) {
    console.error('❌ 이메일 환경변수 누락:', missing.join(', '))
    return false
  }
  return true
}

// 모든 구독자에게 실제 뉴스레터 발송
const sendNewsletterToAllSubscribers = async () => {
  try {
    console.log('📰 실제 뉴스레터 발송 시작:', new Date().toLocaleString('ko-KR'))
    console.log('🌐 BASE_URL =', BASE_URL)

    if (!validateEmailEnv()) {
      console.error('메일 설정이 누락되어 발송을 중단합니다.')
      return
    }

    // 이메일 구독자 목록 가져오기
  const { data: emailSubscribers, error: emailError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true)

    if (emailError) {
      console.error('❌ 이메일 구독자 목록 조회 실패:', emailError)
      return
    }

    if (!emailSubscribers || emailSubscribers.length === 0) {
      console.log('📭 발송할 구독자가 없습니다. 먼저 뉴스레터 페이지에서 구독해주세요.')
      return
    }

    console.log(`📧 총 ${emailSubscribers.length}명의 구독자에게 뉴스레터 발송 중...`)

    // 탭별 뉴스 수집 (한 번만 수집 후 동일 콘텐츠 발송)
    const tabs = ['정책뉴스', '시장분석', '지원혜택', '초보자용', '신혼부부용', '투자자용']
    const byTab = {}
    for (const tab of tabs) {
      try {
        byTab[tab] = await fetchNewsByTab(tab)
      } catch (e) {
        console.error(`[뉴스 수집 실패] ${tab}:`, e)
        byTab[tab] = []
      }
    }
    // 수신자별로 구독취소 링크에 이메일을 삽입
    const baseHtml = buildNewsletterHtml(byTab)

    // 각 구독자에게 발송
    // 실제 메일 발송 수행 (is_active=true 대상자만)
    const results = await Promise.allSettled(
      emailSubscribers.map(subscriber => {
        const htmlForUser = baseHtml.replace(/\{\{EMAIL\}\}/g, subscriber.email)
        return sendRealNewsletter(subscriber.email, htmlForUser)
      })
    )

    // 결과 분석
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log(`✅ 성공: ${successful}건`)
    console.log(`❌ 실패: ${failed}건`)

    if (failed > 0) {
      console.log('실패한 이메일들:')
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.log(`  - ${emailSubscribers[index].email}: ${result.reason}`)
        }
      })
    }

    console.log('🎉 뉴스레터 발송 완료:', new Date().toLocaleString('ko-KR'))

  } catch (error) {
    console.error('❌ 테스트 뉴스레터 발송 중 오류 발생:', error)
  }
}

// 테스트용: 명령행 인수로 'test'가 전달되면 즉시 발송
if (process.argv.includes('test')) {
  sendNewsletterToAllSubscribers()
} else {
  // 매일 아침 7시에 뉴스레터 발송 (한국 시간 기준)
  const schedule = '0 22 * * *' // UTC 22:00 = 한국 시간 07:00

  console.log('📅 뉴스레터 스케줄러 시작')
  console.log(`⏰ 발송 시간: 매일 아침 7시 (한국 시간)`)
  console.log(`🔄 Cron 표현식: ${schedule}`)
  console.log('📧 발송 방식: 이메일 (실제 콘텐츠)')

  // 스케줄러 시작
  cron.schedule(schedule, sendNewsletterToAllSubscribers, {
    timezone: 'UTC'
  })

  console.log('🚀 뉴스레터 스케줄러가 실행 중입니다...')
  console.log('테스트(즉시 1회 발송)를 원하면: npm run cron test')
}
