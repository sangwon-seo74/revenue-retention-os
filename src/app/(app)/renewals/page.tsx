'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  RefreshCw, AlertCircle, AlertTriangle, CheckCircle2,
  MessageSquare, ChevronRight, Filter, Users, Search
} from 'lucide-react'
import { cn, formatAmount, formatDate, calcDday } from '@/lib/utils'
import type { RenewalStatus, RiskLevel } from '@/types/domain'

// ─── Mock 데이터 ──────────────────────────────────────────
type RenewalCard = {
  id: string
  company_name: string
  product_name: string
  expires_at: string
  final_amount: number
  risk: RiskLevel
  status: RenewalStatus
  assigned_user: string
}

const MOCK_RENEWALS: RenewalCard[] = [
  { id: 'r1', company_name: '삼성SDS(주)',  product_name: '고객관리 Pro',      expires_at: '2024-06-17T00:00:00Z', final_amount: 12_000_000, risk: 'high',   status: 'contacted',   assigned_user: '김영업' },
  { id: 'r2', company_name: 'KT(주)',        product_name: '고객관리 Standard', expires_at: '2024-06-18T00:00:00Z', final_amount: 8_400_000,  risk: 'high',   status: 'negotiating', assigned_user: '박상담' },
  { id: 'r3', company_name: '현대글로비스', product_name: '고객관리 Pro',      expires_at: '2024-06-20T00:00:00Z', final_amount: 6_000_000,  risk: 'medium', status: 'contacted',   assigned_user: '김영업' },
  { id: 'r4', company_name: 'LG전자(주)',    product_name: '고객관리 Pro',      expires_at: '2024-06-22T00:00:00Z', final_amount: 9_600_000,  risk: 'medium', status: 'pending',     assigned_user: '이담당' },
  { id: 'r5', company_name: 'GS칼텍스',     product_name: '고객관리 Standard', expires_at: '2024-07-01T00:00:00Z', final_amount: 4_800_000,  risk: 'low',    status: 'pending',     assigned_user: '김영업' },
  { id: 'r6', company_name: 'SK하이닉스',   product_name: '고객관리 Pro',      expires_at: '2024-07-10T00:00:00Z', final_amount: 14_400_000, risk: 'low',    status: 'pending',     assigned_user: '이담당' },
  { id: 'r7', company_name: '포스코',        product_name: '고객관리 Standard', expires_at: '2024-07-31T00:00:00Z', final_amount: 7_200_000,  risk: 'low',    status: 'pending',     assigned_user: '박상담' },
  { id: 'r8', company_name: '롯데케미칼',   product_name: '고객관리 Standard', expires_at: '2024-07-05T00:00:00Z', final_amount: 3_600_000,  risk: 'medium', status: 'contacted',   assigned_user: '최영업' },
  { id: 'r9', company_name: '두산에너빌',   product_name: '고객관리 Standard', expires_at: '2024-08-15T00:00:00Z', final_amount: 4_200_000,  risk: 'low',    status: 'pending',     assigned_user: '정영업' },
  { id: 'r10',company_name: 'CJ제일제당',   product_name: '고객관리 Pro',      expires_at: '2024-08-31T00:00:00Z', final_amount: 8_400_000,  risk: 'low',    status: 'pending',     assigned_user: '김영업' },
]

// ─── 칸반 버킷 ───────────────────────────────────────────
const BUCKETS = [
  { key: 'D-90', label: 'D-90', from: 61, to: 90, color: 'border-gray-200 bg-gray-50' },
  { key: 'D-60', label: 'D-60', from: 31, to: 60, color: 'border-gray-200 bg-gray-50' },
  { key: 'D-30', label: 'D-30', from: 15, to: 30, color: 'border-amber-200 bg-amber-50' },
  { key: 'D-14', label: 'D-14', from: 8,  to: 14, color: 'border-amber-300 bg-amber-50' },
  { key: 'D-7',  label: 'D-7',  from: 0,  to: 7,  color: 'border-red-300 bg-red-50' },
]

const RISK_CFG: Record<RiskLevel, { cls: string; borderCls: string; icon: React.ElementType }> = {
  high:   { cls: 'bg-red-50 text-red-600 border-red-200',     borderCls: 'border-l-red-500',    icon: AlertCircle },
  medium: { cls: 'bg-amber-50 text-amber-600 border-amber-200', borderCls: 'border-l-amber-400', icon: AlertTriangle },
  low:    { cls: 'bg-green-50 text-green-600 border-green-200', borderCls: 'border-l-green-400', icon: CheckCircle2 },
}

const STATUS_LABEL: Record<RenewalStatus, string> = {
  pending: '대기', contacted: '접촉', negotiating: '협의중', won: '완료', lost: '이탈'
}
const STATUS_CLS: Record<RenewalStatus, string> = {
  pending:     'bg-gray-100 text-gray-500',
  contacted:   'bg-blue-50 text-blue-600',
  negotiating: 'bg-amber-50 text-amber-600',
  won:         'bg-green-50 text-green-600',
  lost:        'bg-red-50 text-red-600',
}

// ─── 갱신 카드 ────────────────────────────────────────────
function RenewalKanbanCard({ renewal }: { renewal: RenewalCard }) {
  const dday = calcDday(renewal.expires_at)
  const risk = RISK_CFG[renewal.risk]
  const RiskIcon = risk.icon

  return (
    <Link href={`/app/renewals/${renewal.id}`}
      className={cn(
        'block bg-white rounded-xl border border-gray-200 border-l-4 p-3 shadow-sm',
        'hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer',
        risk.borderCls
      )}>
      {/* 헤더: 회사명 + 위험도 */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-gray-900 leading-tight">{renewal.company_name}</p>
        <span className={cn('inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full border font-medium shrink-0', risk.cls)}>
          <RiskIcon className="w-2.5 h-2.5" />
          {renewal.risk === 'high' ? '위험' : renewal.risk === 'medium' ? '주의' : '안전'}
        </span>
      </div>

      {/* 제품명 */}
      <p className="text-[10px] text-gray-400 truncate mb-2">{renewal.product_name}</p>

      {/* 금액 */}
      <p className="text-sm font-bold text-gray-800 font-mono mb-2">
        {formatAmount(renewal.final_amount)}
      </p>

      {/* D-day + 담당자 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={cn(
            'text-[10px] font-bold font-mono px-1.5 py-0.5 rounded',
            dday <= 7  ? 'bg-red-100 text-red-600' :
            dday <= 14 ? 'bg-amber-100 text-amber-600' :
                         'bg-gray-100 text-gray-500'
          )}>
            D-{dday}
          </span>
          <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-medium', STATUS_CLS[renewal.status])}>
            {STATUS_LABEL[renewal.status]}
          </span>
        </div>
        <span className="text-[10px] text-gray-400">{renewal.assigned_user}</span>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-1 mt-2.5 pt-2.5 border-t border-gray-50">
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation() }}
          className="flex-1 flex items-center justify-center gap-1 text-[10px] text-blue-600 border border-blue-200 py-1 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <MessageSquare className="w-2.5 h-2.5" /> 메시지
        </button>
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation() }}
          className="flex-1 flex items-center justify-center gap-1 text-[10px] text-gray-500 border border-gray-200 py-1 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="w-2.5 h-2.5" /> 상세
        </button>
      </div>
    </Link>
  )
}

// ─── 메인 ────────────────────────────────────────────────
export default function RenewalsPage() {
  const [userFilter, setUserFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all')

  const filtered = MOCK_RENEWALS.filter(r => {
    const matchUser = userFilter === 'all' || r.assigned_user === userFilter
    const matchRisk = riskFilter === 'all' || r.risk === riskFilter
    return matchUser && matchRisk
  })

  const bucketData = BUCKETS.map(b => ({
    ...b,
    cards: filtered.filter(r => {
      const d = calcDday(r.expires_at)
      return d >= b.from && d <= b.to
    }),
  }))

  const totalAmount = filtered.reduce((s, r) => s + r.final_amount, 0)
  const users = Array.from(new Set(MOCK_RENEWALS.map(r => r.assigned_user)))

  return (
    <div className="p-6 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" /> 갱신 관리
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            진행 중 {filtered.length}건 · 예상 ARR {formatAmount(totalAmount)}
          </p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* 위험도 */}
        <div className="flex gap-1.5">
          {(['all', 'high', 'medium', 'low'] as const).map(r => (
            <button key={r} onClick={() => setRiskFilter(r)}
              className={cn('text-xs px-3 py-1.5 rounded-full border font-medium transition-colors',
                riskFilter === r ? 'bg-gray-900 text-white border-gray-900' : 'text-gray-500 border-gray-200 bg-white hover:border-gray-300')}>
              {r === 'all' ? '위험도 전체' : r === 'high' ? '⚠ 위험' : r === 'medium' ? '△ 주의' : '✓ 안전'}
            </button>
          ))}
        </div>
        {/* 담당자 */}
        <div className="flex gap-1.5">
          <button onClick={() => setUserFilter('all')}
            className={cn('text-xs px-3 py-1.5 rounded-full border font-medium transition-colors',
              userFilter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-500 border-gray-200 bg-white')}>
            전체
          </button>
          {users.map(u => (
            <button key={u} onClick={() => setUserFilter(u)}
              className={cn('text-xs px-3 py-1.5 rounded-full border font-medium transition-colors',
                userFilter === u ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-500 border-gray-200 bg-white')}>
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* 칸반 보드 */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {bucketData.map(bucket => (
          <div key={bucket.key} className="shrink-0 w-[240px]">
            {/* 버킷 헤더 */}
            <div className={cn('flex items-center justify-between px-3 py-2.5 rounded-t-xl border border-b-0', bucket.color)}>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-xs font-bold',
                  bucket.key === 'D-7'  ? 'text-red-600' :
                  bucket.key === 'D-14' ? 'text-amber-600' :
                  bucket.key === 'D-30' ? 'text-amber-500' : 'text-gray-600'
                )}>
                  {bucket.label}
                </span>
                <span className="text-xs text-gray-400">({bucket.cards.length}건)</span>
              </div>
              {bucket.cards.length > 0 && (
                <span className="text-[10px] text-gray-500">
                  {formatAmount(bucket.cards.reduce((s, c) => s + c.final_amount, 0)).replace('원', '')}
                </span>
              )}
            </div>

            {/* 카드 목록 */}
            <div className={cn('min-h-[200px] p-2 space-y-2 rounded-b-xl border', bucket.color)}>
              {bucket.cards.map(r => <RenewalKanbanCard key={r.id} renewal={r} />)}
              {bucket.cards.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-xs text-gray-300">없음</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
