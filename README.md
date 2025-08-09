# 부동산 뉴스 큐레이터

부동산 뉴스 큐레이터는 사용자 그룹별로 맞춤형 부동산 뉴스를 제공하는 웹 애플리케이션입니다.

## 🚀 실배포 가이드

### 1. Vercel 배포 준비

1. **Vercel 계정 생성**
   - [Vercel](https://vercel.com)에 가입
   - GitHub 계정으로 로그인 권장

2. **프로젝트 연결**
   ```bash
   # Vercel CLI 설치
   npm install -g vercel
   
   # 로그인
   vercel login
   
   # 프로젝트 배포
   vercel
   ```

### 2. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수들을 설정하세요:

#### 필수 환경 변수
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### AI API 키 (선택사항)
```
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
```

#### 네이버 뉴스 API (선택사항)
```
NAVER_CLIENT_ID=ceVPKnFABx59Lo4SzbmY
NAVER_CLIENT_SECRET=FUfJ_TnwL6
```

#### 이메일 설정 (뉴스레터용)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
```

### 3. 배포 후 설정

1. **도메인 설정**: Vercel에서 제공하는 도메인 또는 커스텀 도메인 사용
2. **SSL 인증서**: Vercel에서 자동으로 제공
3. **CDN**: 전 세계 CDN으로 빠른 로딩

### 4. 배포 확인

배포가 완료되면 다음을 확인하세요:
- [ ] 메인 페이지 로딩
- [ ] 사용자 그룹 선택
- [ ] 뉴스 리스트 표시
- [ ] 뉴스레터 구독 기능

## 📋 기존 기능

### 사용자 그룹별 맞춤 뉴스
- **초보자**: 부동산 기초 정보와 쉬운 설명
- **신혼부부·초년생**: 내 집 마련 관련 실용 정보
- **투자자**: 시장 분석과 투자 인사이트

### 뉴스레터 구독
- 매일 아침 맞춤 뉴스 발송
- 이메일, 카카오톡, 웹 푸시 알림 지원

### 실시간 뉴스
- 네이버 뉴스 API 연동
- AI 요약 기능
- 카테고리별 필터링

## 🛠 기술 스택

- **Frontend**: Next.js 13, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Email**: Nodemailer
- **Push Notifications**: Web Push API

## 📁 프로젝트 구조

```
SP/
├── app/                    # Next.js 13 App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # 대시보드 페이지
│   ├── newsletter/        # 뉴스레터 페이지
│   └── layout.tsx         # 루트 레이아웃
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 함수
├── cron/                  # 스케줄링 작업
└── public/                # 정적 파일
```

## 🔧 개발 환경 설정

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경 변수 설정**
   ```bash
   cp env.example .env.local
   # .env.local 파일에 실제 값 입력
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **빌드 테스트**
   ```bash
   npm run build
   ```

## 📝 API 키 발급 방법

### Supabase 설정
1. [Supabase](https://supabase.com) 가입
2. 새 프로젝트 생성
3. Settings > API에서 URL과 Anon Key 복사

### 네이버 뉴스 API
1. [네이버 개발자 센터](https://developers.naver.com) 가입
2. 애플리케이션 등록
3. 뉴스 검색 API 신청

### OpenAI API
1. [OpenAI](https://platform.openai.com) 가입
2. API 키 발급
3. 크레딧 충전

## 🚀 배포 완료 후

배포가 완료되면 다음 URL로 접속할 수 있습니다:
- **Vercel 도메인**: `https://your-project.vercel.app`
- **커스텀 도메인**: 설정한 도메인

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 환경 변수 설정
2. Supabase 연결 상태
3. API 키 유효성
4. Vercel 로그 확인

---

**배포 완료!** 🎉
이제 전 세계 어디서나 부동산 뉴스 큐레이터에 접속할 수 있습니다.
