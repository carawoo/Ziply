-- 뉴스레터 구독자 테이블 생성
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS 활성화
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 구독 가능 (인증 불필요)
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- 구독자 조회 정책 (관리자용)
CREATE POLICY "Anyone can view newsletter subscribers" ON newsletter_subscribers
  FOR SELECT USING (true);
