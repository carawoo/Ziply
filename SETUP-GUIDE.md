# 🚀 부동산 뉴스 큐레이터 설정 가이드

개발 지식이 없어도 따라할 수 있는 단계별 설정 가이드입니다.

## 📋 준비물

1. 컴퓨터 (Windows, Mac, Linux 모두 가능)
2. 인터넷 연결
3. 이메일 주소

## 🔨 1단계: 기본 도구 설치

### Node.js 설치

1. [Node.js 공식 사이트](https://nodejs.org) 접속
2. "LTS" 버전 다운로드 (안정 버전)
3. 다운로드된 파일 실행하여 설치
4. 터미널(명령 프롬프트)에서 확인:
   ```bash
   node --version
   npm --version
   ```

### 코드 에디터 설치 (선택사항)

1. [Visual Studio Code](https://code.visualstudio.com) 다운로드
2. 설치 후 프로젝트 폴더 열기

## 🗄️ 2단계: Supabase 설정

### Supabase 계정 생성

1. [Supabase](https://supabase.com) 접속
2. "Start your project" 클릭
3. GitHub 계정으로 회원가입 (추천) 또는 이메일로 회원가입
4. "New project" 클릭

### 프로젝트 생성

1. Organization 선택 (처음이면 자동 생성됨)
2. Project name 입력: `real-estate-news`
3. Database Password 설정 (복잡하게, 꼭 기록해둘 것!)
4. Region 선택: `Northeast Asia (Seoul)`
5. "Create new project" 클릭
6. **2-3분 기다리기** (프로젝트 생성 중)

### API 키 복사

1. 프로젝트 대시보드에서 좌측 메뉴의 "Settings" → "API" 클릭
2. 다음 정보를 복사해서 메모장에 저장:
   - `Project URL`
   - `anon public` key

### 데이터베이스 테이블 생성

1. 좌측 메뉴에서 "SQL Editor" 클릭
2. "New query" 클릭
3. 프로젝트의 `supabase-setup.sql` 파일 내용을 복사해서 붙여넣기
4. 우측 상단의 "RUN" 버튼 클릭
5. 성공 메시지 확인

## 🔐 3단계: 카카오 로그인 설정

### 카카오 개발자 계정 생성

1. [카카오 개발자 센터](https://developers.kakao.com) 접속
2. 카카오 계정으로 로그인
3. 우측 상단 "내 애플리케이션" 클릭
4. "애플리케이션 추가하기" 클릭

### 카카오 앱 생성

1. 앱 이름: `부동산뉴스큐레이터` 입력
2. 사업자명: 개인 이름 입력
3. "저장" 클릭
4. 생성된 앱 클릭

### 카카오 앱 설정

1. **플랫폼 설정**:
   - 좌측 메뉴 "플랫폼" 클릭
   - "Web 플랫폼 등록" 클릭
   - 사이트 도메인: `http://localhost:3000` 입력
   - "저장" 클릭

2. **카카오 로그인 설정**:
   - 좌측 메뉴 "카카오 로그인" 클릭
   - "활성화 설정" ON으로 변경
   - "Redirect URI" 등록:
     - `http://localhost:3000/auth/callback`
   - "저장" 클릭

3. **API 키 복사**:
   - 좌측 메뉴 "앱 키" 클릭
   - "REST API 키" 복사해서 메모장에 저장

### Supabase에 카카오 연동

1. Supabase 대시보드로 돌아가기
2. 좌측 메뉴 "Authentication" → "Providers" 클릭
3. "Kakao" 찾아서 클릭
4. "Enable sign in with Kakao" 체크
5. 카카오에서 복사한 REST API 키를 "Kakao Client ID"에 입력
6. "Save" 클릭

## 📰 4단계: 네이버 뉴스 API 설정

실제 뉴스 데이터를 가져오기 위해 네이버 뉴스 API를 사용합니다. 이미 설정된 API 키를 사용하거나, 직접 등록할 수 있습니다.

### 기본 설정 (권장)

프로젝트에 이미 설정된 네이버 API 키를 사용할 수 있습니다:
- Client ID: `ceVPKnFABx59Lo4SzbmY`
- Client Secret: `FUfJ_TnwL6`

이 설정은 `env.example` 파일에 이미 포함되어 있어 별도 설정이 필요하지 않습니다.

### 직접 네이버 API 등록 (선택사항)

본인만의 네이버 API 키를 사용하려면:

1. [네이버 개발자 센터](https://developers.naver.com) 접속
2. "Application" → "애플리케이션 등록" 클릭
3. 애플리케이션 정보 입력:
   - 애플리케이션 이름: `부동산뉴스앱`
   - 사용 API: "검색" 선택
4. 등록 완료 후 "Client ID"와 "Client Secret" 복사
5. `.env.local` 파일에서 해당 값들을 교체

## 🤖 5단계: AI API 설정 (선택사항)

실제 AI 요약 기능을 사용하려면 AI API 키가 필요합니다. 둘 중 하나를 선택하세요:

### 옵션 1: OpenAI (추천)

1. [OpenAI](https://platform.openai.com) 접속
2. 계정 생성 또는 로그인
3. 우측 상단 계정 메뉴 → "API keys" 클릭
4. "Create new secret key" 클릭
5. 키 이름 입력 후 "Create secret key" 클릭
6. **생성된 키를 즉시 복사** (다시 볼 수 없음!)
7. 메모장에 저장

### 옵션 2: Google Gemini (무료 할당량 있음)

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. Google 계정으로 로그인
3. "Create API key" 클릭
4. "Create API key in new project" 선택
5. 생성된 키 복사해서 메모장에 저장

## 🔧 6단계: 프로젝트 설정

### 환경변수 파일 생성

1. 프로젝트 폴더에서 `env.example` 파일을 복사
2. 파일명을 `.env.local`로 변경
3. 파일을 열어서 다음 정보를 입력:

```env
# 2단계에서 복사한 Supabase 정보
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 5단계에서 복사한 AI API 키 (둘 중 하나만)
OPENAI_API_KEY=your_openai_api_key_here
# 또는
GEMINI_API_KEY=your_gemini_api_key_here

# 3단계에서 복사한 카카오 REST API 키
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id_here

# 4단계 네이버 뉴스 API (이미 설정됨)
NAVER_CLIENT_ID=ceVPKnFABx59Lo4SzbmY
NAVER_CLIENT_SECRET=FUfJ_TnwL6
```

4. 파일 저장

### 프로젝트 실행

터미널(명령 프롬프트)에서:

```bash
# 프로젝트 폴더로 이동
cd /path/to/your/project

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

5. 브라우저에서 `http://localhost:3000` 접속
6. 사이트가 정상적으로 로드되는지 확인

## 🌐 7단계: Vercel 배포

### Vercel 계정 생성

1. [Vercel](https://vercel.com) 접속
2. "Sign Up" 클릭
3. GitHub 계정으로 회원가입 (추천)

### GitHub에 코드 업로드

1. [GitHub](https://github.com) 접속 후 로그인
2. "New repository" 클릭
3. Repository name: `real-estate-news-app`
4. "Create repository" 클릭
5. 생성된 저장소 주소 복사

터미널에서:
```bash
# Git 초기화
git init
git add .
git commit -m "Initial commit"

# GitHub 저장소 연결 (위에서 복사한 주소 사용)
git remote add origin https://github.com/yourusername/real-estate-news-app.git
git push -u origin main
```

### Vercel에서 배포

1. Vercel 대시보드에서 "Import Project" 클릭
2. GitHub 저장소 선택
3. "Import" 클릭
4. **환경변수 설정**:
   - "Environment Variables" 섹션에서 `.env.local`의 모든 변수 추가
   - 각 변수명과 값을 정확히 입력
5. "Deploy" 클릭
6. 배포 완료 후 제공되는 URL 확인

### 카카오 로그인 배포 설정 추가

1. 배포된 URL 복사 (예: `https://your-app.vercel.app`)
2. 카카오 개발자 센터로 돌아가기
3. "플랫폼" → 사이트 도메인에 배포 URL 추가
4. "카카오 로그인" → Redirect URI에 `https://your-app.vercel.app/auth/callback` 추가
5. "저장" 클릭

## ✅ 7단계: 테스트

### 기능 테스트

1. 배포된 사이트 접속
2. 카카오 로그인 테스트
3. 대시보드 접속해서 뉴스 확인
4. 뉴스레터 구독 테스트

### 문제 해결

**카카오 로그인이 안 되는 경우:**
- 카카오 개발자 센터의 도메인과 Redirect URI 설정 재확인
- Supabase의 Kakao Provider 설정 재확인

**AI 요약이 안 되는 경우:**
- API 키가 올바른지 확인
- API 사용량 한도 확인

**뉴스레터 구독이 안 되는 경우:**
- Supabase SQL Editor에서 테이블 생성 여부 확인

## 🎉 완료!

축하합니다! 부동산 뉴스 큐레이터 서비스가 성공적으로 배포되었습니다.

이제 다음과 같은 기능을 사용할 수 있습니다:
- ✅ 카카오 로그인
- ✅ 맞춤형 뉴스 요약
- ✅ 뉴스레터 구독
- ✅ 반응형 웹사이트

### 추가 개발 아이디어

- 실제 뉴스 API 연동
- 개인화된 추천 알고리즘
- 모바일 앱 개발
- 관리자 대시보드

문제가 생기면 `README.md`의 문제 해결 섹션을 참고하세요!
