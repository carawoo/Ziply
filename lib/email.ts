// 이메일 전송기 설정 (서버 사이드 전용)
const createTransporter = async () => {
  // 서버 사이드에서만 nodemailer import
  const nodemailer = await import('nodemailer')
  
  return nodemailer.default.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

// 구독 완료 알림 이메일 HTML 생성
const createSubscriptionConfirmationHTML = (email: string) => {
  // Toss-like Ziply email design (soft, modern, rounded, primary blue)
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>뉴스레터 구독 완료 - Ziply</title>
    </head>
    <body style="margin:0;padding:24px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tr>
          <td align="center">
            <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 20px rgba(0,0,0,0.06);">
              <tr>
                <td align="center" style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);padding:32px;">
                  <div style="color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.02em;">🎉 구독 완료!</div>
                  <div style="color:rgba(255,255,255,0.9);margin-top:8px;font-size:16px;">Ziply 뉴스레터 구독이 완료되었습니다</div>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <h2 style="margin:0 0 12px 0;color:#111827;font-size:22px;">환영합니다! 👋</h2>
                  <p style="margin:0 0 12px 0;color:#4b5563;line-height:1.7;">
                    <strong>${email}</strong>님, Ziply 뉴스레터 구독이 성공적으로 완료되었습니다.
                  </p>
                  <p style="margin:0;color:#4b5563;line-height:1.7;">이제 매일 아침 7시에 맞춤형 부동산 뉴스 요약을 받아보실 수 있습니다.</p>

                  <div style="margin:24px 0;padding:20px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc;">
                    <div style="color:#111827;font-weight:700;margin-bottom:8px;">📰 뉴스레터에서 받을 수 있는 내용</div>
                    <ul style="margin:0;padding-left:18px;color:#6b7280;line-height:1.7;">
                      <li>일일 시장 동향 및 분석</li>
                      <li>부동산 정책 변화 알림</li>
                      <li>투자 인사이트 및 전망</li>
                      <li>지역별 부동산 뉴스</li>
                    </ul>
                  </div>

                  <div style="margin:0 0 24px 0;padding:16px;border:1px solid #bfdbfe;border-radius:12px;background:#eff6ff;">
                    <div style="color:#1e40af;font-weight:700;margin-bottom:6px;font-size:15px;">⏰ 발송 시간</div>
                    <div style="color:#1e40af;font-size:14px;">매일 아침 7시 (한국 시간)에 발송됩니다.</div>
                  </div>

                  <div style="text-align:center;margin:0 0 8px 0;">
                    <a href="https://ziply-nine.vercel.app/dashboard" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:700;">대시보드 방문하기</a>
                  </div>
                </td>
              </tr>
            </table>

            <div style="max-width:640px;margin:12px auto 0 auto;text-align:center;color:#9ca3af;font-size:12px;line-height:1.6;">
              © 2024 Ziply. All rights reserved.
            </div>
          </td>
        </tr>
      </table>
    </body>
  </html>`
}

// 구독 완료 알림 이메일 발송 (서버 사이드 전용)
export const sendSubscriptionConfirmation = async (email: string) => {
  // 서버 사이드에서만 실행
  if (typeof window !== 'undefined') {
    console.warn('sendSubscriptionConfirmation은 서버 사이드에서만 실행되어야 합니다.')
    return null
  }

  try {
    const transporter = await createTransporter()
    const htmlContent = createSubscriptionConfirmationHTML(email)
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '[Ziply] 뉴스레터 구독 완료',
      html: htmlContent,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`구독 완료 이메일 발송: ${email}`)
    return result

  } catch (error) {
    console.error(`구독 완료 이메일 발송 실패 (${email}):`, error)
    throw error
  }
}

// 뉴스레터 HTML 생성
const createNewsletterHTML = (newsItems: any[], date: string) => {
  const newsHTML = newsItems.map((news, index) => `
    <div style="margin-bottom: 24px; padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #4f46e5;">
      <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">
        ${index === 0 ? '🔥' : index === 1 ? '📈' : index === 2 ? '💡' : '🎯'} ${news.title}
      </h3>
      <p style="margin: 0 0 12px 0; color: #6b7280; line-height: 1.6; font-size: 14px;">
        ${news.summary || news.content}
      </p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #9ca3af; font-size: 12px;">
          ${new Date(news.publishedAt).toLocaleDateString('ko-KR')}
        </span>
        <a href="${news.url || '#'}" 
           style="color: #4f46e5; text-decoration: none; font-size: 12px; font-weight: 600;">
          원문 보기 →
        </a>
      </div>
    </div>
  `).join('')

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${date} 부동산 뉴스 - Ziply</title>
    </head>
    <body style="margin:0;padding:24px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tr>
          <td align="center">
            <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 20px rgba(0,0,0,0.06);">
              <tr>
                <td align="center" style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);padding:28px;">
                  <div style="color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.02em;">📈 Ziply</div>
                  <div style="color:rgba(255,255,255,0.9);margin-top:8px;font-size:14px;">${date} 오늘의 주요 부동산 뉴스</div>
                </td>
              </tr>
              <tr>
                <td style="padding:28px;">
                  <h2 style="margin:0 0 12px 0;color:#111827;font-size:20px;">오늘의 주요 부동산 뉴스</h2>
                  <p style="margin:0 0 16px 0;color:#6b7280;line-height:1.7;">매일 아침 7시, 맞춤형 부동산 뉴스 요약을 받아보세요.</p>
                  ${newsHTML}

                  <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;">
                    <div style="color:#9ca3af;font-size:12px;margin:0 0 12px 0;">이 뉴스레터는 매일 아침 7시에 발송됩니다.</div>
                    <div style="margin-bottom:8px;">
                      <a href="https://ziply-nine.vercel.app/dashboard" style="color:#2563eb;text-decoration:none;font-weight:700;">웹사이트 방문하기</a>
                    </div>
                    <div style="margin-top:4px;">
                      <a href="${('https://ziply-nine.vercel.app').replace(/\\\/$/, '')}/api/newsletter/unsubscribe?email={{EMAIL}}&redirect=1" style="color:#cbd5e1;font-size:11px;text-decoration:underline;opacity:0.6;">구독 취소</a>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`
}

// 뉴스레터 발송 함수 (서버 사이드 전용)
export const sendNewsletter = async (email: string) => {
  // 서버 사이드에서만 실행
  if (typeof window !== 'undefined') {
    console.warn('sendNewsletter는 서버 사이드에서만 실행되어야 합니다.')
    return null
  }

  try {
    // 동적 import로 서버 사이드에서만 실행
    const { fetchNewsByTab, summarizeNews } = await import('./ai')

    // 오늘 날짜 문자열 생성
    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // 그룹/탭별 맞춤 뉴스 수집 (현 개발 파이프라인 유지)
    const tabs = ['정책뉴스', '시장분석', '지원혜택', '초보자용', '신혼부부용', '투자자용']
    const collected: any[] = []

    for (const tab of tabs) {
      try {
        const items = await fetchNewsByTab(tab)
        // 섹션당 최대 4개, 섹션 정보가 드러나도록 제목에 탭 라벨 프리픽스
        const topItems = items.slice(0, 4).map((n) => ({
          ...n,
          title: `${tab} | ${n.title}`
        }))
        collected.push(...topItems)
      } catch (e) {
        console.error(`[sendNewsletter] ${tab} 수집 실패:`, e)
      }
    }

    // 요약 본문 준비 (요약 키가 없으면 생성)
    const newsWithSummaries = await Promise.all(
      collected.map(async (news) => {
        if (news.summary && news.summary.trim().length > 0) return news
        const summary = await summarizeNews(news.content || '', news.category || '정책뉴스')
        return { ...news, summary }
      })
    )

    // 이메일 HTML 생성 (구독 취소 링크에 수신자 이메일 삽입)
    let htmlContent = createNewsletterHTML(newsWithSummaries, today)
    htmlContent = htmlContent.replace(/\{\{EMAIL\}\}/g, email)

    // 이메일 전송
    const transporter = await createTransporter()
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `[Ziply] ${today} 오늘의 부동산 뉴스`,
      html: htmlContent,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`뉴스레터 발송 완료: ${email}`)
    return result

  } catch (error) {
    console.error(`뉴스레터 발송 실패 (${email}):`, error)
    throw error
  }
}

// 테스트 이메일 발송 (서버 사이드 전용)
export const sendTestEmail = async (email: string) => {
  // 서버 사이드에서만 실행
  if (typeof window !== 'undefined') {
    console.warn('sendTestEmail은 서버 사이드에서만 실행되어야 합니다.')
    return null
  }

  try {
    const transporter = await createTransporter()
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '[테스트] Ziply 이메일 설정 확인',
      html: `
        <h1>이메일 설정이 정상적으로 작동합니다! 🎉</h1>
        <p>Ziply의 이메일 발송 기능이 정상적으로 설정되었습니다.</p>
        <p>매일 아침 7시에 뉴스레터를 받아보실 수 있습니다.</p>
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('테스트 이메일 발송 완료')
    return result

  } catch (error) {
    console.error('테스트 이메일 발송 실패:', error)
    throw error
  }
}
