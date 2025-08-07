# 부동산 뉴스 큐레이터 📊

부동산 초보자, 신혼부부, 투자자를 위한 맞춤형 뉴스 요약 서비스입니다.

## 🚀 빠른 시작

### 1. 프로젝트 설치

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 2. 환경변수 설정

`env.example` 파일을 복사하여 `.env.local` 파일을 생성하고 아래 값들을 설정하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# AI API 키 (둘 중 하나 선택)
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# 카카오 로그인 설정 (Supabase에서 설정)
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id_here
```

## 🔧 Supabase 설정

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 회원가입하고 새 프로젝트를 생성합니다.
2. 프로젝트 설정에서 `API URL`과 `anon public` 키를 복사합니다.

### 2. 데이터베이스 설정

1. Supabase 대시보드의 SQL Editor에서 `supabase-setup.sql` 파일의 내용을 실행합니다.
2. 이렇게 하면 필요한 테이블과 보안 정책이 자동으로 생성됩니다.

### 3. 카카오 로그인 설정

1. [카카오 개발자 센터](https://developers.kakao.com)에서 앱을 생성합니다.
2. `플랫폼 > Web > 사이트 도메인`에 `http://localhost:3000`과 배포 도메인을 추가합니다.
3. `카카오 로그인 > Redirect URI`에 다음을 추가합니다:
   - `http://localhost:3000/auth/callback`
   - `https://your-project-url.supabase.co/auth/v1/callback`

4. Supabase 대시보드에서:
   - `Authentication > Providers > Kakao` 활성화
   - 카카오 앱의 `REST API 키`를 Client ID에 입력
   - 카카오 앱의 `Client Secret`을 입력 (카카오 개발자 센터에서 발급)

## 🤖 AI API 설정

### OpenAI 사용 시
1. [OpenAI](https://platform.openai.com)에서 API 키를 발급받습니다.
2. `.env.local`에 `OPENAI_API_KEY`를 설정합니다.

### Google Gemini 사용 시
1. [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키를 발급받습니다.
2. `.env.local`에 `GEMINI_API_KEY`를 설정합니다.

## 🌐 Vercel 배포

### 1. Vercel 계정 설정

1. [Vercel](https://vercel.com)에 회원가입합니다.
2. GitHub 저장소를 연결합니다.

### 2. 환경변수 설정

Vercel 프로젝트 설정에서 다음 환경변수를 추가합니다:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENAI_API_KEY (또는 GEMINI_API_KEY)
NEXT_PUBLIC_KAKAO_CLIENT_ID
```

### 3. 배포

```bash
# Vercel CLI 설치 (선택사항)
npm i -g vercel

# 배포
vercel
```

또는 GitHub에 푸시하면 자동으로 배포됩니다.

## 📱 주요 기능

### 🏠 홈페이지
- 서비스 소개
- 카카오 로그인
- 주요 기능 안내

### 📊 대시보드
- 초보자용/신혼부부용/투자자용 탭 제공
- AI가 요약한 맞춤형 부동산 뉴스
- 실시간 뉴스 업데이트

### 📧 뉴스레터
- 이메일 구독 기능
- Supabase DB 자동 저장
- 구독자 관리

## 🛠️ 기술 스택

- **Frontend**: Next.js 14 (App Router)
- **Styling**: CSS Modules
- **Database**: Supabase
- **Authentication**: Supabase Auth (카카오 로그인)
- **AI**: OpenAI GPT-3.5-turbo / Google Gemini
- **Deployment**: Vercel

## 📋 필요한 외부 서비스

1. **Supabase** (무료 플랜 사용 가능)
   - 데이터베이스 및 인증 서비스
   
2. **카카오 개발자 센터** (무료)
   - 카카오 로그인 API
   
3. **OpenAI** 또는 **Google AI Studio** 
   - AI 뉴스 요약 서비스
   - OpenAI: 유료 (사용량 기반)
   - Gemini: 무료 할당량 있음

4. **Vercel** (무료 플랜 사용 가능)
   - 호스팅 및 배포

## 🔍 문제 해결

### 카카오 로그인 오류
- 카카오 개발자 센터에서 도메인과 Redirect URI가 정확히 설정되었는지 확인
- Supabase의 Kakao Provider 설정 확인

### AI 요약 오류
- API 키가 올바르게 설정되었는지 확인
- API 사용량 한도 확인

### 데이터베이스 오류
- Supabase SQL Editor에서 테이블이 정상적으로 생성되었는지 확인
- RLS 정책이 활성화되었는지 확인

## 🎯 추가 개발 가능한 기능

- 실제 뉴스 API 연동 (네이버 뉴스, 다음 뉴스 등)
- 개인화된 뉴스 추천 알고리즘
- 푸시 알림 기능
- 뉴스 북마크 기능
- 소셜 공유 기능
- 댓글 시스템

## 📞 지원

문제가 발생하면 다음을 확인해주세요:

1. 모든 환경변수가 올바르게 설정되었는지
2. 외부 서비스 API 키가 유효한지
3. Supabase 데이터베이스 테이블이 생성되었는지

---

💡 **팁**: 개발 과정에서 실제 뉴스 API를 연동하면 더욱 완성도 높은 서비스로 발전시킬 수 있습니다!
