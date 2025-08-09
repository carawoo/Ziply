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
}

export default function LoanFaq({ items }: Props) {
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
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="질문/답변 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className={styles.filters}>
          {(['ALL', '보금자리론', '디딤돌대출'] as LoanTypeFilter[]).map((t) => (
            <label key={t} className={styles.filterItem}>
              <input
                type="radio"
                name="loanType"
                value={t}
                checked={loanType === t}
                onChange={() => setLoanType(t)}
              />
              <span>{t === 'ALL' ? '전체' : t}</span>
            </label>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>검색 결과가 없습니다.</div>
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
                  <strong className={styles.title}>{it.question}</strong>
                  <span className={styles.updated}>기준: {it.updatedAt}</span>
                </div>

                <div
                  id={`panel-${it.id}`}
                  className={isOpen ? styles.contentOpen : styles.content}
                >
                  <p className={styles.answer}>
                    {isOpen ? it.answer : truncateLines(it.answer, 3)}
                  </p>
                  <div className={styles.metaRow}>
                    <span className={styles.badge}>{it.source}</span>
                    <button
                      type="button"
                      className={styles.more}
                      onClick={() => toggle(it.id)}
                      aria-label={isOpen ? '접기' : '더보기'}
                    >
                      {isOpen ? '접기' : '더보기'}
                    </button>
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


