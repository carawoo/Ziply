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
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>뉴스레터 구독 완료 - 부동산 뉴스 큐레이터</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <!-- 헤더 -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
            🎉 구독 완료!
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
            부동산 뉴스 큐레이터 뉴스레터 구독이 완료되었습니다
          </p>
        </div>

        <!-- 메인 콘텐츠 -->
        <div style="padding: 32px;">
          <div style="margin-bottom: 24px;">
            <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 22px;">
              환영합니다! 👋
            </h2>
            <p style="color: #6b7280; margin: 0 0 16px 0; line-height: 1.6;">
              <strong>${email}</strong>님, 부동산 뉴스 큐레이터 뉴스레터 구독이 성공적으로 완료되었습니다.
            </p>
            <p style="color: #6b7280; margin: 0; line-height: 1.6;">
              이제 매일 아침 7시에 맞춤형 부동산 뉴스 요약을 받아보실 수 있습니다.
            </p>
          </div>

          <!-- 뉴스레터 내용 안내 -->
          <div style="background: #f3f4f6; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">
              📰 뉴스레터에서 받을 수 있는 내용
            </h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>일일 시장 동향 및 분석</li>
              <li>부동산 정책 변화 알림</li>
              <li>투자 인사이트 및 전망</li>
              <li>지역별 부동산 뉴스</li>
            </ul>
          </div>

          <!-- 발송 시간 안내 -->
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="color: #1e40af; margin: 0 0 8px 0; font-size: 16px;">
              ⏰ 발송 시간
            </h3>
            <p style="color: #1e40af; margin: 0; font-size: 14px;">
              매일 아침 7시 (한국 시간)에 발송됩니다.
            </p>
          </div>

          <!-- 액션 버튼 -->
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://ziply-nine.vercel.app/dashboard" 
               style="display: inline-block; background: #4f46e5; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              대시보드 방문하기
            </a>
          </div>

          <!-- 푸터 -->
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0 0 16px 0;">
              구독 해지가 필요하시면 언제든지 연락주세요.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2024 부동산 뉴스 큐레이터. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
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
      subject: '[부동산 뉴스 큐레이터] 뉴스레터 구독 완료',
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
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${date} 부동산 뉴스 - 부동산 뉴스 큐레이터</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <!-- 헤더 -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
            📈 부동산 뉴스 큐레이터
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
            ${date} 오늘의 주요 부동산 뉴스
          </p>
        </div>

        <!-- 메인 콘텐츠 -->
        <div style="padding: 32px;">
          <div style="margin-bottom: 24px;">
            <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 22px;">
              오늘의 주요 부동산 뉴스
            </h2>
            <p style="color: #6b7280; margin: 0; line-height: 1.6;">
              매일 아침 7시, 맞춤형 부동산 뉴스 요약을 받아보세요.
            </p>
          </div>

          <!-- 뉴스 목록 -->
          ${newsHTML}

          <!-- 푸터 -->
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0 0 16px 0;">
              이 뉴스레터는 매일 아침 7시에 발송됩니다.
            </p>
            <div style="margin-bottom: 16px;">
              <a href="https://ziply-nine.vercel.app" style="color: #4f46e5; text-decoration: none; font-weight: 600;">
                웹사이트 방문하기
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              구독 해지하려면 <a href="mailto:unsubscribe@your-domain.com" style="color: #4f46e5;">여기</a>를 클릭하세요.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
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

    // 이메일 HTML 생성
    const htmlContent = createNewsletterHTML(newsWithSummaries, today)

    // 이메일 전송
    const transporter = await createTransporter()
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `[부동산 뉴스 큐레이터] ${today} 오늘의 부동산 뉴스`,
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
      subject: '[테스트] 부동산 뉴스 큐레이터 이메일 설정 확인',
      html: `
        <h1>이메일 설정이 정상적으로 작동합니다! 🎉</h1>
        <p>부동산 뉴스 큐레이터의 이메일 발송 기능이 정상적으로 설정되었습니다.</p>
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
