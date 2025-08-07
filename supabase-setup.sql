-- 뉴스레터 구독자 테이블 생성
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 선호도 테이블 생성
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 뉴스레터 구독자 테이블 정책 (누구나 삽입 가능, 조회는 불가)
CREATE POLICY "Anyone can subscribe to newsletter" 
ON newsletter_subscribers FOR INSERT 
WITH CHECK (true);

-- 사용자 선호도 테이블 정책 (자신의 데이터만 조회/수정 가능)
CREATE POLICY "Users can view own preferences" 
ON user_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" 
ON user_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" 
ON user_preferences FOR UPDATE 
USING (auth.uid() = user_id);
