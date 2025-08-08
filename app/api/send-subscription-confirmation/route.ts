import { NextRequest, NextResponse } from 'next/server'
import { sendSubscriptionConfirmation } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: '올바른 이메일 주소가 필요합니다.' },
        { status: 400 }
      )
    }

    // 구독 완료 알림 이메일 발송
    await sendSubscriptionConfirmation(email)
    
    return NextResponse.json({ 
      success: true, 
      message: '구독 완료 알림 이메일이 발송되었습니다.' 
    })
  } catch (error) {
    console.error('구독 완료 알림 발송 오류:', error)
    return NextResponse.json(
      { error: '이메일 발송 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
