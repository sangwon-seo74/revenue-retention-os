'use client'

import Link from 'next/link'
import {
  TrendingUp, TrendingDown, Building2,
  AlertTriangle, Clock, ArrowRight,
  DollarSign, Zap
} from 'lucide-react'
import { cn, formatAmount, formatDate } from '@/lib/utils'

// ─── Mock 데이터 ──────────────────────────────────────────
const MOCK_METRICS = {
  mrr: 4_356_000,
  mrr_delta: 8.2,          // 전월 대비 %
  arr: 52_272_000,
  active_tenants: 47,
  active_tenants_delta: 3,
  new_tenants_this_month: 5,
  churn_this_month: 2,
  pending_invoices: 3,
  pending_amount: 297_000,
  expiring_7d: 4,
}

const MOCK_NEW_TENANTS = [
  { id: 't10', name: '(주)스마트로직스', plan: 'Standard', created_at: '2024-06-14T09:00:00Z' },
  { id: 't11', name: '(주)데이터허브', plan: 'Pro', created_at: '2024-06-13T14:30:00Z' },
  { id: 't12', name: '한국기업분석원', plan: 'Standard', created_at: '2024-06-12T11:00:00Z' },
  { id: 't13', name: '(주)비즈인사이트', plan: 'Free', created_at: '2024-06-11T16:00:00Z' },
  { id: 't14', name: '코리아데이터랩', plan: 'Standard', created_at: '2024-06-10T09:30:00Z' },
]

const MOCK_EXPIRING = [
  { id: 's1', tenant_name: '(주)알파테크', plan: 'Pro', expires_at: '2024-06-17T00:00:00Z', amount: 249_000 },
  { id: 's2', tenant_name: '베타솔루션즈', plan: 'Standard', expires_at: '2024-06-18T00:00:00Z', amount: 99_000 },
  { id: 's3', tenant_name: '(주)감마시스템', plan: 'Standard', expires_at: '2024-06-20T00:00:00Z', amount: 99_000 },
  { id: 's4', tenant_name: '델타데이터', plan: 'Standard', expires_at: '2024-06-22T00:00:00Z', amount: 99_000 },
]

const MOCK_UNPAID = [
  { id: 'inv1', tenant_name: '(주)엡실론', plan: 'Standard', amount: 99_000, due_at: '2024-06-10T00:00:00Z', overdue_days: 5 },
  { id: 'inv2', tenant_name: '제타코퍼레이션', plan: 'Pro', amount: 249_000, due_at: '2024-06-08T00:00:00Z', overdue_days: 7 },
  { id: 'inv3', tenant_name: '(주)에타글로벌', plan: 'Standard', amount: 99_000, due_at: '2024-06-05T00:00:00Z', overdue_days: 10 },
]

const MOCK_PLAN_DIST = [
  { name: 'Free',     count: 12, color: 'bg-gray-500',   pct: 26 },
  { name: 'Standard', count: 28, color: 'bg-blue-500',   pct: 60 },
  { name: 'Pro',      count: 7,  color: 'bg-purple-500', pct: 14 },
]

const MOCK_MRR_TREND = [
  { month: '1월', mrr: 3_100_000 },
  { month: '2월', mrr: 3_350_000 },
  { month: '3월', mrr: 3_600_000 },
  { month: '4월', mrr: 3_820_000 },
  { month: '5월', mrr: 4_030_000 },
  { month: '6월', mrr: 4_356_000 },
]

// ─── 지표 카드 ────────────────────────────────────────────
function MetricCard({
  label, value, sub, delta, icon: Icon, iconColor, href, urgent
}: {
  label: string
  value: string | number
  sub?: string
  delta?: number
  icon: React.ElementType
  iconColor: string
  href?: string
  urgent?: boolean
}) {
  const content = (
    <div className={cn(
      'rounded-xl border p-4 transition-colors',
      urgent
        ? 'bg-red-950/40 border-red-800/50 hover:border-red-700/50'
        : 'bg-gray-800/60 border-gray-700/50 hover:border-gray-600/50',
      href && 'cursor-pointer'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconColor)}>
          <Icon className="w-4 h-4" />
        </div>
        {delta !== undefined && (
          <div className={cn(
            'flex items-center gap-0.5 text-xs font-medium',
            delta >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(delta)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )

  if (href) return <Link href={href}>{content}</Link>
  return content
}

// ─── MRR 트렌드 미니차트 ──────────────────────────────────
function MrrTrendChart() {
  const max = Math.max(...MOCK_MRR_TREND.map(d => d.mrr))
  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400">MRR 추이</p>
          <p className="text-2xl font-bold text-white mt-0.5">{formatAmount(MOCK_METRICS.mrr)}</p>
        </div>
        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          +{MOCK_METRICS.mrr_delta}% 전월 대비
        </span>
      </div>
      <div className="flex items-end gap-1.5 h-16">
        {MOCK_MRR_TREND.map((d, i) => {
          const h = Math.round((d.mrr / max) * 100)
          const isLast = i === MOCK_MRR_TREND.length - 1
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-full rounded-t-sm transition-all',
                  isLast ? 'bg-blue-500' : 'bg-gray-600'
                )}
                style={{ height: `${h}%` }}
              />
              <span className="text-[9px] text-gray-500">{d.month}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── 플랜 분포 ────────────────────────────────────────────
function PlanDistCard() {
  const total = MOCK_PLAN_DIST.reduce((s, p) => s + p.count, 0)
  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
      <p className="text-xs text-gray-400 mb-4">플랜 분포</p>
      <div className="space-y-3">
        {MOCK_PLAN_DIST.map(p => (
          <div key={p.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-300">{p.name}</span>
              <span className="text-xs text-gray-400">{p.count}개 ({p.pct}%)</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div className={cn('h-1.5 rounded-full', p.color)} style={{ width: `${p.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-700">전체 {total}개 테넌트</p>
    </div>
  )
}

// ─── 플랜 배지 ────────────────────────────────────────────
function PlanBadge({ plan }: { plan: string }) {
  const cls = plan === 'Pro'
    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    : plan === 'Standard'
    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    : 'bg-gray-500/20 text-gray-400 border-gray-600/30'
  return (
    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border font-medium', cls)}>
      {plan}
    </span>
  )
}

// ─── 메인 ────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl font-bold text-white">운영 대시보드</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })} 기준
        </p>
      </div>

      {/* 핵심 지표 6개 */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          label="월간 반복 매출 (MRR)"
          value={formatAmount(MOCK_METRICS.mrr)}
          sub={`ARR ${formatAmount(MOCK_METRICS.arr)}`}
          delta={MOCK_METRICS.mrr_delta}
          icon={DollarSign}
          iconColor="bg-blue-600/20 text-blue-400"
        />
        <MetricCard
          label="활성 테넌트"
          value={MOCK_METRICS.active_tenants}
          sub={`이번 달 +${MOCK_METRICS.new_tenants_this_month} 신규`}
          delta={MOCK_METRICS.active_tenants_delta}
          icon={Building2}
          iconColor="bg-green-600/20 text-green-400"
          href="/super-admin/tenants"
        />
        <MetricCard
          label="이번 달 이탈"
          value={MOCK_METRICS.churn_this_month}
          sub="해지 처리 완료"
          icon={TrendingDown}
          iconColor="bg-red-600/20 text-red-400"
        />
        <MetricCard
          label="만료 임박 (7일)"
          value={MOCK_METRICS.expiring_7d}
          sub="갱신 필요"
          icon={Clock}
          iconColor="bg-amber-600/20 text-amber-400"
          href="/super-admin/subscriptions"
          urgent={MOCK_METRICS.expiring_7d > 0}
        />
        <MetricCard
          label="미납 인보이스"
          value={MOCK_METRICS.pending_invoices}
          sub={formatAmount(MOCK_METRICS.pending_amount)}
          icon={AlertTriangle}
          iconColor="bg-red-600/20 text-red-400"
          href="/super-admin/invoices"
          urgent={MOCK_METRICS.pending_invoices > 0}
        />
        <MetricCard
          label="이번 달 신규"
          value={MOCK_METRICS.new_tenants_this_month}
          sub="가입 완료"
          icon={Zap}
          iconColor="bg-purple-600/20 text-purple-400"
        />
      </div>

      {/* 차트 2열 */}
      <div className="grid grid-cols-2 gap-4">
        <MrrTrendChart />
        <PlanDistCard />
      </div>

      {/* 3열 — 신규가입 / 만료임박 / 미납 */}
      <div className="grid grid-cols-3 gap-4">

        {/* 최근 신규 가입 */}
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-700/50">
            <p className="text-sm font-semibold text-white">최근 신규 가입</p>
            <Link href="/super-admin/tenants" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
              전체 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-700/30">
            {MOCK_NEW_TENANTS.map(t => (
              <Link
                key={t.id}
                href={`/super-admin/tenants/${t.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                  {t.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-200 truncate">{t.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{formatDate(t.created_at)}</p>
                </div>
                <PlanBadge plan={t.plan} />
              </Link>
            ))}
          </div>
        </div>

        {/* 만료 임박 */}
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-700/50">
            <p className="text-sm font-semibold text-white">만료 임박 <span className="text-amber-400 text-xs ml-1">D-7</span></p>
            <Link href="/super-admin/subscriptions" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
              전체 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-700/30">
            {MOCK_EXPIRING.map(s => {
              const days = Math.ceil((new Date(s.expires_at).getTime() - Date.now()) / 86400000)
              return (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={cn(
                    'text-[10px] font-bold font-mono px-1.5 py-0.5 rounded shrink-0',
                    days <= 3 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  )}>
                    D-{days}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-200 truncate">{s.tenant_name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{formatAmount(s.amount)}/월</p>
                  </div>
                  <PlanBadge plan={s.plan} />
                </div>
              )
            })}
          </div>
        </div>

        {/* 미납 현황 */}
        <div className="bg-gray-800/60 border border-red-800/30 rounded-xl">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-red-800/30">
            <p className="text-sm font-semibold text-white flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              미납 인보이스
            </p>
            <Link href="/super-admin/invoices" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
              전체 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-700/30">
            {MOCK_UNPAID.map(inv => (
              <Link
                key={inv.id}
                href={`/super-admin/invoices/${inv.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-200 truncate">{inv.tenant_name}</p>
                  <p className="text-[10px] text-red-400 mt-0.5">{inv.overdue_days}일 연체</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-white">{formatAmount(inv.amount)}</p>
                  <p className="text-[10px] text-gray-500">만기 {formatDate(inv.due_at)}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-700/30 flex justify-between items-center">
            <span className="text-xs text-gray-400">미수금 합계</span>
            <span className="text-sm font-bold text-red-400">
              {formatAmount(MOCK_METRICS.pending_amount)}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
