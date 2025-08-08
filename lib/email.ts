import nodemailer from 'nodemailer'
import { getSampleNews, summarizeNews } from './ai'

// 이메일 전송기 설정
const createTransporter = () => {
  return nodemailer.createTransport({
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

// 구독 완료 알림 이메일 발송
export const sendSubscriptionConfirmation = async (email: string) => {
  try {
    const transporter = createTransporter()
    const htmlContent = createSubscriptionConfirmationHTML(email)
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '[부동산 뉴스 큐레이터] 뉴스레터 구독 완료 🎉',
      html: htmlContent,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`구독 완료 알림 발송 성공: ${email}`)
    return result

  } catch (error) {
    console.error(`구독 완료 알림 발송 실패 (${email}):`, error)
    throw error
  }
}

// 뉴스레터 HTML 템플릿 생성
const createNewsletterHTML = (newsItems: any[], date: string) => {
  const newsHTML = newsItems.map(item => `
    <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px;">
        <a href="${item.url}" style="color: #4f46e5; text-decoration: none;">${item.title}</a>
      </h3>
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
        ${item.summary || item.content.substring(0, 150)}...
      </p>
      <div style="font-size: 12px; color: #9ca3af;">
        📅 ${item.publishedAt} | 📂 ${item.category}
      </div>
    </div>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>부동산 뉴스 큐레이터 - ${date}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <!-- 헤더 -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
            부동산 뉴스 큐레이터 📈
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
            ${date} 오늘의 부동산 뉴스
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

// 뉴스레터 발송 함수
export const sendNewsletter = async (email: string) => {
  try {
    // 오늘의 뉴스 가져오기
    const todayNews = await getSampleNews() // 모든 카테고리의 뉴스 가져오기
    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // 뉴스 요약 생성
    const newsWithSummaries = await Promise.all(
      todayNews.map(async (news) => {
        const summary = await summarizeNews(news.content, news.category)
        return { ...news, summary }
      })
    )

    // 이메일 HTML 생성
    const htmlContent = createNewsletterHTML(newsWithSummaries, today)

    // 이메일 전송
    const transporter = createTransporter()
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

// 테스트 이메일 발송
export const sendTestEmail = async (email: string) => {
  try {
    const transporter = createTransporter()
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
