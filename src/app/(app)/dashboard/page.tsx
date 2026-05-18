'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Phone, AlertTriangle, CheckSquare, TrendingUp,
  RefreshCw, Building2, ArrowRight, Plus,
  ChevronRight, Clock, CheckCircle2
} from 'lucide-react'
import { cn, formatAmount, formatDate, calcDday, getDdayClass } from '@/lib/utils'

// ─── Mock 데이터 ──────────────────────────────────────────
const MOCK_SUMMARY = {
  calls_today: 8, calls_target: 20,
  overdue_tasks: 3,
  renewals_d7: 4, renewals_d14: 7, renewals_d30: 18,
  renewal_rate_this_month: 82,
  won_amount_this_month: 24_600_000,
}

const MOCK_URGENT_RENEWALS = [
  { id: 'r1', company_name: '삼성SDS(주)',    expires_at: '2024-06-17T00:00:00Z', amount: 12_000_000, risk: 'high',   assigned_user: '김영업' },
  { id: 'r2', company_name: 'KT(주)',          expires_at: '2024-06-18T00:00:00Z', amount: 8_400_000,  risk: 'high',   assigned_user: '박상담' },
  { id: 'r3', company_name: '현대글로비스',    expires_at: '2024-06-20T00:00:00Z', amount: 6_000_000,  risk: 'medium', assigned_user: '김영업' },
  { id: 'r4', company_name: 'LG전자(주)',      expires_at: '2024-06-22T00:00:00Z', amount: 9_600_000,  risk: 'medium', assigned_user: '이담당' },
]

const MOCK_TASKS = [
  { id: 't1', title: '[갱신 D-7] 삼성SDS(주)',  priority: 'high',   due_at: '2024-06-16T00:00:00Z', type: 'renewal' },
  { id: 't2', title: '통화 후 Follow-up (SK하이닉스)', priority: 'medium', due_at: '2024-06-16T00:00:00Z', type: 'call' },
  { id: 't3', title: '[갱신 D-7] KT(주)',        priority: 'high',   due_at: '2024-06-17T00:00:00Z', type: 'renewal' },
  { id: 't4', title: '제안서 전달 — 포스코',    priority: 'medium', due_at: '2024-06-18T00:00:00Z', type: 'visit' },
]

const MOCK_RECENT_ACTIVITIES = [
  { id: 'a1', type: 'call',  company_name: '삼성SDS(주)',   summary: '갱신 의향 확인, 긍정적', at: '2024-06-15T10:23:00Z' },
  { id: 'a2', type: 'visit', company_name: '현대글로비스',  summary: '계약 조건 협의 미팅',     at: '2024-06-15T09:00:00Z' },
  { id: 'a3', type: 'call',  company_name: 'GS칼텍스',      summary: '부재중',                   at: '2024-06-14T16:30:00Z' },
  { id: 'a4', type: 'call',  company_name: 'LG전자(주)',     summary: '담당자 교체 확인 필요',    at: '2024-06-14T14:00:00Z' },
]

const RISK_CLS: Record<string, string> = {
  high:   'bg-red-50 text-red-600 border-red-200',
  medium: 'bg-amber-50 text-amber-600 border-amber-200',
  low:    'bg-green-50 text-green-600 border-green-200',
}
const RISK_LABEL: Record<string, string> = { high: '위험', medium: '주의', low: '안전' }

const ACTIVITY_ICON: Record<string, string> = {
  call: '📞', visit: '🤝', email: '📧', sms: '💬', kakao: '💛'
}

const PRIORITY_CLS: Record<string, string> = {
  high: 'bg-red-500', medium: 'bg-amber-400', low: 'bg-gray-400'
}

// ─── 지표 카드 ────────────────────────────────────────────
function MetricCard({ label, value, sub, icon: Icon, color, href }: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; color: string; href?: string
}) {
  const content = (
    <div className={cn(
      'bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow',
      href && 'cursor-pointer'
    )}>
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', color)}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
}

// ─── 메인 ────────────────────────────────────────────────
export default function DashboardPage() {
  const s = MOCK_SUMMARY

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">대시보드</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/activities/calls"
            className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3.5 py-2 rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> 통화기록
          </Link>
          <Link href="/app/companies/new"
            className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3.5 py-2 rounded-lg hover:bg-gray-50">
            <Building2 className="w-4 h-4" /> 고객사 등록
          </Link>
        </div>
      </div>

      {/* 핵심 지표 4개 */}
      <div className="grid grid-cols-4 gap-3">
        <MetricCard
          label="오늘 통화"
          value={`${s.calls_today} / ${s.calls_target}`}
          sub={`목표 달성률 ${Math.round(s.calls_today/s.calls_target*100)}%`}
          icon={Phone} color="bg-blue-50 text-blue-600"
          href="/app/activities/calls"
        />
        <MetricCard
          label="갱신 임박 (D-7)"
          value={s.renewals_d7}
          sub={`D-30 기준 ${s.renewals_d30}건`}
          icon={RefreshCw} color="bg-red-50 text-red-500"
          href="/app/renewals"
        />
        <MetricCard
          label="미처리 할일"
          value={s.overdue_tasks}
          sub="기한 초과"
          icon={CheckSquare} color={s.overdue_tasks > 0 ? "bg-amber-50 text-amber-500" : "bg-green-50 text-green-500"}
          href="/app/tasks/my"
        />
        <MetricCard
          label="이번 달 갱신율"
          value={`${s.renewal_rate_this_month}%`}
          sub={formatAmount(s.won_amount_this_month)}
          icon={TrendingUp} color="bg-green-50 text-green-600"
          href="/app/reports/renewal-rate"
        />
      </div>

      {/* 갱신 위험 알림판 */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-800">갱신 위험 알림판</h3>
          </div>
          <Link href="/app/renewals" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
            전체 보기 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* D-7 / D-14 / D-30 구간 요약 */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
          {[
            { label: 'D-7 이내', count: s.renewals_d7,  cls: 'text-red-600',   bg: 'bg-red-50' },
            { label: 'D-14 이내', count: s.renewals_d14, cls: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'D-30 이내', count: s.renewals_d30, cls: 'text-gray-700',  bg: '' },
          ].map(b => (
            <div key={b.label} className={cn('px-5 py-3 text-center', b.bg)}>
              <p className={cn('text-2xl font-bold', b.cls)}>{b.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{b.label}</p>
            </div>
          ))}
        </div>

        {/* 긴급 갱신 목록 */}
        <div className="divide-y divide-gray-50">
          {MOCK_URGENT_RENEWALS.map(r => {
            const dday = calcDday(r.expires_at)
            return (
              <Link key={r.id} href={`/app/renewals/${r.id}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <span className={cn(
                  'text-xs font-bold font-mono px-2 py-0.5 rounded shrink-0',
                  getDdayClass(dday) === 'text-red-600' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                )}>
                  D-{dday}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{r.company_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.assigned_user}</p>
                </div>
                <p className="text-sm font-bold text-gray-800 font-mono shrink-0">{formatAmount(r.amount)}</p>
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border font-medium shrink-0', RISK_CLS[r.risk])}>
                  {RISK_LABEL[r.risk]}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* 오늘 할일 + 최근 활동 2열 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 오늘 할일 */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-gray-400" /> 오늘 할일
            </h3>
            <Link href="/app/tasks/my" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
              전체 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {MOCK_TASKS.map(t => {
              const dday = calcDday(t.due_at)
              const isOverdue = dday < 0
              return (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', PRIORITY_CLS[t.priority])} />
                  <p className={cn(
                    'flex-1 text-sm truncate',
                    isOverdue ? 'text-red-600 font-medium' : 'text-gray-700'
                  )}>
                    {t.title}
                  </p>
                  <span className={cn(
                    'text-[10px] font-mono shrink-0',
                    isOverdue ? 'text-red-500 font-bold' : 'text-gray-400'
                  )}>
                    {isOverdue ? `D+${Math.abs(dday)}` : dday === 0 ? '오늘' : `D-${dday}`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" /> 최근 활동
            </h3>
            <Link href="/app/activities/calls" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
              전체 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {MOCK_RECENT_ACTIVITIES.map(a => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                <span className="text-base shrink-0 mt-0.5">{ACTIVITY_ICON[a.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{a.company_name}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{a.summary}</p>
                </div>
                <p className="text-[10px] text-gray-400 shrink-0 mt-0.5">{formatDate(a.at)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
