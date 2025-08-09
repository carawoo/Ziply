import LoanFaq from '@/components/LoanFaq'
import data from '@/data/loan-faq.json'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <main style={{ maxWidth: 920, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
        처음 주택 대출? 보금자리론·디딤돌대출 Q&A
      </h1>
      <p style={{ color: '#6b7280', marginTop: 8, marginBottom: 16 }}>
        초보자가 가장 많이 묻는 질문을 한 페이지에서 확인하세요.
      </p>
      <LoanFaq items={data as any} />
    </main>
  )
}


