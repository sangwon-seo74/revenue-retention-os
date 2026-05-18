'use client'

import { useState } from 'react'
import {
  CreditCard, Zap, Users, Building2, MessageSquare,
  CheckCircle2, ArrowRight, AlertCircle, RefreshCw,
  Calendar, TrendingUp, Shield, X
} from 'lucide-react'
import { cn, formatAmount, formatDate } from '@/lib/utils'
import type { Plan, TenantSubscription, BillingCycle } from '@/types/domain'

// ─── Mock 데이터 ──────────────────────────────────────────
const MOCK_SUBSCRIPTION: TenantSubscription & { plan: Plan } = {
  id: 'sub1', tenant_id: 'tn1', plan_id: 'plan_standard',
  billing_cycle: 'monthly',
  started_at: '2024-01-15T00:00:00Z',
  expires_at: '2025-01-15T00:00:00Z',
  next_billing_at: '2024-07-15T00:00:00Z',
  status: 'active',
  pg_customer_id: 'cus_xxx', pg_sub_id: 'sub_xxx',
  cancelled_at: null, cancel_reason: null,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-06-15T00:00:00Z',
  plan: {
    id: 'plan_standard', name: 'Standard', code: 'standard',
    max_users: 10, max_companies: 300, max_messages: 5000,
    monthly_price: 99000, yearly_price: 990000,
    is_active: true, created_at: '2024-01-01T00:00:00Z'
  }
}

const MOCK_USAGE = {
  users: { current: 7, max: 10 },
  companies: { current: 142, max: 300 },
  messages: { current: 1284, max: 5000 },
}

const MOCK_PLANS: Plan[] = [
  {
    id: 'plan_free', name: 'Free', code: 'free',
    max_users: 3, max_companies: 50, max_messages: 500,
    monthly_price: 0, yearly_price: 0,
    is_active: true, created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'plan_standard', name: 'Standard', code: 'standard',
    max_users: 10, max_companies: 300, max_messages: 5000,
    monthly_price: 99000, yearly_price: 990000,
    is_active: true, created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'plan_pro', name: 'Pro', code: 'pro',
    max_users: null, max_companies: null, max_messages: null,
    monthly_price: 249000, yearly_price: 2490000,
    is_active: true, created_at: '2024-01-01T00:00:00Z'
  },
]

const PLAN_FEATURES: Record<string, string[]> = {
  free: ['사용자 3명', '고객사 50개', '메시지 500건/월', '기본 리포트'],
  standard: ['사용자 10명', '고객사 300개', '메시지 5,000건/월', '고급 리포트', 'API 연동', '팀 관리'],
  pro: ['사용자 무제한', '고객사 무제한', '메시지 무제한', '전체 기능', '전담 CS', 'SLA 99.9%'],
}

const STATUS_CLASS: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  trialing: 'bg-blue-50 text-blue-700 border-blue-200',
  past_due: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
}
const STATUS_LABEL: Record<string, string> = {
  active: '활성', trialing: '체험중', past_due: '결제 미납', cancelled: '해지됨'
}

// ─── 업그레이드 모달 ──────────────────────────────────────
function UpgradeModal({ current, plans, onClose }: {
  current: Plan
  plans: Plan[]
  onClose: () => void
}) {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [selected, setSelected] = useState(current.id)

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">플랜 변경</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 결제 주기 토글 */}
        <div className="px-6 pt-5 pb-2 flex justify-center">
          <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
            {(['monthly', 'yearly'] as BillingCycle[]).map(c => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className={cn(
                  'text-sm px-4 py-1.5 rounded-lg font-medium transition-all',
                  cycle === c ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                )}
              >
                {c === 'monthly' ? '월간' : '연간'}
                {c === 'yearly' && (
                  <span className="ml-1.5 text-xs text-green-600 font-semibold">2개월 할인</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-6">
          {plans.map(plan => {
            const isCurrent = plan.id === current.id
            const price = cycle === 'monthly' ? plan.monthly_price : plan.yearly_price
            return (
              <div
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={cn(
                  'relative rounded-xl border-2 p-4 cursor-pointer transition-all',
                  selected === plan.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                {plan.code === 'pro' && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-medium">
                    추천
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-2.5 right-3 text-xs bg-gray-700 text-white px-2 py-0.5 rounded-full">
                    현재
                  </div>
                )}
                <p className="font-bold text-gray-900">{plan.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {price === 0 ? '무료' : formatAmount(price)}
                </p>
                {price > 0 && (
                  <p className="text-xs text-gray-400">{cycle === 'monthly' ? '/월' : '/년'}</p>
                )}
                <ul className="mt-4 space-y-1.5">
                  {PLAN_FEATURES[plan.code].map(f => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
            취소
          </button>
          <button
            disabled={selected === current.id}
            className="flex-1 py-2.5 text-sm text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            플랜 변경 신청
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 사용량 바 ─────────────────────────────────────────────
function UsageBar({ label, current, max, icon: Icon }: {
  label: string; current: number; max: number | null; icon: React.ElementType
}) {
  const pct = max ? Math.min((current / max) * 100, 100) : 0
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-blue-500'

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-sm text-gray-700">
          <Icon className="w-3.5 h-3.5 text-gray-400" />
          {label}
        </div>
        <span className="text-xs text-gray-500">
          {current.toLocaleString()} / {max ? max.toLocaleString() : '무제한'}
        </span>
      </div>
      {max ? (
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={cn('h-1.5 rounded-full transition-all', color)}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : (
        <div className="w-full bg-green-100 rounded-full h-1.5">
          <div className="h-1.5 w-full rounded-full bg-green-400 opacity-40" />
        </div>
      )}
    </div>
  )
}

// ─── 메인 ────────────────────────────────────────────────
export default function SubscriptionPage() {
  const [sub] = useState(MOCK_SUBSCRIPTION)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const daysLeft = Math.ceil(
    (new Date(sub.next_billing_at!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* 헤더 */}
      <div>
        <h1 className="text-lg font-bold text-gray-900">구독 현황</h1>
        <p className="text-sm text-gray-500 mt-0.5">현재 플랜과 사용 현황을 확인합니다</p>
      </div>

      {/* 현재 플랜 카드 */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-blue-200" />
              <span className="text-blue-200 text-sm font-medium">현재 플랜</span>
            </div>
            <p className="text-3xl font-bold">{sub.plan.name}</p>
            <p className="text-blue-200 text-sm mt-1">
              {sub.billing_cycle === 'monthly' ? '월간' : '연간'} ·{' '}
              {formatAmount(sub.billing_cycle === 'monthly' ? sub.plan.monthly_price : sub.plan.yearly_price)}/
              {sub.billing_cycle === 'monthly' ? '월' : '년'}
            </p>
          </div>
          <span className={cn(
            'text-xs px-2.5 py-1 rounded-full border font-semibold',
            'bg-white/20 text-white border-white/30'
          )}>
            {STATUS_LABEL[sub.status]}
          </span>
        </div>

        <div className="mt-5 pt-5 border-t border-white/20 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-blue-200">다음 결제일</p>
            <p className="text-sm font-semibold mt-0.5">
              {formatDate(sub.next_billing_at!)}
              <span className="text-blue-200 text-xs ml-1">({daysLeft}일 후)</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-200">시작일</p>
            <p className="text-sm font-semibold mt-0.5">{formatDate(sub.started_at)}</p>
          </div>
          <div>
            <p className="text-xs text-blue-200">구독 기간</p>
            <p className="text-sm font-semibold mt-0.5">
              {Math.ceil((Date.now() - new Date(sub.started_at).getTime()) / (1000 * 60 * 60 * 24 * 30))}개월
            </p>
          </div>
        </div>
      </div>

      {/* 사용량 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          이번 달 사용량
        </h3>
        <UsageBar label="사용자" current={MOCK_USAGE.users.current} max={MOCK_USAGE.users.max} icon={Users} />
        <UsageBar label="고객사" current={MOCK_USAGE.companies.current} max={MOCK_USAGE.companies.max} icon={Building2} />
        <UsageBar label="메시지 발송" current={MOCK_USAGE.messages.current} max={MOCK_USAGE.messages.max} icon={MessageSquare} />
      </div>

      {/* 플랜 변경 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">플랜 변경</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              더 많은 기능이 필요하시면 Pro 플랜으로 업그레이드하세요
            </p>
          </div>
          <button
            onClick={() => setShowUpgrade(true)}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            플랜 비교 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 결제 수단 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            결제 수단
          </h3>
          <button className="text-xs text-blue-600 hover:text-blue-700">변경</button>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-10 h-7 bg-gradient-to-br from-gray-700 to-gray-900 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">VISA</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">•••• •••• •••• 1234</p>
            <p className="text-xs text-gray-400">만료 12/26</p>
          </div>
          <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
        </div>
      </div>

      {/* 구독 해지 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">구독 해지</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              해지 시 현재 결제 기간 종료 후 서비스가 종료됩니다
            </p>
          </div>
          <button className="text-xs text-red-500 hover:text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
            해지 신청
          </button>
        </div>
      </div>

      {/* 업그레이드 모달 */}
      {showUpgrade && (
        <UpgradeModal
          current={sub.plan}
          plans={MOCK_PLANS}
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </div>
  )
}
