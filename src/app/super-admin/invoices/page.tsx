'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, XCircle, Clock, RefreshCw,
  AlertTriangle, ChevronRight
} from 'lucide-react'
import { cn, formatAmount, formatDate } from '@/lib/utils'
import type { InvoiceStatus } from '@/types/domain'

// ─── Mock 데이터 ──────────────────────────────────────────
type InvoiceRow = {
  id: string
  invoice_no: string
  tenant_id: string
  tenant_name: string
  plan: string
  billing_cycle: string
  period_start: string
  period_end: string
  amount: number
  status: InvoiceStatus
  payment_method: string | null
  paid_at: string | null
  due_at: string | null
  memo: string | null
}

const MOCK_INVOICES: InvoiceRow[] = [
  { id: 'inv1', invoice_no: 'INV-2024-0018', tenant_id: 't1', tenant_name: '(주)테크솔루션', plan: 'Pro', billing_cycle: 'monthly', period_start: '2024-06-01T00:00:00Z', period_end: '2024-06-30T00:00:00Z', amount: 249000, status: 'paid', payment_method: '카드', paid_at: '2024-06-15T10:00:00Z', due_at: '2024-06-15T00:00:00Z', memo: null },
  { id: 'inv2', invoice_no: 'INV-2024-0017', tenant_id: 't6', tenant_name: '코리아크레딧(주)', plan: 'Pro', billing_cycle: 'yearly', period_start: '2024-04-01T00:00:00Z', period_end: '2025-03-31T00:00:00Z', amount: 2490000, status: 'paid', payment_method: '계좌이체', paid_at: '2024-04-02T14:00:00Z', due_at: '2024-04-02T00:00:00Z', memo: null },
  { id: 'inv3', invoice_no: 'INV-2024-0016', tenant_id: 't3', tenant_name: '(주)비즈데이터', plan: 'Standard', billing_cycle: 'monthly', period_start: '2024-06-01T00:00:00Z', period_end: '2024-06-30T00:00:00Z', amount: 99000, status: 'failed', payment_method: '카드', paid_at: null, due_at: '2024-06-10T00:00:00Z', memo: '카드 한도 초과' },
  { id: 'inv4', invoice_no: 'INV-2024-0015', tenant_id: 't2', tenant_name: '한국신용정보(주)', plan: 'Standard', billing_cycle: 'monthly', period_start: '2024-06-01T00:00:00Z', period_end: '2024-06-30T00:00:00Z', amount: 99000, status: 'pending', payment_method: null, paid_at: null, due_at: '2024-07-01T00:00:00Z', memo: null },
  { id: 'inv5', invoice_no: 'INV-2024-0014', tenant_id: 't7', tenant_name: '(주)알파리서치', plan: 'Standard', billing_cycle: 'monthly', period_start: '2024-06-01T00:00:00Z', period_end: '2024-06-30T00:00:00Z', amount: 99000, status: 'paid', payment_method: '카드', paid_at: '2024-06-10T09:00:00Z', due_at: '2024-06-10T00:00:00Z', memo: null },
  { id: 'inv6', invoice_no: 'INV-2024-0013', tenant_id: 't1', tenant_name: '(주)테크솔루션', plan: 'Pro', billing_cycle: 'monthly', period_start: '2024-05-01T00:00:00Z', period_end: '2024-05-31T00:00:00Z', amount: 249000, status: 'paid', payment_method: '카드', paid_at: '2024-05-15T10:00:00Z', due_at: '2024-05-15T00:00:00Z', memo: null },
  { id: 'inv7', invoice_no: 'INV-2024-0012', tenant_id: 't5', tenant_name: '(주)스마트인사이트', plan: 'Standard', billing_cycle: 'monthly', period_start: '2024-05-01T00:00:00Z', period_end: '2024-05-31T00:00:00Z', amount: 99000, status: 'refunded', payment_method: '카드', paid_at: '2024-05-15T00:00:00Z', due_at: '2024-05-15T00:00:00Z', memo: '고객 요청 환불' },
]

const STATUS_CFG: Record<InvoiceStatus, { label: string; cls: string; icon: React.ElementType }> = {
  paid:     { label: '결제완료', cls: 'bg-green-500/15 text-green-400 border-green-500/30',  icon: CheckCircle2 },
  pending:  { label: '결제대기', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: Clock },
  failed:   { label: '결제실패', cls: 'bg-red-500/15 text-red-400 border-red-500/30',       icon: XCircle },
  refunded: { label: '환불',     cls: 'bg-gray-500/15 text-gray-400 border-gray-600/30',    icon: RefreshCw },
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const cfg = STATUS_CFG[status]
  const Icon = cfg.icon
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-medium', cfg.cls)}>
      <Icon className="w-2.5 h-2.5" /> {cfg.label}
    </span>
  )
}

// ─── 메인 ────────────────────────────────────────────────
export default function InvoicesPage() {
  const [invoices] = useState(MOCK_INVOICES)
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')

  const filtered = statusFilter === 'all' ? invoices : invoices.filter(i => i.status === statusFilter)

  const totalPaid   = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const totalFailed = invoices.filter(i => i.status === 'failed').length
  const totalPending = invoices.filter(i => i.status === 'pending').length

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">결제 관리</h1>
        <p className="text-sm text-gray-400 mt-0.5">총 수납 {formatAmount(totalPaid)}</p>
      </div>

      {/* 실패/대기 알림 */}
      {(totalFailed > 0 || totalPending > 0) && (
        <div className="flex items-center gap-3 p-4 bg-red-950/20 border border-red-800/40 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="flex-1 text-sm text-red-300">
            {totalFailed > 0 && <span className="font-semibold">결제 실패 {totalFailed}건</span>}
            {totalFailed > 0 && totalPending > 0 && <span className="text-red-500 mx-2">·</span>}
            {totalPending > 0 && <span>결제 대기 {totalPending}건</span>}
          </div>
        </div>
      )}

      {/* 요약 카드 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '결제완료', count: invoices.filter(i => i.status === 'paid').length, color: 'text-green-400', bg: 'bg-green-900/20 border-green-700/30' },
          { label: '결제대기', count: totalPending, color: 'text-amber-400', bg: 'bg-amber-900/20 border-amber-700/30' },
          { label: '결제실패', count: totalFailed, color: 'text-red-400', bg: 'bg-red-900/20 border-red-700/30' },
          { label: '환불', count: invoices.filter(i => i.status === 'refunded').length, color: 'text-gray-400', bg: 'bg-gray-800/40 border-gray-700/30' },
        ].map(c => (
          <div key={c.label} className={cn('rounded-xl border px-4 py-3.5', c.bg)}>
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className={cn('text-2xl font-bold mt-0.5', c.color)}>{c.count}</p>
          </div>
        ))}
      </div>

      {/* 필터 */}
      <div className="flex gap-1.5">
        {(['all', 'paid', 'pending', 'failed', 'refunded'] as const).map(s => (
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
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700/50">
              {['인보이스', '테넌트', '플랜', '금액', '상태', '결제일', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/30">
            {filtered.map(inv => (
              <tr key={inv.id} className="hover:bg-white/3 transition-colors group">
                <td className="px-4 py-3.5">
                  <p className="text-xs font-mono text-gray-300">{inv.invoice_no}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    {inv.billing_cycle === 'monthly' ? '월간' : '연간'} ·{' '}
                    {formatDate(inv.period_start)} ~ {formatDate(inv.period_end)}
                  </p>
                </td>
                <td className="px-4 py-3.5">
                  <Link href={`/super-admin/tenants/${inv.tenant_id}`}
                    className="text-sm text-gray-200 hover:text-blue-400 transition-colors">
                    {inv.tenant_name}
                  </Link>
                </td>
                <td className="px-4 py-3.5">
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full border font-medium',
                    inv.plan === 'Pro'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  )}>
                    {inv.plan}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <p className={cn(
                    'text-sm font-bold font-mono',
                    inv.status === 'refunded' ? 'text-gray-500 line-through' : 'text-white'
                  )}>
                    {formatAmount(inv.amount)}
                  </p>
                </td>
                <td className="px-4 py-3.5">
                  <div>
                    <StatusBadge status={inv.status} />
                    {inv.memo && <p className="text-[10px] text-gray-500 mt-0.5">{inv.memo}</p>}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-xs text-gray-400 font-mono">
                    {inv.paid_at ? formatDate(inv.paid_at) : '—'}
                  </p>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/super-admin/invoices/${inv.id}`}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
                      상세 <ChevronRight className="w-3 h-3" />
                    </Link>
                    {inv.status === 'failed' && (
                      <button className="text-xs text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md hover:bg-amber-500/10">
                        재시도
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
