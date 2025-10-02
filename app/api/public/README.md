# Ziply Newsletter Public API

다른 서비스에서 Ziply의 뉴스레터 콘텐츠를 동일하게 사용할 수 있도록 제공하는 공개 API입니다.

## 🚀 기본 정보

- **Base URL**: `https://ziply-nine.vercel.app/api/public/newsletter`
- **Method**: `GET`
- **Content-Type**: `application/json` 또는 `text/html`
- **Rate Limit**: 30분 캐시 (1800초)

## 📋 API 엔드포인트

### 뉴스레터 데이터 조회

```
GET /api/public/newsletter
```

## 🔧 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `category` | string | `all` | 뉴스 카테고리 |
| `format` | string | `json` | 응답 포맷 (`json` 또는 `html`) |
| `limit` | number | `4` | 뉴스 개수 (1-20) |
| `glossary` | string | `true` | 용어 풀이 포함 여부 (`true` 또는 `false`) |

### 지원 카테고리

- `정책뉴스` - 부동산 정책 및 규제 관련 뉴스
- `시장분석` - 부동산 시장 동향 및 분석
- `지원혜택` - 정부 지원제도 및 혜택
- `초보자용` - 초보자를 위한 부동산 정보
- `신혼부부용` - 신혼부부 관련 부동산 뉴스
- `투자자용` - 부동산 투자 관련 정보
- `all` - 모든 카테고리 종합

## 📝 사용 예시

### 1. JSON 형식으로 모든 뉴스 조회

```bash
curl "https://ziply-nine.vercel.app/api/public/newsletter?category=all&format=json&limit=6"
```

### 2. 특정 카테고리 뉴스 조회 (용어 풀이 제외)

```bash
curl "https://ziply-nine.vercel.app/api/public/newsletter?category=정책뉴스&glossary=false&limit=3"
```

### 3. HTML 형식으로 뉴스 조회

```bash
curl "https://ziply-nine.vercel.app/api/public/newsletter?category=시장분석&format=html&limit=4"
```

### 4. JavaScript에서 사용

```javascript
// 모든 뉴스 조회
const response = await fetch('https://ziply-nine.vercel.app/api/public/newsletter?category=all&limit=6');
const data = await response.json();

if (data.success) {
  const newsItems = data.data.newsletter.items;
  newsItems.forEach(news => {
    console.log(news.title);
    console.log(news.summary);
    if (news.glossary) {
      console.log('용어 설명:', news.glossary);
    }
  });
}
```

### 5. React 컴포넌트에서 사용

```jsx
import React, { useState, useEffect } from 'react';

function NewsletterWidget({ category = 'all', limit = 4 }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch(
          `https://ziply-nine.vercel.app/api/public/newsletter?category=${category}&limit=${limit}`
        );
        const data = await response.json();
        
        if (data.success) {
          setNews(data.data.newsletter.items);
        }
      } catch (error) {
        console.error('뉴스 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [category, limit]);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="newsletter-widget">
      <h3>오늘의 부동산 뉴스</h3>
      {news.map((item, index) => (
        <div key={item.id} className="news-item">
          <h4>{item.title}</h4>
          <p>{item.summary}</p>
          {item.glossary && (
            <div className="glossary">
              <strong>📖 쉬운 설명:</strong> {item.glossary}
            </div>
          )}
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            원문 보기
          </a>
        </div>
      ))}
    </div>
  );
}

export default NewsletterWidget;
```

## 📊 응답 형식

### JSON 응답 예시

```json
{
  "success": true,
  "data": {
    "newsletter": {
      "title": "종합 부동산 뉴스",
      "date": "2024년 12월 19일",
      "category": "all",
      "totalItems": 6,
      "items": [
        {
          "id": "abc123",
          "title": "정부, 청년 전세대출 한도 확대 발표",
          "summary": "정부가 청년층의 주거 안정을 위해 전세대출 한도를 기존 2억원에서 3억원으로 확대한다고 발표했습니다...",
          "content": "전문 기사 내용...",
          "url": "https://example.com/news/123",
          "publishedAt": "2024-12-19T09:00:00.000Z",
          "category": "정책뉴스",
          "source": "Ziply",
          "glossary": "전세대출: 전세금을 대출받아 전세보증금을 납부하는 주택담보대출의 한 형태입니다..."
        }
      ]
    },
    "meta": {
      "generatedAt": "2024-12-19T10:30:00.000Z",
      "source": "Ziply Newsletter API",
      "version": "1.0",
      "supportedCategories": ["정책뉴스", "시장분석", "지원혜택", "초보자용", "신혼부부용", "투자자용"],
      "usage": {
        "categories": "category=정책뉴스|시장분석|지원혜택|초보자용|신혼부부용|투자자용|all",
        "format": "format=json|html",
        "limit": "limit=1-20 (기본값: 4)",
        "glossary": "glossary=true|false (기본값: true)"
      }
    }
  }
}
```

### HTML 응답

HTML 포맷을 요청하면 완성된 뉴스레터 HTML이 반환됩니다. 다른 웹사이트에 iframe으로 임베드하거나 직접 표시할 수 있습니다.

## 🔄 데이터 업데이트

- **업데이트 주기**: 매일 아침 7시 (한국 시간)
- **캐시**: 30분간 캐시됨
- **실시간성**: 최대 30분 지연 가능

## 🚨 에러 처리

### 에러 응답 예시

```json
{
  "success": false,
  "error": "해당 카테고리의 뉴스를 가져올 수 없습니다.",
  "category": "invalid_category",
  "message": "잠시 후 다시 시도해주세요."
}
```

### HTTP 상태 코드

- `200`: 성공
- `400`: 잘못된 파라미터
- `404`: 해당 카테고리 뉴스 없음
- `500`: 서버 오류

## 💡 활용 아이디어

1. **웹사이트 위젯**: 다른 부동산 관련 웹사이트에 뉴스 위젯으로 임베드
2. **모바일 앱**: 앱 내 뉴스 섹션에서 활용
3. **소셜미디어 봇**: 텔레그램/디스코드 봇에서 일일 뉴스 전송
4. **이메일 마케팅**: 다른 서비스의 이메일 뉴스레터에 포함
5. **대시보드**: 부동산 관련 대시보드에 뉴스 섹션 추가

## 🔒 사용 정책

- **무료 사용**: 개인 및 상업적 용도 모두 무료
- **출처 표기**: Ziply 출처를 명시해주세요
- **과도한 요청 금지**: 스팸성 요청은 차단될 수 있습니다
- **상업적 이용**: 가능하지만 Ziply 브랜딩은 유지해주세요

## 📞 지원

API 사용 중 문제가 발생하면:
- 이슈 리포트: GitHub Issues
- 이메일: support@ziply.com
- 문서 업데이트: 이 README 파일을 참조하세요

---

**Ziply Newsletter Public API v1.0**  
매일 아침 7시, 최신 부동산 뉴스를 AI가 요약해서 제공합니다.
