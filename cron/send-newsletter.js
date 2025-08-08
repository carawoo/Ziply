require('dotenv').config({ path: '.env' })
const cron = require('node-cron')
const { createClient } = require('@supabase/supabase-js')
const nodemailer = require('nodemailer')

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// 이메일 전송기 설정
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

// 테스트 이메일 발송
const sendTestEmail = async (email) => {
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
        <p>발송 시간: ${new Date().toLocaleString('ko-KR')}</p>
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('✅ 테스트 이메일 발송 완료:', email)
    return result

  } catch (error) {
    console.error('❌ 테스트 이메일 발송 실패:', error)
    throw error
  }
}

// 모든 구독자에게 테스트 이메일 발송
const sendTestNewsletterToAllSubscribers = async () => {
  try {
    console.log('🧪 테스트 뉴스레터 발송 시작:', new Date().toLocaleString('ko-KR'))

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

    console.log(`📧 총 ${emailSubscribers.length}명의 구독자에게 테스트 이메일 발송 중...`)

    // 각 구독자에게 테스트 이메일 발송
    const results = await Promise.allSettled(
      emailSubscribers.map(subscriber => sendTestEmail(subscriber.email))
    )

    // 결과 분석
    const successful = results.filter(result => result.status === 'fulfilled').length
    const failed = results.filter(result => result.status === 'rejected').length

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

    console.log('🎉 테스트 뉴스레터 발송 완료:', new Date().toLocaleString('ko-KR'))

  } catch (error) {
    console.error('❌ 테스트 뉴스레터 발송 중 오류 발생:', error)
  }
}

// 테스트용: 명령행 인수로 'test'가 전달되면 즉시 발송
if (process.argv.includes('test')) {
  sendTestNewsletterToAllSubscribers()
} else {
  // 매일 아침 7시에 뉴스레터 발송 (한국 시간 기준)
  const schedule = '0 22 * * *' // UTC 22:00 = 한국 시간 07:00

  console.log('📅 뉴스레터 스케줄러 시작')
  console.log(`⏰ 발송 시간: 매일 아침 7시 (한국 시간)`)
  console.log(`🔄 Cron 표현식: ${schedule}`)
  console.log('📧 발송 방식: 이메일')

  // 스케줄러 시작
  cron.schedule(schedule, sendTestNewsletterToAllSubscribers, {
    timezone: 'UTC'
  })

  console.log('🚀 뉴스레터 스케줄러가 실행 중입니다...')
  console.log('테스트 발송을 원하면: npm run cron test')
}
