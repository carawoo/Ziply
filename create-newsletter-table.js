const { createClient } = require('@supabase/supabase-js')

// Supabase 클라이언트 생성 (서비스 롤 키 사용)
const supabase = createClient(
  'https://tkpzvrokihqblkmtnrtx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrcHp2cm9raWhxYmxrbXRucnR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzY5NzYyMCwiZXhwIjoyMDQ5Mjc0NjIwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
)

async function createNewsletterTable() {
  try {
    console.log('뉴스레터 구독자 테이블 생성 중...')
    
    // 먼저 테이블이 존재하는지 확인
    const { data: testData, error: testError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .limit(1)
    
    if (testError && testError.code === 'PGRST205') {
      console.log('❌ 테이블이 존재하지 않습니다.')
      console.log('📋 Supabase 대시보드에서 다음 SQL을 실행해주세요:')
      console.log('')
      console.log('```sql')
      console.log('CREATE TABLE IF NOT EXISTS newsletter_subscribers (')
      console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,')
      console.log('  email TEXT UNIQUE NOT NULL,')
      console.log('  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(\'utc\'::text, now()) NOT NULL,')
      console.log('  is_active BOOLEAN DEFAULT true,')
      console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(\'utc\'::text, now()) NOT NULL')
      console.log(');')
      console.log('')
      console.log('ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;')
      console.log('')
      console.log('CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers')
      console.log('  FOR INSERT WITH CHECK (true);')
      console.log('')
      console.log('CREATE POLICY "Anyone can view newsletter subscribers" ON newsletter_subscribers')
      console.log('  FOR SELECT USING (true);')
      console.log('```')
      console.log('')
      console.log('🔗 Supabase 대시보드: https://supabase.com/dashboard/project/tkpzvrokihqblkmtnrtx')
      console.log('📝 SQL Editor에서 위 SQL을 실행하세요.')
    } else {
      console.log('✅ 뉴스레터 구독자 테이블이 이미 존재합니다!')
      
      // 테스트 데이터 삽입
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: 'test@example.com' }])
        .select()
      
      if (insertError && insertError.code === '23505') {
        console.log('✅ 테이블이 정상적으로 작동합니다! (중복 이메일 오류는 정상)')
      } else if (insertError) {
        console.log('❌ 테이블에 문제가 있습니다:', insertError)
      } else {
        console.log('✅ 테이블이 정상적으로 작동합니다!')
      }
    }
    
  } catch (error) {
    console.error('오류:', error)
  }
}

createNewsletterTable()
