'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, RefreshCw,
  Building2, Receipt, CreditCard, FileText, AlertTriangle, Save
} from 'lucide-react'
import { cn, formatAmount, formatDate } from '@/lib/utils'
import type { InvoiceStatus } from '@/types/domain'

// ─── Mock 데이터 ──────────────────────────────────────────
const MOCK_INVOICE = {
  id: 'inv3',
  invoice_no: 'INV-2024-0016',
  tenant_id: 't3',
  tenant_name: '(주)비즈데이터',
  plan: 'Standard',
  billing_cycle: 'monthly',
  period_start: '2024-06-01T00:00:00Z',
  period_end: '2024-06-30T00:00:00Z',
  amount: 99000,
  status: 'failed' as InvoiceStatus,
  payment_method: '카드 (****5678)',
  paid_at: null as string | null,
  due_at: '2024-06-10T00:00:00Z',
  pg_payment_id: null as string | null,
  memo: '카드 한도 초과',
  created_at: '2024-06-01T00:00:00Z',
}

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
    <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium', cfg.cls)}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  )
}

// ─── 메인 ────────────────────────────────────────────────
export default function InvoiceDetailPage(_props: { params: Promise<{ id: string }> }) {
  const [invoice, setInvoice] = useState(MOCK_INVOICE)
  const [memo, setMemo] = useState(invoice.memo ?? '')
  const [processing, setProcessing] = useState(false)
  const [processed, setProcessed] = useState(false)

  const handleManualPay = () => {
    if (!confirm(`${invoice.tenant_name}의 ${formatAmount(invoice.amount)} 결제를 수동으로 완료 처리할까요?`)) return
    setProcessing(true)
    setTimeout(() => {
      setInvoice(prev => ({ ...prev, status: 'paid', paid_at: new Date().toISOString(), pg_payment_id: 'MANUAL-' + Date.now() }))
      setProcessing(false)
      setProcessed(true)
    }, 1000)
  }

  const handleRefund = () => {
    if (!confirm(`${formatAmount(invoice.amount)}를 환불 처리할까요?`)) return
    setInvoice(prev => ({ ...prev, status: 'refunded' }))
  }

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link href="/super-admin/invoices"
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white">{invoice.invoice_no}</h1>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDate(invoice.period_start)} ~ {formatDate(invoice.period_end)} 구독료
          </p>
        </div>
      </div>

      {/* 결제 실패 경고 */}
      {invoice.status === 'failed' && !processed && (
        <div className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-800/40 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-300">결제가 실패했습니다</p>
            <p className="text-xs text-red-400/80 mt-0.5">{invoice.memo}</p>
          </div>
        </div>
      )}

      {processed && (
        <div className="flex items-center gap-2 p-4 bg-green-950/20 border border-green-800/40 rounded-xl text-green-300 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          수동 결제 처리 완료
        </div>
      )}

      {/* 인보이스 정보 */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-700/50">
          <Receipt className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-semibold text-gray-200">인보이스 정보</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-700/30">
            <span className="text-xs text-gray-500">테넌트</span>
            <Link href={`/super-admin/tenants/${invoice.tenant_id}`}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium">
              {invoice.tenant_name}
            </Link>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-700/30">
            <span className="text-xs text-gray-500">플랜</span>
            <span className="text-sm text-gray-200">{invoice.plan} ({invoice.billing_cycle === 'monthly' ? '월간' : '연간'})</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-700/30">
            <span className="text-xs text-gray-500">청구 기간</span>
            <span className="text-sm text-gray-200 font-mono">
              {formatDate(invoice.period_start)} ~ {formatDate(invoice.period_end)}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-700/30">
            <span className="text-xs text-gray-500">청구 금액</span>
            <span className="text-xl font-bold text-white font-mono">{formatAmount(invoice.amount)}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-700/30">
            <span className="text-xs text-gray-500">결제 수단</span>
            <span className="text-sm text-gray-300">{invoice.payment_method ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-700/30">
            <span className="text-xs text-gray-500">만기일</span>
            <span className="text-sm text-gray-300 font-mono">
              {invoice.due_at ? formatDate(invoice.due_at) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-700/30">
            <span className="text-xs text-gray-500">결제일</span>
            <span className="text-sm text-gray-300 font-mono">
              {invoice.paid_at ? formatDate(invoice.paid_at) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-xs text-gray-500">PG 결제번호</span>
            <span className="text-xs text-gray-400 font-mono">{invoice.pg_payment_id ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* 메모 */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700/50">
          <p className="text-sm font-semibold text-gray-200">운영 메모</p>
          <button className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-colors">
            <Save className="w-3 h-3" /> 저장
          </button>
        </div>
        <div className="p-5">
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            rows={3}
            placeholder="운영 메모를 입력하세요..."
            className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      {/* 처리 액션 */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
        <p className="text-sm font-semibold text-gray-200 mb-3">수동 처리</p>
        <div className="flex gap-2">
          {invoice.status === 'failed' && (
            <button
              onClick={handleManualPay}
              disabled={processing || processed}
              className="flex items-center gap-1.5 text-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              {processing ? '처리 중...' : '수동 결제 완료 처리'}
            </button>
          )}
          {invoice.status === 'paid' && (
            <button
              onClick={handleRefund}
              className="flex items-center gap-1.5 text-sm text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              환불 처리
            </button>
          )}
          {invoice.status === 'pending' && (
            <button
              onClick={handleManualPay}
              className="flex items-center gap-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              입금 확인 후 완료 처리
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          수동 처리는 운영자 기록에 남습니다. 실제 결제 연동 전 임시 처리 용도입니다.
        </p>
      </div>
    </div>
  )
}
