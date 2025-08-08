# Supabase 뉴스레터 테이블 생성 가이드

## 문제
뉴스레터 구독 시 "Could not find the table 'public.newsletter_subscribers'" 오류가 발생합니다.

## 해결 방법

### 1. Supabase 대시보드 접속
1. https://supabase.com/dashboard/project/tkpzvrokihqblkmtnrtx 접속
2. 로그인 후 프로젝트 선택

### 2. SQL Editor 열기
1. 왼쪽 메뉴에서 "SQL Editor" 클릭
2. "New query" 버튼 클릭

### 3. SQL 실행
다음 SQL을 복사해서 붙여넣기 후 "Run" 버튼 클릭:

```sql
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
```

### 4. 확인
1. "Tables" 메뉴에서 `newsletter_subscribers` 테이블이 생성되었는지 확인
2. 뉴스레터 페이지에서 구독 테스트

## 완료 후
- 뉴스레터 구독이 정상적으로 작동합니다
- 이메일 주소가 데이터베이스에 저장됩니다
- 중복 구독은 자동으로 방지됩니다

## 문제가 계속되면
1. SQL 실행 후 오류 메시지 확인
2. 테이블이 생성되었는지 "Tables" 메뉴에서 확인
3. RLS 정책이 올바르게 설정되었는지 확인
