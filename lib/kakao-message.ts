// 카카오 비즈니스 메시지 발송 기능
// 참고: 실제 사용 시 카카오 비즈니스 계정과 API 키가 필요합니다

interface KakaoMessageOptions {
  templateId: string
  variables?: Record<string, string>
  buttons?: Array<{
    name: string
    type: string
    url?: string
  }>
}

// 카카오 비즈니스 메시지 발송
export const sendKakaoMessage = async (
  kakaoId: string, 
  options: KakaoMessageOptions
) => {
  try {
    const response = await fetch('https://api.solapi.com/messages/v4/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KAKAO_BUSINESS_API_KEY}`
      },
      body: JSON.stringify({
        message: {
          to: kakaoId,
          from: process.env.KAKAO_SENDER_NUMBER,
          kakaoOptions: {
            pfId: process.env.KAKAO_PFID,
            templateId: options.templateId,
            variables: options.variables,
            buttons: options.buttons
          }
        }
      })
    })

    if (!response.ok) {
      throw new Error(`카카오 메시지 발송 실패: ${response.status}`)
    }

    const result = await response.json()
    console.log('카카오 메시지 발송 성공:', result)
    return result

  } catch (error) {
    console.error('카카오 메시지 발송 오류:', error)
    throw error
  }
}

// 뉴스레터용 카카오 메시지 발송
export const sendKakaoNewsletter = async (
  kakaoId: string, 
  newsItems: any[], 
  date: string
) => {
  const newsSummary = newsItems
    .slice(0, 3) // 최대 3개 뉴스만
    .map(item => `• ${item.title}`)
    .join('\n')

  const variables = {
    date: date,
    news_count: newsItems.length.toString(),
    news_summary: newsSummary,
    website_url: 'https://your-app.vercel.app'
  }

  const buttons = [
    {
      name: '웹사이트 방문',
      type: 'WL',
      url: 'https://your-app.vercel.app'
    }
  ]

  return sendKakaoMessage(kakaoId, {
    templateId: 'newsletter_template', // 카카오에서 승인받은 템플릿 ID
    variables,
    buttons
  })
}

// 카카오 로그인 사용자 정보에서 카카오톡 ID 추출
export const extractKakaoId = (user: any): string | null => {
  try {
    // Supabase 카카오 로그인 사용자 정보에서 카카오톡 ID 추출
    if (user?.identities && user.identities.length > 0) {
      const kakaoIdentity = user.identities.find(
        (identity: any) => identity.provider === 'kakao'
      )
      return kakaoIdentity?.id || null
    }
    return null
  } catch (error) {
    console.error('카카오 ID 추출 오류:', error)
    return null
  }
}

// 카카오 비즈니스 메시지 설정 확인
export const checkKakaoMessageSetup = () => {
  const requiredEnvVars = [
    'KAKAO_BUSINESS_API_KEY',
    'KAKAO_SENDER_NUMBER', 
    'KAKAO_PFID'
  ]

  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  )

  if (missingVars.length > 0) {
    console.warn('카카오 메시지 발송을 위한 환경변수가 설정되지 않았습니다:', missingVars)
    return false
  }

  return true
}
