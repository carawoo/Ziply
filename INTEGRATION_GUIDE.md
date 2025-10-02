# Ziply API 통합 가이드

다른 서비스(RealE 등)에서 Ziply의 뉴스레터 콘텐츠를 사용하는 방법을 안내합니다.

## 🚀 Ziply API 엔드포인트

### 기본 정보
- **Base URL**: `https://ziply-nine.vercel.app/api/public/newsletter`
- **Method**: `GET`
- **Content-Type**: `application/json` 또는 `text/html`
- **Rate Limit**: 10분 캐시

## 📋 사용 방법

### 1. 기본 호출

```javascript
// JavaScript 예시
const response = await fetch('https://ziply-nine.vercel.app/api/public/newsletter?category=all&limit=4');
const data = await response.json();

if (data.success) {
  const newsItems = data.data.newsletter.items;
  newsItems.forEach(news => {
    console.log(`제목: ${news.title}`);
    console.log(`요약: ${news.summary}`);
    console.log(`용어 설명: ${news.glossary}`);
    console.log(`원문: ${news.url}`);
  });
}
```

### 2. 파라미터 옵션

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `category` | string | `all` | 뉴스 카테고리 |
| `format` | string | `json` | 응답 포맷 (`json` 또는 `html`) |
| `limit` | number | `4` | 뉴스 개수 (1-20) |
| `glossary` | string | `true` | 용어 풀이 포함 여부 (`true` 또는 `false`) |

### 3. 지원 카테고리

- `정책뉴스` - 부동산 정책 및 규제 관련 뉴스
- `시장분석` - 부동산 시장 동향 및 분석
- `지원혜택` - 정부 지원제도 및 혜택
- `초보자용` - 초보자를 위한 부동산 정보
- `신혼부부용` - 신혼부부 관련 부동산 뉴스
- `투자자용` - 부동산 투자 관련 정보
- `all` - 모든 카테고리 종합

## 💻 RealE 프로젝트 통합 예시

### React 컴포넌트 예시

```jsx
import React, { useState, useEffect } from 'react';

function ZiplyNewsWidget({ category = 'all', limit = 4 }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchZiplyNews() {
      try {
        setLoading(true);
        const response = await fetch(
          `https://ziply-nine.vercel.app/api/public/newsletter?category=${category}&limit=${limit}&format=json`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setNews(data.data.newsletter.items);
        } else {
          throw new Error(data.error || 'API 오류');
        }
      } catch (err) {
        setError(err.message);
        console.error('Ziply API 오류:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchZiplyNews();
  }, [category, limit]);

  if (loading) return <div>뉴스 로딩 중...</div>;
  if (error) return <div>오류: {error}</div>;

  return (
    <div className="ziply-news-widget">
      <h3>📰 오늘의 부동산 뉴스</h3>
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
            원문 보기 →
          </a>
        </div>
      ))}
    </div>
  );
}

export default ZiplyNewsWidget;
```

### Node.js 백엔드 예시

```javascript
// Express.js 서버에서 사용
app.get('/api/news', async (req, res) => {
  try {
    const { category = 'all', limit = 4 } = req.query;
    
    const response = await fetch(
      `https://ziply-nine.vercel.app/api/public/newsletter?category=${category}&limit=${limit}`
    );
    
    if (!response.ok) {
      return res.status(503).json({ error: 'Ziply API 연결 실패' });
    }
    
    const data = await response.json();
    
    if (data.success) {
      res.json({
        success: true,
        news: data.data.newsletter.items,
        source: 'Ziply'
      });
    } else {
      res.status(503).json({ error: data.error });
    }
  } catch (error) {
    console.error('Ziply API 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});
```

## 🔧 오류 처리

### 일반적인 오류 상황

1. **API 연결 실패**: 네트워크 문제나 Ziply 서버 문제
2. **Rate Limit**: 너무 많은 요청으로 인한 제한
3. **잘못된 파라미터**: 지원하지 않는 카테고리나 잘못된 형식

### 오류 처리 예시

```javascript
async function fetchZiplyNewsWithFallback(category, limit) {
  try {
    // 1차: Ziply API 시도
    const response = await fetch(
      `https://ziply-nine.vercel.app/api/public/newsletter?category=${category}&limit=${limit}`,
      { signal: AbortSignal.timeout(5000) } // 5초 타임아웃
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return data.data.newsletter.items;
      }
    }
    
    // 2차: 폴백 데이터 또는 다른 뉴스 소스
    return getFallbackNews(category, limit);
    
  } catch (error) {
    console.error('Ziply API 오류:', error);
    return getFallbackNews(category, limit);
  }
}
```

## 📊 응답 데이터 구조

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
          "id": "naver-1",
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
      "version": "1.0"
    }
  }
}
```

## 🎯 활용 아이디어

1. **웹사이트 위젯**: 다른 부동산 사이트에 뉴스 섹션 추가
2. **모바일 앱**: 앱 내 뉴스 기능 구현
3. **이메일 마케팅**: 다른 서비스의 뉴스레터에 포함
4. **소셜미디어 봇**: 텔레그램/디스코드 봇에서 일일 뉴스 전송
5. **대시보드**: 부동산 관련 대시보드에 뉴스 섹션 추가

## 🔒 사용 정책

- **무료 사용**: 개인 및 상업적 용도 모두 무료
- **출처 표기**: Ziply 출처를 명시해주세요
- **과도한 요청 금지**: 스팸성 요청은 차단될 수 있습니다
- **상업적 이용**: 가능하지만 Ziply 브랜딩은 유지해주세요

---

**Ziply Newsletter Public API v1.0**  
매일 아침 7시, 최신 부동산 뉴스를 AI가 요약해서 제공합니다.
