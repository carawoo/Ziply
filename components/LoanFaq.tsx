"use client"
import { useMemo, useState, KeyboardEvent } from 'react'
import styles from '@/styles/LoanFaq.module.css'

export type LoanTypeFilter = 'ALL' | '보금자리론' | '디딤돌대출'

export interface FaqItem {
  id: string
  loanType: '보금자리론' | '디딤돌대출'
  question: string
  answer: string
  source: string
  updatedAt: string // YYYY-MM-DD
}

interface Props {
  items: FaqItem[]
  embedded?: boolean // 대시보드에 임베드된 경우
}

export default function LoanFaq({ items, embedded = false }: Props) {
  const [query, setQuery] = useState<string>('')
  const [loanType, setLoanType] = useState<LoanTypeFilter>('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const normalizedQuery = useMemo(
    () => query.trim().toLowerCase().replace(/\s+/g, ' '),
    [query]
  )

  const filtered = useMemo(() => {
    const list = Array.isArray(items) ? items : []
    return list.filter((it) => {
      if (loanType !== 'ALL' && it.loanType !== loanType) return false
      if (!normalizedQuery) return true
      const hay = `${it.question} ${it.answer}`.toLowerCase().replace(/\s+/g, ' ')
      return hay.includes(normalizedQuery)
    })
  }, [items, loanType, normalizedQuery])

  const toggle = (id: string) => {
    setExpandedId((cur) => (cur === id ? null : id))
  }

  const onKeyToggle = (e: KeyboardEvent<HTMLDivElement>, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle(id)
    }
  }

  return (
    <div className={embedded ? styles.wrapper : styles.wrapperStandalone}>
      {!embedded && (
        <div className={styles.header}>
          <h1 className={styles.title}>
            처음 주택 대출?<br />
            <span style={{ color: 'var(--primary-600)' }}>보금자리론·디딤돌대출</span> Q&A
          </h1>
          <p className={styles.subtitle}>
            초보자가 가장 많이 묻는 질문을 한 페이지에서 확인하세요
          </p>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.searchSection}>
          <input
            className={styles.search}
            placeholder="궁금한 내용을 검색해보세요 (예: 금리, 신청 조건, 서류)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          {(['ALL', '보금자리론', '디딤돌대출'] as LoanTypeFilter[]).map((t) => (
            <button
              key={t}
              className={`${styles.filterItem} ${loanType === t ? styles.active : ''}`}
              onClick={() => setLoanType(t)}
              type="button"
            >
              {t === 'ALL' ? '🏠 전체' : t === '보금자리론' ? '🏡 보금자리론' : '🏘️ 디딤돌대출'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 && (
        <div className={styles.resultsCount}>
          총 <strong style={{ color: 'var(--primary-600)' }}>{filtered.length}개</strong>의 Q&A를 찾았어요
        </div>
      )}

      {filtered.length === 0 ? (
        <div className={styles.noResults}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p>검색 결과가 없어요</p>
          <p style={{ fontSize: '16px', color: 'var(--gray-400)', marginTop: '8px' }}>
            다른 키워드로 검색해보시거나 전체를 선택해보세요
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {filtered.map((it) => {
            const isOpen = expandedId === it.id
            return (
              <li key={it.id} className={styles.card}>
                <div
                  role="button"
                  tabIndex={0}
                  className={styles.cardHeader}
                  onClick={() => toggle(it.id)}
                  onKeyDown={(e) => onKeyToggle(e, it.id)}
                  aria-expanded={isOpen}
                  aria-controls={`panel-${it.id}`}
                >
                  <div className={styles.cardQuestion}>
                    <span style={{ marginRight: '8px' }}>Q.</span>
                    {it.question}
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.updated}>기준: {it.updatedAt}</span>
                    <span className={styles.loanTypeBadge}>{it.loanType}</span>
                    <span className={`${styles.expandIcon} ${isOpen ? styles.expandIconOpen : ''}`}>
                      ↓
                    </span>
                  </div>
                </div>

                <div
                  id={`panel-${it.id}`}
                  className={isOpen ? styles.contentOpen : styles.content}
                >
                  <p className={styles.answer}>
                    <span style={{ 
                      fontWeight: '600', 
                      color: 'var(--primary-700)', 
                      marginRight: '8px' 
                    }}>
                      A.
                    </span>
                    {isOpen ? it.answer : truncateLines(it.answer, 2)}
                  </p>
                  <div className={styles.metaRow}>
                    <span className={styles.badge}>
                      📚 {it.source}
                    </span>
                    {!isOpen && (
                      <button
                        type="button"
                        className={styles.more}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggle(it.id)
                        }}
                        aria-label="전체 답변 보기"
                      >
                        전체 답변 보기 →
                      </button>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function truncateLines(text: string, maxLines: number): string {
  // 간단 미리보기: 줄 기준이 아닌 글자수로 대체 (약 120자/라인 근사)
  const approx = maxLines * 120
  if (text.length <= approx) return text
  return text.slice(0, approx).trim() + '…'
}


