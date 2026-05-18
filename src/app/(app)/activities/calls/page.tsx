'use client'

import { useState } from 'react'
import {
  Phone, Plus, Search, Filter, ChevronDown,
  Clock, User, Building2, CheckCircle, XCircle,
  PhoneMissed, PhoneOff, CalendarClock,
} from 'lucide-react'
import {
  CALL_RESULT_LABEL, CALL_RESULT_CLASS,
  ACTIVITY_TYPE_LABEL,
} from '@/constants/domain'
import { formatDateTime, formatDuration, formatRelative } from '@/lib/utils'
import type { Activity } from '@/types/domain'

// ─── Mock 데이터 ──────────────────────────────────────────
const MOCK_CALLS: Activity[] = [
  {
    id: '1', tenant_id: 't1', company_id: 'c1', contact_id: 'ct1',
    user_id: 'u1', contract_id: 'co1', renewal_id: 'r1',
    type: 'call', activity_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    call_result: 'connected', call_duration: 342,
    visit_purpose: null, companions: null,
    summary: '갱신 의향 확인. 담당자 변경 예정이라 다음 주 재통화 요청함. 가격 협의 필요.',
    next_action: '담당자 변경 후 재통화',
    next_action_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    company: { id: 'c1', name: '삼성SDS' },
    contact: { id: 'ct1', name: '김철수', title: '과장' },
    user: { id: 'u1', name: '홍길동' },
  },
  {
    id: '2', tenant_id: 't1', company_id: 'c2', contact_id: 'ct2',
    user_id: 'u1', contract_id: 'co2', renewal_id: null,
    type: 'call', activity_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    call_result: 'no_answer', call_duration: null,
    visit_purpose: null, companions: null,
    summary: null, next_action: '재통화', next_action_at: null,
    created_at: new Date().toISOString(),
    company: { id: 'c2', name: 'LG CNS' },
    contact: { id: 'ct2', name: '이영희', title: '팀장' },
    user: { id: 'u1', name: '홍길동' },
  },
  {
    id: '3', tenant_id: 't1', company_id: 'c3', contact_id: 'ct3',
    user_id: 'u2', contract_id: 'co3', renewal_id: 'r3',
    type: 'call', activity_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    call_result: 'connected', call_duration: 891,
    visit_purpose: null, companions: null,
    summary: '갱신 조건 협의 완료. 계약금액 5% 인상 동의. 계약서 발송 예정.',
    next_action: '계약서 발송',
    next_action_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    company: { id: 'c3', name: 'SK C&C' },
    contact: { id: 'ct3', name: '박민수', title: '부장' },
    user: { id: 'u2', name: '김영수' },
  },
  {
    id: '4', tenant_id: 't1', company_id: 'c4', contact_id: null,
    user_id: 'u1', contract_id: null, renewal_id: null,
    type: 'call', activity_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    call_result: 'rejected', call_duration: null,
    visit_purpose: null, companions: null,
    summary: null, next_action: '다음 주 재시도', next_action_at: null,
    created_at: new Date().toISOString(),
    company: { id: 'c4', name: '현대오토에버' },
    contact: null,
    user: { id: 'u1', name: '홍길동' },
  },
  {
    id: '5', tenant_id: 't1', company_id: 'c5', contact_id: 'ct5',
    user_id: 'u3', contract_id: 'co5', renewal_id: 'r5',
    type: 'call', activity_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    call_result: 'connected', call_duration: 1245,
    visit_purpose: null, companions: null,
    summary: '이탈 의향 확인. 경쟁사 제품 비교 검토 중. 방문 미팅 요청.',
    next_action: '방문 미팅',
    next_action_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    company: { id: 'c5', name: 'KT DS' },
    contact: { id: 'ct5', name: '최지현', title: '차장' },
    user: { id: 'u3', name: '이지원' },
  },
]

// ─── 통화 결과 아이콘 ────────────────────────────────────
function CallResultIcon({ result }: { result: string | null }) {
  switch (result) {
    case 'connected': return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'no_answer': return <PhoneMissed className="w-4 h-4 text-amber-500" />
    case 'rejected': return <PhoneOff className="w-4 h-4 text-red-500" />
    case 'scheduled': return <CalendarClock className="w-4 h-4 text-blue-500" />
    default: return <Phone className="w-4 h-4 text-slate-400" />
  }
}

// ─── 통화 기록 등록 모달 ─────────────────────────────────
function QuickCallModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'result' | 'detail'>('result')
  const [result, setResult] = useState<string>('')
  const [summary, setSummary] = useState('')
  const [nextAction, setNextAction] = useState('')
  const [nextActionAt, setNextActionAt] = useState('')
  const [companySearch, setCompanySearch] = useState('')

  const resultButtons = [
    { value: 'connected', label: '연결됨', icon: CheckCircle, cls: 'border-green-400 bg-green-50 text-green-700' },
    { value: 'no_answer', label: '부재중', icon: PhoneMissed, cls: 'border-amber-400 bg-amber-50 text-amber-700' },
    { value: 'rejected', label: '거절', icon: PhoneOff, cls: 'border-red-400 bg-red-50 text-red-700' },
    { value: 'scheduled', label: '예약통화', icon: CalendarClock, cls: 'border-blue-400 bg-blue-50 text-blue-700' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg mx-0 sm:mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Phone className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">통화 기록</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        {/* 고객사 검색 */}
        <div className="mb-4">
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">고객사</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={companySearch}
              onChange={e => setCompanySearch(e.target.value)}
              placeholder="고객사 검색..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 통화 결과 */}
        <div className="mb-4">
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">통화 결과 *</label>
          <div className="grid grid-cols-2 gap-2">
            {resultButtons.map(btn => (
              <button
                key={btn.value}
                onClick={() => { setResult(btn.value); setStep('detail') }}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-all
                  ${result === btn.value ? btn.cls + ' shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}
              >
                <btn.icon className="w-4 h-4" />
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* 연결됐을 때만 상세 입력 */}
        {result === 'connected' && (
          <>
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">상담 내용</label>
              <textarea
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="통화 내용 요약..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">다음 액션</label>
                <input
                  value={nextAction}
                  onChange={e => setNextAction(e.target.value)}
                  placeholder="예: 제안서 발송"
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">예정일</label>
                <input
                  type="date"
                  value={nextActionAt}
                  onChange={e => setNextActionAt(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            취소
          </button>
          <button
            disabled={!result || !companySearch}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 통화 기록 카드 ───────────────────────────────────────
function CallCard({ activity }: { activity: Activity }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* 아이콘 */}
          <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
            ${activity.call_result === 'connected' ? 'bg-green-50 dark:bg-green-950' :
              activity.call_result === 'no_answer' ? 'bg-amber-50 dark:bg-amber-950' :
              activity.call_result === 'rejected' ? 'bg-red-50 dark:bg-red-950' :
              'bg-blue-50 dark:bg-blue-950'}`}
          >
            <CallResultIcon result={activity.call_result} />
          </div>

          {/* 메인 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {activity.company?.name}
              </span>
              {activity.contact && (
                <span className="text-xs text-slate-500">
                  {activity.contact.name} {activity.contact.title}
                </span>
              )}
              <span className={`ml-auto flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full
                ${CALL_RESULT_CLASS[activity.call_result ?? ''] ?? 'bg-slate-100 text-slate-500'}`}>
                {CALL_RESULT_LABEL[activity.call_result ?? ''] ?? '—'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelative(activity.activity_at)}
              </span>
              {activity.call_duration && (
                <span>{formatDuration(activity.call_duration)}</span>
              )}
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {activity.user?.name}
              </span>
            </div>

            {activity.summary && (
              <p className={`mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed
                ${expanded ? '' : 'line-clamp-2'}`}>
                {activity.summary}
              </p>
            )}

            {activity.next_action_at && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                <CalendarClock className="w-3 h-3" />
                <span>다음 액션: {activity.next_action} ({formatDate(activity.next_action_at)})</span>
              </div>
            )}
          </div>
        </div>

        {activity.summary && activity.summary.length > 80 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 ml-12 text-xs text-slate-400 hover:text-slate-600"
          >
            {expanded ? '접기' : '더보기'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── 메인 페이지 ──────────────────────────────────────────
export default function CallsPage() {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterResult, setFilterResult] = useState('')

  const filtered = MOCK_CALLS.filter(a => {
    if (search && !a.company?.name.includes(search)) return false
    if (filterResult && a.call_result !== filterResult) return false
    return true
  })

  const todayCalls = MOCK_CALLS.filter(a => {
    const today = new Date().toDateString()
    return new Date(a.activity_at).toDateString() === today
  }).length

  const connectedRate = Math.round(
    (MOCK_CALLS.filter(a => a.call_result === 'connected').length / MOCK_CALLS.length) * 100
  )

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">통화 기록</h1>
          <p className="text-sm text-slate-500 mt-0.5">오늘 {todayCalls}건 통화 · 연결률 {connectedRate}%</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          통화 기록
        </button>
      </div>

      {/* 통계 바 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '전체', count: MOCK_CALLS.length, cls: 'text-slate-700' },
          { label: '연결됨', count: MOCK_CALLS.filter(a => a.call_result === 'connected').length, cls: 'text-green-600' },
          { label: '부재중', count: MOCK_CALLS.filter(a => a.call_result === 'no_answer').length, cls: 'text-amber-600' },
          { label: '거절', count: MOCK_CALLS.filter(a => a.call_result === 'rejected').length, cls: 'text-red-600' },
        ].map(stat => (
          <button
            key={stat.label}
            onClick={() => setFilterResult(stat.label === '전체' ? '' :
              stat.label === '연결됨' ? 'connected' :
              stat.label === '부재중' ? 'no_answer' : 'rejected')}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center hover:border-slate-300 transition-colors"
          >
            <div className={`text-2xl font-bold font-mono ${stat.cls}`}>{stat.count}</div>
            <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* 검색 & 필터 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="고객사 검색..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterResult}
          onChange={e => setFilterResult(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체 결과</option>
          <option value="connected">연결됨</option>
          <option value="no_answer">부재중</option>
          <option value="rejected">거절</option>
          <option value="scheduled">예약통화</option>
        </select>
      </div>

      {/* 목록 */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Phone className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">통화 기록이 없습니다</p>
          </div>
        ) : (
          filtered.map(a => <CallCard key={a.id} activity={a} />)
        )}
      </div>

      {showModal && <QuickCallModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

// 빠른 날짜 포맷 (로컬에서 직접)
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
}
