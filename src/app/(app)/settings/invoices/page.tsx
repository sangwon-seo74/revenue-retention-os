'use client'

import { useState } from 'react'
import {
  Receipt, Download, Filter, CheckCircle2, XCircle,
  Clock, RefreshCw, ChevronDown, CreditCard, Search
} from 'lucide-react'
import { cn, formatAmount, formatDate } from '@/lib/utils'
import type { TenantInvoice, InvoiceStatus } from '@/types/domain'

// ─── Mock 데이터 ──────────────────────────────────────────
const MOCK_INVOICES: TenantInvoice[] = [
  {
    id: 'inv1', tenant_id: 'tn1', subscription_id: 'sub1', plan_id: 'plan_standard',
    invoice_no: 'INV-2024-0006', billing_cycle: 'monthly',
    period_start: '2024-06-01T00:00:00Z', period_end: '2024-06-30T00:00:00Z',
    amount: 99000, status: 'paid', payment_method: '카드 (VISA ****1234)',
    paid_at: '2024-06-15T10:23:00Z', pg_payment_id: 'pay_xxx', memo: null,
    processed_by: null, due_at: '2024-06-15T00:00:00Z',
    created_at: '2024-06-01T00:00:00Z',
    plan: { id: 'plan_standard', name: 'Standard', code: 'standard', max_users: 10, max_companies: 300, max_messages: 5000, monthly_price: 99000, yearly_price: 990000, is_active: true, created_at: '2024-01-01T00:00:00Z' }
  },
  {
    id: 'inv2', tenant_id: 'tn1', subscription_id: 'sub1', plan_id: 'plan_standard',
    invoice_no: 'INV-2024-0005', billing_cycle: 'monthly',
    period_start: '2024-05-01T00:00:00Z', period_end: '2024-05-31T00:00:00Z',
    amount: 99000, status: 'paid', payment_method: '카드 (VISA ****1234)',
    paid_at: '2024-05-15T09:10:00Z', pg_payment_id: 'pay_yyy', memo: null,
    processed_by: null, due_at: '2024-05-15T00:00:00Z',
    created_at: '2024-05-01T00:00:00Z',
    plan: { id: 'plan_standard', name: 'Standard', code: 'standard', max_users: 10, max_companies: 300, max_messages: 5000, monthly_price: 99000, yearly_price: 990000, is_active: true, created_at: '2024-01-01T00:00:00Z' }
  },
  {
    id: 'inv3', tenant_id: 'tn1', subscription_id: 'sub1', plan_id: 'plan_standard',
    invoice_no: 'INV-2024-0004', billing_cycle: 'monthly',
    period_start: '2024-04-01T00:00:00Z', period_end: '2024-04-30T00:00:00Z',
    amount: 99000, status: 'failed', payment_method: '카드 (VISA ****1234)',
    paid_at: null, pg_payment_id: null, memo: '카드 한도 초과',
    processed_by: null, due_at: '2024-04-15T00:00:00Z',
    created_at: '2024-04-01T00:00:00Z',
    plan: { id: 'plan_standard', name: 'Standard', code: 'standard', max_users: 10, max_companies: 300, max_messages: 5000, monthly_price: 99000, yearly_price: 990000, is_active: true, created_at: '2024-01-01T00:00:00Z' }
  },
  {
    id: 'inv4', tenant_id: 'tn1', subscription_id: 'sub1', plan_id: 'plan_standard',
    invoice_no: 'INV-2024-0003', billing_cycle: 'monthly',
    period_start: '2024-03-01T00:00:00Z', period_end: '2024-03-31T00:00:00Z',
    amount: 99000, status: 'paid', payment_method: '카드 (VISA ****1234)',
    paid_at: '2024-03-15T11:44:00Z', pg_payment_id: 'pay_zzz', memo: null,
    processed_by: null, due_at: '2024-03-15T00:00:00Z',
    created_at: '2024-03-01T00:00:00Z',
    plan: { id: 'plan_standard', name: 'Standard', code: 'standard', max_users: 10, max_companies: 300, max_messages: 5000, monthly_price: 99000, yearly_price: 990000, is_active: true, created_at: '2024-01-01T00:00:00Z' }
  },
  {
    id: 'inv5', tenant_id: 'tn1', subscription_id: 'sub1', plan_id: 'plan_standard',
    invoice_no: 'INV-2024-0002', billing_cycle: 'monthly',
    period_start: '2024-02-01T00:00:00Z', period_end: '2024-02-29T00:00:00Z',
    amount: 99000, status: 'refunded', payment_method: '카드 (VISA ****1234)',
    paid_at: '2024-02-15T08:30:00Z', pg_payment_id: 'pay_aaa', memo: '요청에 의한 환불',
    processed_by: null, due_at: '2024-02-15T00:00:00Z',
    created_at: '2024-02-01T00:00:00Z',
    plan: { id: 'plan_standard', name: 'Standard', code: 'standard', max_users: 10, max_companies: 300, max_messages: 5000, monthly_price: 99000, yearly_price: 990000, is_active: true, created_at: '2024-01-01T00:00:00Z' }
  },
  {
    id: 'inv6', tenant_id: 'tn1', subscription_id: 'sub1', plan_id: 'plan_standard',
    invoice_no: 'INV-2024-0001', billing_cycle: 'monthly',
    period_start: '2024-01-01T00:00:00Z', period_end: '2024-01-31T00:00:00Z',
    amount: 99000, status: 'paid', payment_method: '카드 (VISA ****1234)',
    paid_at: '2024-01-15T14:02:00Z', pg_payment_id: 'pay_bbb', memo: null,
    processed_by: null, due_at: '2024-01-15T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    plan: { id: 'plan_standard', name: 'Standard', code: 'standard', max_users: 10, max_companies: 300, max_messages: 5000, monthly_price: 99000, yearly_price: 990000, is_active: true, created_at: '2024-01-01T00:00:00Z' }
  },
]

// ─── 상태 배지 ────────────────────────────────────────────
const STATUS_CONFIG: Record<InvoiceStatus, { label: string; cls: string; icon: React.ElementType }> = {
  paid:     { label: '결제완료', cls: 'bg-green-50 text-green-700 border-green-200',  icon: CheckCircle2 },
  pending:  { label: '결제대기', cls: 'bg-amber-50 text-amber-700 border-amber-200',  icon: Clock },
  failed:   { label: '결제실패', cls: 'bg-red-50 text-red-700 border-red-200',        icon: XCircle },
  refunded: { label: '환불',     cls: 'bg-gray-100 text-gray-600 border-gray-200',    icon: RefreshCw },
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium', cfg.cls)}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

// ─── 인보이스 행 ──────────────────────────────────────────
function InvoiceRow({ invoice }: { invoice: TenantInvoice }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <tr
        onClick={() => setOpen(!open)}
        className="hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <td className="px-5 py-3.5">
          <p className="text-sm font-medium text-gray-900">{invoice.invoice_no}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDate(invoice.period_start)} ~ {formatDate(invoice.period_end)}
          </p>
        </td>
        <td className="px-5 py-3.5">
          <p className="text-xs text-gray-600">{invoice.plan?.name ?? '—'}</p>
          <p className="text-xs text-gray-400">
            {invoice.billing_cycle === 'monthly' ? '월간' : '연간'} 구독
          </p>
        </td>
        <td className="px-5 py-3.5 text-right">
          <p className={cn(
            'text-sm font-bold',
            invoice.status === 'refunded' ? 'text-gray-400 line-through' : 'text-gray-900'
          )}>
            {formatAmount(invoice.amount)}
          </p>
        </td>
        <td className="px-5 py-3.5">
          <StatusBadge status={invoice.status} />
        </td>
        <td className="px-5 py-3.5 text-xs text-gray-500">
          {invoice.paid_at ? formatDate(invoice.paid_at) : '—'}
        </td>
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={e => { e.stopPropagation(); alert('영수증 다운로드') }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="영수증 다운로드"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <ChevronDown className={cn(
              'w-3.5 h-3.5 text-gray-400 transition-transform',
              open && 'rotate-180'
            )} />
          </div>
        </td>
      </tr>
      {open && (
        <tr className="bg-gray-50/50">
          <td colSpan={6} className="px-5 py-4 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-gray-400">결제 수단</span>
                <p className="text-gray-800 mt-0.5 font-medium">{invoice.payment_method ?? '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">PG 결제번호</span>
                <p className="text-gray-800 mt-0.5 font-medium font-mono">{invoice.pg_payment_id ?? '—'}</p>
              </div>
              <div>
                <span className="text-gray-400">비고</span>
                <p className="text-gray-800 mt-0.5 font-medium">{invoice.memo ?? '—'}</p>
              </div>
            </div>
            {invoice.status === 'failed' && (
              <div className="mt-3 flex items-center gap-2">
                <button className="text-xs text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700">
                  결제 재시도
                </button>
                <button className="text-xs text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100">
                  결제 수단 변경
                </button>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

// ─── 메인 ────────────────────────────────────────────────
export default function InvoicesPage() {
  const [invoices] = useState(MOCK_INVOICES)
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')

  const filtered = statusFilter === 'all'
    ? invoices
    : invoices.filter(i => i.status === statusFilter)

  const totalPaid = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0)

  const failedCount = invoices.filter(i => i.status === 'failed').length

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* 헤더 */}
      <div>
        <h1 className="text-lg font-bold text-gray-900">결제 이력</h1>
        <p className="text-sm text-gray-500 mt-0.5">구독 결제 내역 및 영수증을 확인합니다</p>
      </div>

      {/* 실패 알림 */}
      {failedCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">결제 실패 {failedCount}건이 있습니다</p>
            <p className="text-xs text-red-600 mt-0.5">결제 수단을 확인하고 재시도해 주세요</p>
          </div>
          <button className="text-xs text-white bg-red-600 px-3 py-1.5 rounded-lg hover:bg-red-700">
            확인하기
          </button>
        </div>
      )}

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500">전체 결제</p>
          <p className="text-xl font-bold text-gray-900">{invoices.length}건</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <p className="text-xs text-blue-600">총 결제금액</p>
          <p className="text-xl font-bold text-blue-700">{formatAmount(totalPaid)}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-xs text-green-600">결제 성공률</p>
          <p className="text-xl font-bold text-green-700">
            {Math.round(invoices.filter(i => i.status === 'paid').length / invoices.length * 100)}%
          </p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'paid', 'pending', 'failed', 'refunded'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border font-medium transition-colors',
              statusFilter === s
                ? 'bg-gray-900 text-white border-gray-900'
                : 'text-gray-500 border-gray-200 hover:border-gray-300 bg-white'
            )}
          >
            {s === 'all' ? '전체' : STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">인보이스</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">플랜</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500">금액</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">상태</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">결제일</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(inv => (
              <InvoiceRow key={inv.id} invoice={inv} />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">결제 이력이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
