// 카카오톡 채널 메시지 발송 기능
// 사용자가 채널을 추가해야 하는 무료 서비스

interface KakaoChannelMessage {
  text: string
  buttons?: Array<{
    title: string
    link: string
  }>
}

// 카카오톡 채널 메시지 발송
export const sendKakaoChannelMessage = async (
  channelId: string,
  message: KakaoChannelMessage
) => {
  try {
    const response = await fetch(`https://kapi.kakao.com/v1/api/talk/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KAKAO_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        text: message.text,
        buttons: message.buttons
      })
    })

    if (!response.ok) {
      throw new Error(`카카오 채널 메시지 발송 실패: ${response.status}`)
    }

    const result = await response.json()
    console.log('카카오 채널 메시지 발송 성공:', result)
    return result

  } catch (error) {
    console.error('카카오 채널 메시지 발송 오류:', error)
    throw error
  }
}

// 뉴스레터용 카카오 채널 메시지 생성
export const createKakaoChannelNewsletter = (
  newsItems: any[], 
  date: string
): KakaoChannelMessage => {
  const newsSummary = newsItems
    .slice(0, 3) // 최대 3개 뉴스만
    .map(item => `• ${item.title}`)
    .join('\n')

  const text = `📈 ${date} 오늘의 부동산 뉴스

${newsSummary}

총 ${newsItems.length}개의 뉴스가 도착했습니다!

매일 아침 7시에 맞춤형 부동산 뉴스를 받아보세요! 🏠`

  const buttons = [
    {
      title: '웹사이트 방문',
      link: 'https://ziply-nine.vercel.app'
    },
    {
      title: '대시보드 보기',
      link: 'https://ziply-nine.vercel.app/dashboard'
    }
  ]

  return {
    text,
    buttons
  }
}

// 카카오 채널 설정 확인
export const checkKakaoChannelSetup = () => {
  const requiredEnvVars = [
    'KAKAO_CHANNEL_ACCESS_TOKEN',
    'KAKAO_CHANNEL_ID'
  ]

  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  )

  if (missingVars.length > 0) {
    console.warn('카카오 채널 메시지 발송을 위한 환경변수가 설정되지 않았습니다:', missingVars)
    return false
  }

  return true
}

// 카카오 채널 구독자 수 확인
export const getKakaoChannelSubscribers = async () => {
  try {
    const response = await fetch(`https://kapi.kakao.com/v1/api/talk/channels/${process.env.KAKAO_CHANNEL_ID}/subscribers`, {
      headers: {
        'Authorization': `Bearer ${process.env.KAKAO_CHANNEL_ACCESS_TOKEN}`
      }
    })

    if (!response.ok) {
      throw new Error(`채널 구독자 조회 실패: ${response.status}`)
    }

    const result = await response.json()
    return result.subscribers || []

  } catch (error) {
    console.error('카카오 채널 구독자 조회 오류:', error)
    return []
  }
}
