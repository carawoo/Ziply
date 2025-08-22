const { createClient } = require('@supabase/supabase-js')
const https = require('https')

// Supabase 클라이언트 생성 (서비스 롤 키 사용)
const supabase = createClient(
  'https://tkpzvrokihqblkmtnrtx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrcHp2cm9raWhxYmxrbXRucnR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDUzMzIxMCwiZXhwIjoyMDcwMTA5MjEwfQ.cc1hvK5xXKOX9C9is9WzfXFT0weNp2AkZFr8P8kIdjQ'
)

// fetch 함수 구현
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const data = options.body ? JSON.stringify(options.body) : null
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }
    
    if (data) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(data)
    }
    
    const req = https.request(requestOptions, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => Promise.resolve(JSON.parse(body))
        })
      })
    })
    
    req.on('error', reject)
    
    if (data) {
      req.write(data)
    }
    req.end()
  })
}

async function testNewsletterSendAPI() {
  try {
    console.log('📧 뉴스레터 발송 API 테스트 시작...')
    
    // 1. 현재 활성 구독자 수 확인
    const { data: activeSubscribers, error: activeError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true)
    
    if (activeError) {
      console.error('❌ 활성 구독자 조회 실패:', activeError)
      return
    }
    
    console.log(`📊 현재 활성 구독자 수: ${activeSubscribers.length}명`)
    
    if (activeSubscribers.length === 0) {
      console.log('⚠️ 활성 구독자가 없어서 테스트를 건너뜁니다.')
      return
    }
    
    // 2. 뉴스레터 발송 API 호출 (dry run)
    console.log('\n🚀 뉴스레터 발송 API 호출 (dry run)...')
    
    const baseUrl = process.env.APP_BASE_URL || 'https://ziply-nine.vercel.app'
    const testUrl = `${baseUrl}/api/cron/daily-newsletter?dry=1&force=1`
    
    console.log(`📡 API URL: ${testUrl}`)
    
    const response = await fetch(testUrl)
    const result = await response.json()
    
    console.log('📋 API 응답:')
    console.log(JSON.stringify(result, null, 2))
    
    if (result.ok) {
      console.log('✅ API 호출 성공!')
      console.log(`📧 예상 발송 대상: ${result.total}명`)
      
      // 3. 실제 발송 테스트 (특정 이메일로)
      const testEmail = activeSubscribers[0].email
      console.log(`\n🎯 실제 발송 테스트 (${testEmail})...`)
      
      const realTestUrl = `${baseUrl}/api/cron/daily-newsletter?to=${testEmail}&force=1`
      console.log(`📡 실제 테스트 URL: ${realTestUrl}`)
      
      const realResponse = await fetch(realTestUrl)
      const realResult = await realResponse.json()
      
      console.log('📋 실제 발송 결과:')
      console.log(JSON.stringify(realResult, null, 2))
      
      if (realResult.ok && realResult.sent > 0) {
        console.log('✅ 실제 발송 성공!')
      } else {
        console.log('❌ 실제 발송 실패 또는 발송된 메일 없음')
      }
    } else {
      console.log('❌ API 호출 실패!')
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error)
  }
}

// 테스트 실행
testNewsletterSendAPI()
