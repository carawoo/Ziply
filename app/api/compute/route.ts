import { NextRequest, NextResponse } from "next/server";
// import { supabaseAdmin } from "@/lib/supabase"; // 나중에 필요시 사용

interface ComputeRequest {
  message: string;
}

interface LoanCard {
  title: string;
  subtitle?: string;
  monthly?: string;
  totalInterest?: string;
  notes?: string[];
}

interface ComputeResponse {
  reply: string;
  cards?: LoanCard[];
  checklist?: string[];
  notices?: string[];
  policies?: {
    title: string;
    source?: string;
    date?: string;
    summary: string;
    url?: string;
  }[];
}

// 간단한 계산 로직 (실제로는 더 복잡한 금융 계산이 필요)
function calculateLoan(message: string): ComputeResponse {
  const lower = message.toLowerCase();
  
  // 매매 관련 계산
  if (lower.includes('매매')) {
    const budgetMatch = message.match(/(\d+)억/);
    const cashMatch = message.match(/(\d+)천만원/);
    const yearMatch = message.match(/(\d+)년/);
    
    const budget = budgetMatch ? parseInt(budgetMatch[1]) : 6;
    const cash = cashMatch ? parseInt(cashMatch[1]) : 10;
    const years = yearMatch ? parseInt(yearMatch[1]) : 30;
    
    const loanAmount = budget * 100000000 - cash * 10000000; // 억원 -> 원
    const monthlyRate = 0.035 / 12; // 연 3.5% 가정
    const totalMonths = years * 12;
    
    const monthly = Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                               (Math.pow(1 + monthlyRate, totalMonths) - 1));
    
    const totalPayment = monthly * totalMonths;
    const totalInterest = totalPayment - loanAmount;
    
    return {
      reply: `${budget}억원 매매를 위한 대출 상품을 추천드립니다.`,
      cards: [
        {
          title: "주택담보대출 (변동금리)",
          subtitle: `대출금액: ${(loanAmount/100000000).toFixed(1)}억원`,
          monthly: `월 ${Math.round(monthly/10000).toFixed(0)}만원`,
          totalInterest: `${Math.round(totalInterest/100000000).toFixed(1)}억원`,
          notes: [
            "현재 기준금리 기준 산출",
            "실제 금리는 신용등급에 따라 차이",
            "중도상환 수수료 없음"
          ]
        }
      ],
      checklist: [
        "재직증명서 및 소득증명서",
        "주민등록등본",
        "건강보험료 납부확인서",
        "매매계약서",
        "등기부등본"
      ],
      notices: ["금리는 시장 상황에 따라 변동될 수 있습니다."]
    };
  }
  
  // 전세 관련 계산
  if (lower.includes('전세')) {
    const depositMatch = message.match(/전세가?\s*(\d+)억/);
    const cashMatch = message.match(/(\d+)천만원/);
    
    const deposit = depositMatch ? parseInt(depositMatch[1]) : 4;
    const cash = cashMatch ? parseInt(cashMatch[1]) : 5;
    
    const loanAmount = Math.max(0, deposit * 100000000 - cash * 10000000);
    const monthlyRate = 0.028 / 12; // 전세자금대출 금리 2.8% 가정
    const months = 24; // 2년
    
    const monthly = Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                               (Math.pow(1 + monthlyRate, months) - 1));
    
    return {
      reply: `${deposit}억원 전세를 위한 대출 상품을 안내드립니다.`,
      cards: [
        {
          title: "전세자금대출",
          subtitle: `대출금액: ${(loanAmount/100000000).toFixed(1)}억원`,
          monthly: `월 ${Math.round(monthly/10000)}만원`,
          notes: [
            "전세보증금의 80% 한도",
            "소득 대비 DSR 규제 적용",
            "만기 일시상환 가능"
          ]
        }
      ],
      checklist: [
        "전세계약서",
        "소득증명서류",
        "건물등기부등본",
        "전세보증보험 가입증명서"
      ]
    };
  }
  
  // 월세 관련 계산
  if (lower.includes('월세')) {
    return {
      reply: "월세 보증금 대출에 대해 안내드립니다.",
      cards: [
        {
          title: "월세보증금대출",
          subtitle: "보증금 부족분 지원",
          monthly: "약 20만원~",
          notes: [
            "보증금의 70% 한도",
            "최대 2년 거치, 3년 분할상환",
            "우대금리 적용 가능"
          ]
        }
      ],
      checklist: [
        "월세계약서",
        "소득증명서",
        "임대차계약신고필증"
      ]
    };
  }
  
  // 기본 응답
  return {
    reply: "구체적인 조건을 알려주시면 더 정확한 계산을 도와드릴 수 있습니다.",
    notices: ["매매/전세/월세 목적과 금액을 함께 알려주세요."]
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ComputeRequest = await request.json();
    
    if (!body.message) {
      return NextResponse.json(
        { error: "메시지가 필요합니다." },
        { status: 400 }
      );
    }
    
    const result = calculateLoan(body.message);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Compute API 오류:', error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
