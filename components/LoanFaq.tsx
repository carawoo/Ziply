"use client"
import { useMemo, useState, KeyboardEvent } from 'react'
import styles from '@/styles/LoanFaq.module.css'

export type CategoryFilter = 'ALL' | '기초상식' | '매매' | '대출'

export interface FaqItem {
  id: string
  category: '기초상식' | '매매' | '대출'
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
  const [category, setCategory] = useState<CategoryFilter>('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 5

  const normalizedQuery = useMemo(
    () => query.trim().toLowerCase().replace(/\s+/g, ' '),
    [query]
  )

  const filtered = useMemo(() => {
    const list = Array.isArray(items) ? items : []
    return list.filter((it) => {
      if (category !== 'ALL' && it.category !== category) return false
      if (!normalizedQuery) return true
      const hay = `${it.question} ${it.answer}`.toLowerCase().replace(/\s+/g, ' ')
      return hay.includes(normalizedQuery)
    })
  }, [items, category, normalizedQuery])

  // 페이지네이션 계산
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filtered.slice(startIndex, endIndex)

  const toggle = (id: string) => {
    setExpandedId((cur) => (cur === id ? null : id))
  }

  const onKeyToggle = (e: KeyboardEvent<HTMLDivElement>, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle(id)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setExpandedId(null) // 페이지 변경 시 모든 답변 닫기
  }

  return (
    <div className={embedded ? styles.wrapper : styles.wrapperStandalone}>
      {!embedded && (
        <div className={styles.header}>
          <h1 className={styles.title}>
            부동산 초보자를 위한<br />
            <span style={{ color: 'var(--primary-600)' }}>Q&A 가이드</span>
          </h1>
          <p className={styles.subtitle}>
            부동산을 처음 접하는 분들이 가장 궁금해하는 질문들을 모았어요
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
          {(['ALL', '기초상식', '매매', '대출'] as CategoryFilter[]).map((c) => (
            <button
              key={c}
              className={`${styles.filterItem} ${category === c ? styles.active : ''}`}
              onClick={() => {
                setCategory(c)
                setCurrentPage(1) // 카테고리 변경 시 첫 페이지로
              }}
              type="button"
            >
              {c === 'ALL' ? '🏠 전체' : c === '기초상식' ? '📚 기초상식' : c === '매매' ? '🏡 매매' : '💰 대출'}
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
          {currentItems.map((it) => {
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
                    <span className={styles.categoryBadge}>{it.category}</span>
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

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              type="button"
            >
              ← 이전
            </button>
            
            <div className={styles.pageNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
                  onClick={() => handlePageChange(page)}
                  type="button"
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              className={styles.pageButton}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              type="button"
            >
              다음 →
            </button>
          </div>
        )}
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


