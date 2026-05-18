'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, FileText, RefreshCw, Users, CreditCard,
  CheckCircle2, Clock, AlertTriangle, XCircle, Plus,
  Pencil, Building2, CalendarDays, DollarSign, Tag,
  ChevronRight, Copy, MoreHorizontal
} from 'lucide-react'
import { cn, formatAmount, formatDate, calcDday, getDdayClass } from '@/lib/utils'
import type { ContractStatus, RenewalStatus } from '@/types/domain'

// ─── Mock 데이터 ──────────────────────────────────────────
const MOCK_CONTRACT = {
  id: 'c1',
  contract_no: 'CT-2024-0142',
  company_id: 'co1',
  company_name: '삼성SDS(주)',
  product_name: '고객관리 솔루션 Pro',
  assigned_user_name: '김영업',
  team_name: '서울 영업팀',
  started_at: '2024-01-01T00:00:00Z',
  expires_at: '2024-12-31T00:00:00Z',
  amount: 3_600_000,
  discount_rate: 10,
  final_amount: 3_240_000,
  is_paid: true,
  paid_at: '2024-01-05T00:00:00Z',
  payment_method: '계좌이체',
  account_count: 5,
  status: 'active' as ContractStatus,
  renewal_count: 2,
  memo: '3년 연속 갱신 우수고객. VIP 관리 대상.',
  created_at: '2023-12-28T00:00:00Z',
  updated_at: '2024-01-05T00:00:00Z',
}

const MOCK_RENEWALS = [
  {
    id: 'r1', status: 'pending' as RenewalStatus,
    contract_expires_at: '2024-12-31T00:00:00Z',
    risk_level: 'low', risk_score: 12,
    created_at: '2023-12-28T00:00:00Z',
  },
  {
    id: 'r0', status: 'won' as RenewalStatus,
    contract_expires_at: '2023-12-31T00:00:00Z',
    risk_level: 'medium', risk_score: 35,
    result: 'renewed', result_amount: 3_240_000,
    created_at: '2022-12-28T00:00:00Z',
    updated_at: '2023-11-15T00:00:00Z',
  },
  {
    id: 'r00', status: 'won' as RenewalStatus,
    contract_expires_at: '2022-12-31T00:00:00Z',
    risk_level: 'low', risk_score: 8,
    result: 'renewed', result_amount: 2_880_000,
    created_at: '2021-12-28T00:00:00Z',
    updated_at: '2022-11-02T00:00:00Z',
  },
]

const MOCK_ACCOUNTS = [
  { id: 'a1', account_id: 'sds_user01', issued_at: '2024-01-05T00:00:00Z', expires_at: '2024-12-31T00:00:00Z', note: '주관리자' },
  { id: 'a2', account_id: 'sds_user02', issued_at: '2024-01-05T00:00:00Z', expires_at: '2024-12-31T00:00:00Z', note: '' },
  { id: 'a3', account_id: 'sds_user03', issued_at: '2024-01-05T00:00:00Z', expires_at: '2024-12-31T00:00:00Z', note: '' },
  { id: 'a4', account_id: 'sds_user04', issued_at: '2024-02-01T00:00:00Z', expires_at: '2024-12-31T00:00:00Z', note: '추가발급' },
  { id: 'a5', account_id: 'sds_user05', issued_at: '2024-02-01T00:00:00Z', expires_at: '2024-12-31T00:00:00Z', note: '추가발급' },
]

// ─── 상태 배지 ────────────────────────────────────────────
const CONTRACT_STATUS: Record<ContractStatus, { label: string; cls: string }> = {
  active:    { label: '활성',  cls: 'bg-green-50 text-green-700 border-green-200' },
  expired:   { label: '만료',  cls: 'bg-red-50 text-red-700 border-red-200' },
  cancelled: { label: '해지',  cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  renewed:   { label: '갱신됨', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
}
const RENEWAL_STATUS: Record<RenewalStatus, { label: string; cls: string }> = {
  pending:     { label: '대기중',   cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  contacted:   { label: '접촉',     cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  negotiating: { label: '협의중',   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  won:         { label: '갱신완료', cls: 'bg-green-50 text-green-700 border-green-200' },
  lost:        { label: '이탈',     cls: 'bg-red-50 text-red-700 border-red-200' },
}
const RISK_CLS: Record<string, string> = {
  high:   'bg-red-50 text-red-600 border-red-200',
  medium: 'bg-amber-50 text-amber-600 border-amber-200',
  low:    'bg-green-50 text-green-600 border-green-200',
}
const RISK_LABEL: Record<string, string> = { high: '위험', medium: '주의', low: '안전' }

const TABS = ['개요', '갱신 이력', '발급 계정', '결제']

// ─── 섹션 ────────────────────────────────────────────────
function Section({ title, children, action }: {
  title: string; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={cn('text-sm text-gray-800', mono && 'font-mono')}>{value}</span>
    </div>
  )
}

// ─── 탭: 개요 ─────────────────────────────────────────────
function TabOverview() {
  const c = MOCK_CONTRACT
  const dday = calcDday(c.expires_at)
  const ddayCls = getDdayClass(dday)

  return (
    <div className="space-y-4">
      {/* 핵심 지표 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5">
          <p className="text-xs text-gray-500">계약금액</p>
          <p className="text-xl font-bold text-gray-900 font-mono mt-0.5">
            {formatAmount(c.final_amount)}
          </p>
          {c.discount_rate > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              정가 {formatAmount(c.amount)} ({c.discount_rate}% 할인)
            </p>
          )}
        </div>
        <div className={cn('border rounded-xl px-4 py-3.5', dday <= 30 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200')}>
          <p className="text-xs text-gray-500">만료까지</p>
          <p className={cn('text-xl font-bold font-mono mt-0.5', ddayCls)}>
            {dday >= 0 ? `D-${dday}` : `D+${Math.abs(dday)}`}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(c.expires_at)}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5">
          <p className="text-xs text-gray-500">갱신 횟수</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{c.renewal_count}회</p>
          <p className="text-xs text-gray-400 mt-0.5">장기 고객</p>
        </div>
      </div>

      {/* 계약 정보 */}
      <Section title="계약 정보" action={
        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">
          <Pencil className="w-3 h-3" /> 편집
        </button>
      }>
        <div className="space-y-0">
          <InfoRow label="계약번호" value={c.contract_no} mono />
          <InfoRow label="고객사" value={
            <Link href={`/app/companies/${c.company_id}`} className="text-blue-600 hover:underline flex items-center gap-1">
              {c.company_name} <ChevronRight className="w-3 h-3" />
            </Link>
          } />
          <InfoRow label="제품" value={c.product_name} />
          <InfoRow label="담당자" value={`${c.assigned_user_name} · ${c.team_name}`} />
          <InfoRow label="계약 기간" value={`${formatDate(c.started_at)} ~ ${formatDate(c.expires_at)}`} />
          <InfoRow label="계정 수" value={`${c.account_count}개`} />
          <InfoRow label="상태" value={
            <span className={cn('text-xs px-1.5 py-0.5 rounded-full border font-medium', CONTRACT_STATUS[c.status].cls)}>
              {CONTRACT_STATUS[c.status].label}
            </span>
          } />
        </div>
      </Section>

      {/* 메모 */}
      {c.memo && (
        <Section title="메모">
          <p className="text-sm text-gray-600 leading-relaxed">{c.memo}</p>
        </Section>
      )}
    </div>
  )
}

// ─── 탭: 갱신 이력 ────────────────────────────────────────
function TabRenewals() {
  return (
    <div className="space-y-3">
      {MOCK_RENEWALS.map((r, i) => (
        <div
          key={r.id}
          className={cn(
            'border rounded-xl p-4',
            i === 0 ? 'border-blue-200 bg-blue-50/40' : 'border-gray-200 bg-white'
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {i === 0 && (
                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">현재</span>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {formatDate(r.contract_expires_at)} 만료 계약
                </p>
                <p className="text-xs text-gray-400 mt-0.5">생성 {formatDate(r.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {r.risk_level && (
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border font-medium', RISK_CLS[r.risk_level])}>
                  {RISK_LABEL[r.risk_level]}
                </span>
              )}
              <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border font-medium', RENEWAL_STATUS[r.status].cls)}>
                {RENEWAL_STATUS[r.status].label}
              </span>
            </div>
          </div>
          {r.result === 'renewed' && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                갱신 완료
              </span>
              <span className="text-sm font-bold text-gray-900 font-mono">
                {formatAmount((r as typeof r & { result_amount?: number }).result_amount ?? 0)}
              </span>
            </div>
          )}
          {i === 0 && (
            <div className="mt-3">
              <Link
                href={`/app/renewals/${r.id}`}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                갱신 관리로 이동 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── 탭: 발급 계정 ────────────────────────────────────────
function TabAccounts() {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">발급된 계정 ({MOCK_ACCOUNTS.length}/{MOCK_CONTRACT.account_count})</p>
          <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 px-2.5 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50">
            <Plus className="w-3.5 h-3.5" /> 계정 추가
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {MOCK_ACCOUNTS.map(a => (
            <div key={a.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-gray-800">{a.account_id}</p>
                  <button
                    onClick={() => handleCopy(a.account_id)}
                    className="text-gray-300 hover:text-blue-500 transition-colors"
                  >
                    {copied === a.account_id
                      ? <CheckCircle2 className="w-3 h-3 text-green-500" />
                      : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                {a.note && <p className="text-xs text-gray-400 mt-0.5">{a.note}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400">{formatDate(a.issued_at)} 발급</p>
                <p className="text-xs text-gray-400">{formatDate(a.expires_at)} 만료</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 탭: 결제 ─────────────────────────────────────────────
function TabPayment() {
  const c = MOCK_CONTRACT
  const [isPaid, setIsPaid] = useState(c.is_paid)

  return (
    <div className="space-y-4">
      {/* 결제 상태 카드 */}
      <div className={cn(
        'border rounded-xl p-5',
        isPaid ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPaid
              ? <CheckCircle2 className="w-5 h-5 text-green-500" />
              : <Clock className="w-5 h-5 text-amber-500" />
            }
            <span className={cn('text-sm font-semibold', isPaid ? 'text-green-700' : 'text-amber-700')}>
              {isPaid ? '결제 완료' : '결제 대기중'}
            </span>
          </div>
          {!isPaid && (
            <button
              onClick={() => setIsPaid(true)}
              className="text-xs text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              결제 완료 처리
            </button>
          )}
        </div>
        {isPaid && c.paid_at && (
          <p className="text-xs text-green-600 mt-1.5">{formatDate(c.paid_at)} 결제</p>
        )}
      </div>

      <Section title="결제 정보">
        <div className="space-y-0">
          <InfoRow label="계약금액 (정가)" value={
            <span className="font-mono">{formatAmount(c.amount)}</span>
          } />
          {c.discount_rate > 0 && (
            <InfoRow label="할인율" value={`${c.discount_rate}%`} />
          )}
          <InfoRow label="실계약금액" value={
            <span className="font-mono font-bold text-blue-700">{formatAmount(c.final_amount)}</span>
          } />
          <InfoRow label="결제 수단" value={c.payment_method ?? '미설정'} />
          <InfoRow label="결제일" value={c.paid_at ? formatDate(c.paid_at) : '—'} />
        </div>
      </Section>
    </div>
  )
}

// ─── 메인 ────────────────────────────────────────────────
export default function ContractDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('개요')
  const c = MOCK_CONTRACT

  const tabContent: Record<string, React.ReactNode> = {
    '개요':     <TabOverview />,
    '갱신 이력': <TabRenewals />,
    '발급 계정': <TabAccounts />,
    '결제':     <TabPayment />,
  }

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link href="/app/contracts"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold text-gray-900">{c.company_name}</h1>
            <span className="text-xs text-gray-400 font-mono">{c.contract_no}</span>
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full border font-medium',
              CONTRACT_STATUS[c.status].cls
            )}>
              {CONTRACT_STATUS[c.status].label}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{c.product_name} · {c.assigned_user_name}</p>
        </div>
        <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200 gap-0.5">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors -mb-px border-b-2',
              activeTab === tab
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 컨텐츠 */}
      {tabContent[activeTab]}
    </div>
  )
}
