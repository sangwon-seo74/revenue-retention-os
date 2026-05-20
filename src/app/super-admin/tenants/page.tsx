'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Building2, Plus, Search, Filter, ChevronRight,
  CheckCircle2, XCircle, Clock, AlertTriangle,
  Users, FileText, MoreHorizontal, ToggleLeft, ToggleRight
} from 'lucide-react'
import { cn, formatAmount, formatDate } from '@/lib/utils'
import type { SubscriptionStatus } from '@/types/domain'

// ─── Mock 데이터 ──────────────────────────────────────────
type TenantRow = {
  id: string
  name: string
  biz_no: string
  is_active: boolean
  created_at: string
  plan: string
  plan_code: string
  subscription_status: SubscriptionStatus
  expires_at: string
  user_count: number
  company_count: number
  mrr: number
  last_login_at: string | null
}

const MOCK_TENANTS: TenantRow[] = [
  { id: 't1', name: '(주)테크솔루션', biz_no: '123-45-67890', is_active: true, created_at: '2024-01-15T00:00:00Z', plan: 'Pro', plan_code: 'pro', subscription_status: 'active', expires_at: '2024-12-31T00:00:00Z', user_count: 12, company_count: 340, mrr: 249000, last_login_at: '2024-06-15T10:00:00Z' },
  { id: 't2', name: '한국신용정보(주)', biz_no: '234-56-78901', is_active: true, created_at: '2024-02-01T00:00:00Z', plan: 'Standard', plan_code: 'standard', subscription_status: 'active', expires_at: '2024-09-30T00:00:00Z', user_count: 8, company_count: 210, mrr: 99000, last_login_at: '2024-06-14T15:30:00Z' },
  { id: 't3', name: '(주)비즈데이터', biz_no: '345-67-89012', is_active: true, created_at: '2024-02-15T00:00:00Z', plan: 'Standard', plan_code: 'standard', subscription_status: 'past_due', expires_at: '2024-06-15T00:00:00Z', user_count: 5, company_count: 98, mrr: 99000, last_login_at: '2024-06-10T09:00:00Z' },
  { id: 't4', name: '대한데이터서비스', biz_no: '456-78-90123', is_active: true, created_at: '2024-03-01T00:00:00Z', plan: 'Free', plan_code: 'free', subscription_status: 'trialing', expires_at: '2024-07-01T00:00:00Z', user_count: 2, company_count: 23, mrr: 0, last_login_at: '2024-06-13T11:00:00Z' },
  { id: 't5', name: '(주)스마트인사이트', biz_no: '567-89-01234', is_active: false, created_at: '2023-06-01T00:00:00Z', plan: 'Standard', plan_code: 'standard', subscription_status: 'cancelled', expires_at: '2024-05-31T00:00:00Z', user_count: 0, company_count: 145, mrr: 0, last_login_at: '2024-05-20T14:00:00Z' },
  { id: 't6', name: '코리아크레딧(주)', biz_no: '678-90-12345', is_active: true, created_at: '2024-04-01T00:00:00Z', plan: 'Pro', plan_code: 'pro', subscription_status: 'active', expires_at: '2025-03-31T00:00:00Z', user_count: 18, company_count: 520, mrr: 249000, last_login_at: '2024-06-15T08:30:00Z' },
  { id: 't7', name: '(주)알파리서치', biz_no: '789-01-23456', is_active: true, created_at: '2024-05-10T00:00:00Z', plan: 'Standard', plan_code: 'standard', subscription_status: 'active', expires_at: '2025-05-10T00:00:00Z', user_count: 6, company_count: 87, mrr: 99000, last_login_at: '2024-06-12T16:00:00Z' },
]

// ─── 구독 상태 배지 ───────────────────────────────────────
const SUB_STATUS: Record<SubscriptionStatus, { label: string; cls: string; icon: React.ElementType }> = {
  active:    { label: '활성',     cls: 'bg-green-500/15 text-green-400 border-green-500/30',  icon: CheckCircle2 },
  trialing:  { label: '체험중',   cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30',    icon: Clock },
  past_due:  { label: '결제미납', cls: 'bg-red-500/15 text-red-400 border-red-500/30',       icon: AlertTriangle },
  cancelled: { label: '해지',     cls: 'bg-gray-500/15 text-gray-500 border-gray-600/30',    icon: XCircle },
}

function SubStatusBadge({ status }: { status: SubscriptionStatus }) {
  const cfg = SUB_STATUS[status]
  const Icon = cfg.icon
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-medium', cfg.cls)}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  )
}

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

// ─── 테넌트 등록 모달 ─────────────────────────────────────
function NewTenantModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: '', biz_no: '', admin_email: '', admin_name: '', plan: 'standard'
  })
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md p-6">
        <h2 className="text-base font-bold text-white mb-5">신규 테넌트 등록</h2>
        <div className="space-y-3.5">
          {[
            { key: 'name',        label: '회사명 *',         placeholder: '(주)회사명' },
            { key: 'biz_no',      label: '사업자등록번호',     placeholder: '000-00-00000' },
            { key: 'admin_email', label: '관리자 이메일 *',   placeholder: 'admin@company.com' },
            { key: 'admin_name',  label: '관리자 이름 *',     placeholder: '홍길동' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
              <input
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">초기 플랜</label>
            <select
              value={form.plan}
              onChange={e => setForm(prev => ({ ...prev, plan: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="free">Free</option>
              <option value="standard">Standard</option>
              <option value="pro">Pro</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2 text-sm text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700">
            취소
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium">
            등록 + 초대메일 발송
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 메인 ────────────────────────────────────────────────
export default function TenantsPage() {
  const [tenants] = useState(MOCK_TENANTS)
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all')
  const [showModal, setShowModal] = useState(false)

  const filtered = tenants.filter(t => {
    const matchQ = !q || t.name.includes(q) || t.biz_no.includes(q)
    const matchStatus = statusFilter === 'all' || t.subscription_status === statusFilter
    return matchQ && matchStatus
  })

  const totalMrr = filtered.filter(t => t.is_active).reduce((s, t) => s + t.mrr, 0)

  return (
    <div className="p-6 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">테넌트 관리</h1>
          <p className="text-sm text-gray-400 mt-0.5">전체 {tenants.length}개 · 활성 MRR {formatAmount(totalMrr)}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> 테넌트 등록
        </button>
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-gray-500" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="테넌트명, 사업자번호 검색"
            className="bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none flex-1"
          />
        </div>
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
              {s === 'all' ? '전체' : SUB_STATUS[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700/50">
              {['테넌트', '플랜', '구독 상태', '만료일', '사용자/고객사', 'MRR', '최근 접속', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/30">
            {filtered.map(t => (
              <tr key={t.id} className="hover:bg-white/3 transition-colors group">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                      t.is_active ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-700 text-gray-500'
                    )}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p className={cn('text-sm font-medium', t.is_active ? 'text-gray-100' : 'text-gray-500')}>
                        {t.name}
                      </p>
                      <p className="text-[10px] text-gray-500">{t.biz_no}</p>
                    </div>
                    {!t.is_active && (
                      <span className="text-[10px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full">정지</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <PlanBadge plan={t.plan} />
                </td>
                <td className="px-4 py-3.5">
                  <SubStatusBadge status={t.subscription_status} />
                </td>
                <td className="px-4 py-3.5">
                  <p className={cn(
                    'text-xs font-mono',
                    new Date(t.expires_at) < new Date() ? 'text-red-400' : 'text-gray-300'
                  )}>
                    {formatDate(t.expires_at)}
                  </p>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-xs text-gray-300">
                    <span className="text-gray-200 font-medium">{t.user_count}</span>
                    <span className="text-gray-600 mx-1">/</span>
                    <span className="text-gray-200 font-medium">{t.company_count}</span>
                  </p>
                </td>
                <td className="px-4 py-3.5">
                  <p className={cn(
                    'text-xs font-mono font-semibold',
                    t.mrr > 0 ? 'text-blue-400' : 'text-gray-600'
                  )}>
                    {t.mrr > 0 ? formatAmount(t.mrr) : '—'}
                  </p>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-[10px] text-gray-500">
                    {t.last_login_at ? formatDate(t.last_login_at) : '없음'}
                  </p>
                </td>
                <td className="px-4 py-3.5">
                  <Link
                    href={`/super-admin/tenants/${t.id}`}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    상세 <ChevronRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Building2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">검색 결과가 없습니다</p>
          </div>
        )}
      </div>

      {showModal && <NewTenantModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
