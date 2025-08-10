import { summarizeWithGlossary } from '../lib/ai';

describe('AI 뉴스 요약 테스트', () => {
  test('전문 용어가 쉬운 말로 바뀌는지 확인', async () => {
    const testTitle = 'KB증권, 자산건전성 저하에도 불구하고 평가 등급 AA+ 유지';
    const testContent = '이혁진 한기평 선임연구원은 "KB증권의 부동산 프로젝트파이낸싱(PF) 익스포저 비중이 여전히 40% 이상으로 높다"고 분석했다. 기초자산 대부분이 우량 채권으로 구성되어 있어, 주식시장의 변동성에 대한 민감도가 낮고 시장 위험을 효과적으로 관리하고 있다고 평가했다.';
    const testCategory = '부동산 기초';

    const result = await summarizeWithGlossary(testTitle, testContent, testCategory);

    // 전문 용어가 포함되지 않았는지 확인
    const forbiddenTerms = [
      '프로젝트파이낸싱',
      'PF',
      '익스포저',
      '기초자산',
      '우량 채권',
      '주식시장의 변동성',
      '시장 위험',
      'REITs',
      'LTV',
      'DTI',
      '종부세'
    ];

    forbiddenTerms.forEach(term => {
      expect(result.summary.toLowerCase()).not.toContain(term.toLowerCase());
      expect(result.glossary.toLowerCase()).not.toContain(term.toLowerCase());
    });

    // 쉬운 용어가 포함되었는지 확인
    const easyTerms = [
      '집',
      '돈',
      '빌린',
      '안전한',
      '투자',
      '정부',
      '규칙',
      '은행'
    ];

    // 최소 하나의 쉬운 용어가 포함되어야 함
    const hasEasyTerms = easyTerms.some(term => 
      result.summary.includes(term) || result.glossary.includes(term)
    );
    expect(hasEasyTerms).toBe(true);

    // 응답 형식 확인
    expect(result.summary).toBeTruthy();
    expect(result.glossary).toBeTruthy();
    expect(typeof result.summary).toBe('string');
    expect(typeof result.glossary).toBe('string');
  });

  test('어린이 친화적인 설명이 포함되는지 확인', async () => {
    const testTitle = '정부, 부동산 투자 규제 완화 정책 발표';
    const testContent = '정부가 부동산 시장 활성화를 위해 REITs 투자 규제를 완화하고, LTV 및 DTI 기준을 상향 조정하는 정책을 발표했다. 이는 청약 경쟁률 완화와 분양 시장 활성화를 위한 조치로 평가된다.';
    const testCategory = '부동산 기초';

    const result = await summarizeWithGlossary(testTitle, testContent, testCategory);

    // 어린이 친화적인 표현이 포함되었는지 확인
    const childFriendlyTerms = [
      '이에요',
      '해요',
      '있어요',
      '돼요',
      '쉽게',
      '우리가',
      '우리 일상',
      '어린이',
      '초등학생'
    ];

    // 최소 하나의 어린이 친화적 표현이 포함되어야 함
    const hasChildFriendlyTerms = childFriendlyTerms.some(term => 
      result.glossary.includes(term)
    );
    expect(hasChildFriendlyTerms).toBe(true);

    // 전문 용어가 제거되었는지 확인
    expect(result.glossary).not.toContain('REITs');
    expect(result.glossary).not.toContain('LTV');
    expect(result.glossary).not.toContain('DTI');
  });

  test('기본 요약이 올바르게 작동하는지 확인', async () => {
    // API 키가 없는 상황을 시뮬레이션
    const originalOpenAIKey = process.env.OPENAI_API_KEY;
    const originalGeminiKey = process.env.GEMINI_API_KEY;
    
    delete process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const testTitle = '부동산 시장 동향';
    const testContent = '최근 부동산 시장에서 다양한 변화가 일어나고 있다.';
    const testCategory = '부동산 기초';

    const result = await summarizeWithGlossary(testTitle, testContent, testCategory);

    // 기본 요약이 반환되었는지 확인
    expect(result.summary).toBeTruthy();
    expect(result.glossary).toBeTruthy();
    expect(result.glossary).toContain('📖 쉬운 설명');
    expect(result.glossary).toContain('우리가 살고 있는 집');

    // 환경 변수 복원
    if (originalOpenAIKey) process.env.OPENAI_API_KEY = originalOpenAIKey;
    if (originalGeminiKey) process.env.GEMINI_API_KEY = originalGeminiKey;
  });
});
