'use client'

import { useState } from 'react'
import {
  Users, Building2, MessageSquare,
  Pencil, X, AlertTriangle
} from 'lucide-react'
import { cn, formatAmount } from '@/lib/utils'
import type { Plan } from '@/types/domain'

// ─── Mock 데이터 ──────────────────────────────────────────
const MOCK_PLANS: (Plan & { subscriber_count: number; monthly_mrr: number })[] = [
  {
    id: 'plan_free', name: 'Free', code: 'free',
    max_users: 3, max_companies: 100, max_messages: 1000,
    monthly_price: 0, yearly_price: 0,
    is_active: true, created_at: '2024-01-01T00:00:00Z',
    subscriber_count: 12, monthly_mrr: 0,
  },
  {
    id: 'plan_standard', name: 'Standard', code: 'standard',
    max_users: 10, max_companies: 300, max_messages: 5000,
    monthly_price: 99000, yearly_price: 990000,
    is_active: true, created_at: '2024-01-01T00:00:00Z',
    subscriber_count: 28, monthly_mrr: 2_772_000,
  },
  {
    id: 'plan_pro', name: 'Pro', code: 'pro',
    max_users: null, max_companies: null, max_messages: null,
    monthly_price: 249000, yearly_price: 2_490_000,
    is_active: true, created_at: '2024-01-01T00:00:00Z',
    subscriber_count: 7, monthly_mrr: 1_743_000,
  },
]

const PLAN_COLOR: Record<string, string> = {
  free:     'from-gray-700/30 to-gray-800/30 border-gray-700/50',
  standard: 'from-blue-900/30 to-blue-800/20 border-blue-700/30',
  pro:      'from-purple-900/30 to-indigo-900/20 border-purple-700/30',
}
const PLAN_BADGE: Record<string, string> = {
  free:     'bg-gray-600/20 text-gray-400 border-gray-600/30',
  standard: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  pro:      'bg-purple-500/20 text-purple-300 border-purple-500/30',
}

// ─── 플랜 편집 모달 ───────────────────────────────────────
function PlanEditModal({
  plan, onClose, onSave
}: {
  plan: typeof MOCK_PLANS[0]
  onClose: () => void
  onSave: (data: Partial<Plan>) => void
}) {
  const [form, setForm] = useState({
    monthly_price: plan.monthly_price.toString(),
    yearly_price: plan.yearly_price.toString(),
    max_users: plan.max_users?.toString() ?? '',
    max_companies: plan.max_companies?.toString() ?? '',
    max_messages: plan.max_messages?.toString() ?? '',
  })

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">{plan.name} 플랜 편집</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-700 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-amber-900/20 border border-amber-700/30 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300">가격 변경은 신규 구독자부터 적용됩니다. 기존 구독자에게는 영향을 주지 않습니다.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">월간 가격 (원)</label>
              <input
                type="number" value={form.monthly_price}
                onChange={e => set('monthly_price', e.target.value)}
                disabled={plan.code === 'free'}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">연간 가격 (원)</label>
              <input
                type="number" value={form.yearly_price}
                onChange={e => set('yearly_price', e.target.value)}
                disabled={plan.code === 'free'}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t border-gray-700 pt-3">
            <p className="text-xs text-gray-400 mb-3">기능 제한 (비워두면 무제한)</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'max_users', label: '최대 사용자' },
                { key: 'max_companies', label: '최대 고객사' },
                { key: 'max_messages', label: '월 메시지' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] text-gray-500 mb-1 block">{f.label}</label>
                  <input
                    type="number"
                    value={form[f.key as keyof typeof form]}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder="무제한"
                    className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2 text-sm text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700">
            취소
          </button>
          <button
            onClick={() => onSave({
              monthly_price: Number(form.monthly_price),
              yearly_price: Number(form.yearly_price),
              max_users: form.max_users ? Number(form.max_users) : null,
              max_companies: form.max_companies ? Number(form.max_companies) : null,
              max_messages: form.max_messages ? Number(form.max_messages) : null,
            })}
            className="flex-1 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 메인 ────────────────────────────────────────────────
export default function PlansPage() {
  const [plans, setPlans] = useState(MOCK_PLANS)
  const [editingPlan, setEditingPlan] = useState<typeof MOCK_PLANS[0] | null>(null)

  const totalMrr = plans.reduce((s, p) => s + p.monthly_mrr, 0)

  const handleSave = (data: Partial<Plan>) => {
    setPlans(prev => prev.map(p => p.id === editingPlan?.id ? { ...p, ...data } : p))
    setEditingPlan(null)
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">플랜 관리</h1>
        <p className="text-sm text-gray-400 mt-0.5">전체 플랜 기준 활성 MRR {formatAmount(totalMrr)}</p>
      </div>

      {/* 플랜 카드 */}
      <div className="grid grid-cols-3 gap-4">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={cn('rounded-xl border bg-gradient-to-br p-5', PLAN_COLOR[plan.code])}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border font-medium', PLAN_BADGE[plan.code])}>
                  {plan.name}
                </span>
                <p className="text-2xl font-bold text-white mt-2">
                  {plan.monthly_price === 0 ? '무료' : formatAmount(plan.monthly_price)}
                </p>
                {plan.monthly_price > 0 && <p className="text-xs text-gray-400">/월 · 연간 {formatAmount(plan.yearly_price)}</p>}
              </div>
              <button
                onClick={() => setEditingPlan(plan)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 구독 통계 */}
            <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-black/20 rounded-xl">
              <div>
                <p className="text-[10px] text-gray-500">구독자</p>
                <p className="text-lg font-bold text-white">{plan.subscriber_count}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">월 기여 MRR</p>
                <p className="text-sm font-bold text-white font-mono">
                  {plan.monthly_mrr > 0 ? formatAmount(plan.monthly_mrr) : '—'}
                </p>
              </div>
            </div>

            {/* 기능 제한 */}
            <div className="space-y-2">
              {[
                { icon: Users, label: '사용자', value: plan.max_users },
                { icon: Building2, label: '고객사', value: plan.max_companies },
                { icon: MessageSquare, label: '월 메시지', value: plan.max_messages },
              ].map(f => (
                <div key={f.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <f.icon className="w-3 h-3" /> {f.label}
                  </div>
                  <span className={cn(
                    'font-medium',
                    f.value === null ? 'text-green-400' : 'text-gray-300'
                  )}>
                    {f.value === null ? '무제한' : f.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MRR 기여 분포 */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
        <p className="text-sm font-semibold text-gray-200 mb-4">플랜별 MRR 기여</p>
        <div className="space-y-3">
          {plans.filter(p => p.monthly_mrr > 0).map(p => {
            const pct = totalMrr > 0 ? Math.round((p.monthly_mrr / totalMrr) * 100) : 0
            return (
              <div key={p.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-300">{p.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{p.subscriber_count}명</span>
                    <span className="text-xs font-semibold text-white w-24 text-right font-mono">
                      {formatAmount(p.monthly_mrr)}
                    </span>
                    <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className={cn('h-1.5 rounded-full', p.code === 'pro' ? 'bg-purple-500' : 'bg-blue-500')}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700/50">
          <span className="text-xs text-gray-400">전체 MRR</span>
          <span className="text-sm font-bold text-white font-mono">{formatAmount(totalMrr)}</span>
        </div>
      </div>

      {editingPlan && (
        <PlanEditModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
