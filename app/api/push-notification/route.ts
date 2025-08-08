import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// VAPID 키 설정
webpush.setVapidDetails(
  'mailto:ziply2025@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// 푸시 알림 발송
export async function POST(request: NextRequest) {
  try {
    const { subscription, title, body, data } = await request.json()
    
    if (!subscription) {
      return NextResponse.json(
        { error: '구독 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    const payload = JSON.stringify({
      title: title || '부동산 뉴스 큐레이터',
      body: body || '새로운 뉴스가 도착했습니다!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: data || {
        url: 'https://ziply-nine.vercel.app/dashboard'
      }
    })

    const result = await webpush.sendNotification(subscription, payload)
    
    return NextResponse.json({ 
      success: true, 
      message: '푸시 알림이 발송되었습니다.',
      statusCode: result.statusCode
    })
  } catch (error) {
    console.error('푸시 알림 발송 오류:', error)
    return NextResponse.json(
      { error: '푸시 알림 발송 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 구독 정보 저장
export async function PUT(request: NextRequest) {
  try {
    const { subscription } = await request.json()
    
    if (!subscription) {
      return NextResponse.json(
        { error: '구독 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    // 여기서 구독 정보를 데이터베이스에 저장할 수 있습니다
    // 현재는 간단히 성공 응답만 반환
    console.log('푸시 알림 구독 정보 저장:', subscription)
    
    return NextResponse.json({ 
      success: true, 
      message: '푸시 알림 구독이 완료되었습니다.' 
    })
  } catch (error) {
    console.error('푸시 알림 구독 오류:', error)
    return NextResponse.json(
      { error: '푸시 알림 구독 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
