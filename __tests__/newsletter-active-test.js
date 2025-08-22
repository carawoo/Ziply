const { createClient } = require('@supabase/supabase-js')

// Supabase 클라이언트 생성 (서비스 롤 키 사용)
const supabase = createClient(
  'https://tkpzvrokihqblkmtnrtx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrcHp2cm9raWhxYmxrbXRucnR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDUzMzIxMCwiZXhwIjoyMDcwMTA5MjEwfQ.cc1hvK5xXKOX9C9is9WzfXFT0weNp2AkZFr8P8kIdjQ'
)

async function testNewsletterActiveStatus() {
  try {
    console.log('📊 뉴스레터 구독자 활성 상태 테스트 시작...')
    
    // 전체 구독자 조회
    const { data: allSubscribers, error: allError } = await supabase
      .from('newsletter_subscribers')
      .select('email, is_active, created_at')
      .order('created_at', { ascending: false })
    
    if (allError) {
      console.error('❌ 전체 구독자 조회 실패:', allError)
      return
    }
    
    console.log(`📧 전체 구독자 수: ${allSubscribers.length}명`)
    
    // 활성 구독자만 조회 (수정된 쿼리와 동일)
    const { data: activeSubscribers, error: activeError } = await supabase
      .from('newsletter_subscribers')
      .select('email, is_active, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (activeError) {
      console.error('❌ 활성 구독자 조회 실패:', activeError)
      return
    }
    
    console.log(`✅ 활성 구독자 수: ${activeSubscribers.length}명`)
    console.log(`❌ 비활성 구독자 수: ${allSubscribers.length - activeSubscribers.length}명`)
    
    // 구독자별 상태 출력
    console.log('\n📋 구독자별 상태:')
    allSubscribers.forEach((subscriber, index) => {
      const status = subscriber.is_active ? '✅ 활성' : '❌ 비활성'
      console.log(`${index + 1}. ${subscriber.email} - ${status}`)
    })
    
    // 특정 이메일 확인 (carawoo@medipal.co.kr)
    const targetEmail = 'carawoo@medipal.co.kr'
    const targetSubscriber = allSubscribers.find(s => s.email === targetEmail)
    
    if (targetSubscriber) {
      console.log(`\n🎯 대상 이메일 (${targetEmail}) 상태:`)
      console.log(`   - is_active: ${targetSubscriber.is_active}`)
      console.log(`   - 활성 구독자 목록에 포함: ${activeSubscribers.some(s => s.email === targetEmail)}`)
    } else {
      console.log(`\n❌ 대상 이메일 (${targetEmail})을 찾을 수 없습니다.`)
    }
    
    console.log('\n✅ 테스트 완료!')
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error)
  }
}

// 테스트 실행
testNewsletterActiveStatus()
