# 부동산 뉴스 큐레이터

매일 아침 7시, 맞춤형 부동산 뉴스 요약을 이메일과 카카오톡으로 받아보세요!

## 📱 뉴스레터 발송 방식

### 1. 이메일 발송 (기본)
- **비용**: 무료 (Gmail SMTP 사용 시)
- **설정**: Gmail 앱 비밀번호 필요
- **장점**: 안정적이고 신뢰성 높음

### 2. 카카오톡 메시지 발송 (유료)
- **비용**: 메시지당 약 3.3원
- **필요 정보**:
  - 카카오 비즈니스 계정
  - 카카오 비즈니스 API 키
  - 메시지 템플릿 승인
- **설정 방법**:
  1. [카카오 비즈니스](https://business.kakao.com) 가입
  2. 비즈니스 계정 인증
  3. 메시지 템플릿 등록 및 승인
  4. API 키 발급

### 3. 웹 푸시 알림 (무료)
- **비용**: 무료
- **특징**: 사용자가 웹사이트를 방문할 때만 표시
- **설정**: 브라우저 권한만 필요

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env.local` 파일을 생성하고 다음 정보를 입력:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI API 키 (선택사항)
OPENAI_API_KEY=your_openai_api_key
# 또는
GEMINI_API_KEY=your_gemini_api_key

# 카카오 로그인
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id

# 이메일 발송 (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

# 카카오 비즈니스 메시지 (유료)
KAKAO_BUSINESS_API_KEY=your_kakao_business_api_key
KAKAO_SENDER_NUMBER=your_sender_number
KAKAO_PFID=your_pfid
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 뉴스레터 스케줄러 실행
```bash
# 백그라운드에서 실행
npm run cron

# 테스트 발송
npm run cron test
```

## 💰 비용 분석

### 카카오 비즈니스 메시지 비용
- **초기 설정**: 무료
- **메시지당 비용**: 약 3.3원
- **월 100명 구독자 기준**: 약 3,300원/월
- **월 1,000명 구독자 기준**: 약 33,000원/월

### 대안 비교
| 방식 | 비용 | 도달률 | 설정 난이도 |
|------|------|--------|-------------|
| 이메일 | 무료 | 높음 | 쉬움 |
| 카카오톡 | 유료 | 매우 높음 | 어려움 |
| 웹 푸시 | 무료 | 낮음 | 쉬움 |

## 🔧 고급 설정

### 카카오 비즈니스 메시지 설정

1. **카카오 비즈니스 계정 생성**
   - [카카오 비즈니스](https://business.kakao.com) 접속
   - 사업자 인증 완료
   - 비즈니스 계정 승인 대기

2. **메시지 템플릿 등록**
   ```json
   {
     "templateId": "newsletter_template",
     "content": "📈 {{date}} 오늘의 부동산 뉴스\n\n{{news_summary}}\n\n총 {{news_count}}개의 뉴스가 도착했습니다!",
     "buttons": [
       {
         "name": "웹사이트 방문",
         "type": "WL",
         "url": "https://your-app.vercel.app"
       }
     ]
   }
   ```

3. **API 키 발급**
   - 비즈니스 대시보드에서 API 키 생성
   - 발신번호 등록
   - PFID 확인

### 웹 푸시 알림 설정

1. **VAPID 키 생성**
   ```bash
   npx web-push generate-vapid-keys
   ```

2. **환경변수 추가**
   ```env
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key
   ```

## 📊 모니터링

### 발송 통계 확인
```bash
# 실시간 로그 확인
npm run cron

# 발송 결과 확인
tail -f logs/newsletter.log
```

### 성공률 모니터링
- 이메일: Gmail 발송 통계
- 카카오톡: 비즈니스 대시보드
- 웹 푸시: 브라우저 개발자 도구

## 🛠️ 문제 해결

### 이메일 발송 실패
- Gmail 앱 비밀번호 확인
- SMTP 설정 재확인
- 발송 한도 확인

### 카카오톡 발송 실패
- 비즈니스 계정 승인 상태 확인
- 메시지 템플릿 승인 상태 확인
- API 키 유효성 확인

### 웹 푸시 알림 안됨
- 브라우저 권한 확인
- HTTPS 설정 확인
- Service Worker 등록 확인

## 📈 성능 최적화

### 발송 최적화
- 배치 발송으로 API 호출 최소화
- 재시도 로직 구현
- 실패한 발송 건별 관리

### 비용 최적화
- 카카오톡 메시지는 중요 뉴스만 발송
- 이메일과 웹 푸시 조합 사용
- 구독자 활성도에 따른 발송 분기

## 🔒 보안 고려사항

- API 키는 환경변수로 관리
- 사용자 개인정보 암호화
- 발송 로그 보안 관리
- GDPR 준수

## 📞 지원

문제가 발생하면 다음을 확인해주세요:
1. 환경변수 설정
2. API 키 유효성
3. 네트워크 연결
4. 서비스 상태

---

**참고**: 카카오 비즈니스 메시지는 유료 서비스입니다. 실제 사용 전에 비용을 고려해주세요.
