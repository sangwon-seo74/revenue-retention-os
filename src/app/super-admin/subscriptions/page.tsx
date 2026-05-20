'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, Clock, CheckCircle2,
  XCircle, ChevronRight
} from 'lucide-react'
import { cn, formatAmount, formatDate } from '@/lib/utils'
import type { SubscriptionStatus } from '@/types/domain'

// ─── Mock 데이터 ──────────────────────────────────────────
type SubRow = {
  id: string
  tenant_id: string
  tenant_name: string
  plan: string
  plan_code: string
  billing_cycle: string
  status: SubscriptionStatus
  started_at: string
  expires_at: string
  next_billing_at: string | null
  mrr: number
  cancel_reason?: string | null
}

const MOCK_SUBS: SubRow[] = [
  { id: 's1', tenant_id: 't1', tenant_name: '(주)테크솔루션', plan: 'Pro', plan_code: 'pro', billing_cycle: 'monthly', status: 'active', started_at: '2024-01-15T00:00:00Z', expires_at: '2025-01-15T00:00:00Z', next_billing_at: '2024-07-15T00:00:00Z', mrr: 249000 },
  { id: 's2', tenant_id: 't6', tenant_name: '코리아크레딧(주)', plan: 'Pro', plan_code: 'pro', billing_cycle: 'yearly', status: 'active', started_at: '2024-04-01T00:00:00Z', expires_at: '2025-03-31T00:00:00Z', next_billing_at: '2025-03-31T00:00:00Z', mrr: 249000 },
  { id: 's3', tenant_id: 't2', tenant_name: '한국신용정보(주)', plan: 'Standard', plan_code: 'standard', billing_cycle: 'monthly', status: 'active', started_at: '2024-02-01T00:00:00Z', expires_at: '2024-09-30T00:00:00Z', next_billing_at: '2024-07-01T00:00:00Z', mrr: 99000 },
  { id: 's4', tenant_id: 't7', tenant_name: '(주)알파리서치', plan: 'Standard', plan_code: 'standard', billing_cycle: 'monthly', status: 'active', started_at: '2024-05-10T00:00:00Z', expires_at: '2025-05-10T00:00:00Z', next_billing_at: '2024-07-10T00:00:00Z', mrr: 99000 },
  { id: 's5', tenant_id: 't3', tenant_name: '(주)비즈데이터', plan: 'Standard', plan_code: 'standard', billing_cycle: 'monthly', status: 'past_due', started_at: '2024-02-15T00:00:00Z', expires_at: '2024-06-15T00:00:00Z', next_billing_at: null, mrr: 99000 },
  { id: 's6', tenant_id: 't4', tenant_name: '대한데이터서비스', plan: 'Free', plan_code: 'free', billing_cycle: 'monthly', status: 'trialing', started_at: '2024-06-01T00:00:00Z', expires_at: '2024-07-01T00:00:00Z', next_billing_at: null, mrr: 0 },
  { id: 's7', tenant_id: 't5', tenant_name: '(주)스마트인사이트', plan: 'Standard', plan_code: 'standard', billing_cycle: 'monthly', status: 'cancelled', started_at: '2023-06-01T00:00:00Z', expires_at: '2024-05-31T00:00:00Z', next_billing_at: null, mrr: 0, cancel_reason: '서비스 불만' },
]

const STATUS_CFG: Record<SubscriptionStatus, { label: string; cls: string; icon: React.ElementType }> = {
  active:    { label: '활성',     cls: 'bg-green-500/15 text-green-400 border-green-500/30',  icon: CheckCircle2 },
  trialing:  { label: '체험중',   cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30',    icon: Clock },
  past_due:  { label: '결제미납', cls: 'bg-red-500/15 text-red-400 border-red-500/30',       icon: AlertTriangle },
  cancelled: { label: '해지',     cls: 'bg-gray-500/15 text-gray-500 border-gray-600/30',    icon: XCircle },
}

function PlanBadge({ plan }: { plan: string }) {
  const cls = plan === 'Pro'
    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    : plan === 'Standard'
    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    : 'bg-gray-500/20 text-gray-400 border-gray-600/30'
  return (
    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border font-medium', cls)}>{plan}</span>
  )
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const cfg = STATUS_CFG[status]
  const Icon = cfg.icon
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-medium', cfg.cls)}>
      <Icon className="w-2.5 h-2.5" /> {cfg.label}
    </span>
  )
}

// ─── 메인 ────────────────────────────────────────────────
export default function SubscriptionsPage() {
  const [subs] = useState(MOCK_SUBS)
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all')

  const filtered = statusFilter === 'all' ? subs : subs.filter(s => s.status === statusFilter)

  const counts = {
    active:   subs.filter(s => s.status === 'active').length,
    trialing: subs.filter(s => s.status === 'trialing').length,
    past_due: subs.filter(s => s.status === 'past_due').length,
    cancelled: subs.filter(s => s.status === 'cancelled').length,
  }
  const activeMrr = subs.filter(s => s.status === 'active').reduce((sum, s) => sum + s.mrr, 0)

  // 7일/30일 만료 임박 분류
  const expiring7  = subs.filter(s => s.status === 'active' && Math.ceil((new Date(s.expires_at).getTime() - Date.now()) / 86400000) <= 7)
  const expiring30 = subs.filter(s => s.status === 'active' && Math.ceil((new Date(s.expires_at).getTime() - Date.now()) / 86400000) <= 30)

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">구독 관리</h1>
        <p className="text-sm text-gray-400 mt-0.5">활성 MRR {formatAmount(activeMrr)} · 전체 {subs.length}건</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '활성', count: counts.active, color: 'border-green-700/40 bg-green-900/20', textColor: 'text-green-400' },
          { label: '체험중', count: counts.trialing, color: 'border-blue-700/40 bg-blue-900/20', textColor: 'text-blue-400' },
          { label: '결제미납', count: counts.past_due, color: 'border-red-700/40 bg-red-900/20', textColor: 'text-red-400' },
          { label: '해지', count: counts.cancelled, color: 'border-gray-700/40 bg-gray-800/40', textColor: 'text-gray-500' },
        ].map(c => (
          <div key={c.label} className={cn('rounded-xl border px-4 py-3.5', c.color)}>
            <p className="text-xs text-gray-400">{c.label}</p>
            <p className={cn('text-2xl font-bold mt-0.5', c.textColor)}>{c.count}</p>
          </div>
        ))}
      </div>

      {/* 만료 임박 알림 */}
      {expiring7.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-900/20 border border-amber-700/40 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-300">7일 내 만료 {expiring7.length}건</p>
            <p className="text-xs text-amber-500 mt-0.5">{expiring7.map(s => s.tenant_name).join(', ')}</p>
          </div>
          <span className="text-xs text-amber-400">{expiring30.length}건 (30일 내)</span>
        </div>
      )}

      {/* 필터 */}
      <div className="flex gap-1.5">
        {(['all', 'active', 'trialing', 'past_due', 'cancelled'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors',
              statusFilter === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-400 border-gray-700 hover:border-gray-600 hover:text-gray-300'
            )}
          >
            {s === 'all' ? '전체' : STATUS_CFG[s].label}
            {s !== 'all' && <span className="ml-1 text-[10px]">{counts[s]}</span>}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700/50">
              {['테넌트', '플랜', '결제주기', '상태', '시작일', '만료일', 'MRR', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/30">
            {filtered.map(s => {
              const daysLeft = Math.ceil((new Date(s.expires_at).getTime() - Date.now()) / 86400000)
              const isExpiringSoon = s.status === 'active' && daysLeft <= 14
              return (
                <tr key={s.id} className={cn(
                  'hover:bg-white/3 transition-colors group',
                  isExpiringSoon && 'bg-amber-950/10'
                )}>
                  <td className="px-4 py-3.5">
                    <Link href={`/super-admin/tenants/${s.tenant_id}`}
                      className="text-sm font-medium text-gray-200 hover:text-blue-400 transition-colors flex items-center gap-1.5">
                      {s.tenant_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5"><PlanBadge plan={s.plan} /></td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-gray-400">{s.billing_cycle === 'monthly' ? '월간' : '연간'}</span>
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-gray-400 font-mono">{formatDate(s.started_at)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <span className={cn('text-xs font-mono', isExpiringSoon ? 'text-amber-400 font-bold' : 'text-gray-300')}>
                        {formatDate(s.expires_at)}
                      </span>
                      {isExpiringSoon && (
                        <span className="block text-[10px] text-amber-500">D-{daysLeft}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn('text-xs font-mono font-bold', s.mrr > 0 ? 'text-blue-400' : 'text-gray-600')}>
                      {s.mrr > 0 ? formatAmount(s.mrr) : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/super-admin/tenants/${s.tenant_id}`}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      관리 <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
