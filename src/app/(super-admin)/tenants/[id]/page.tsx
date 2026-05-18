'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Building2, CheckCircle2, XCircle, AlertTriangle,
  Clock, Users, FileText, CreditCard, Activity, BarChart2,
  ToggleLeft, ToggleRight, Mail, RefreshCw, ExternalLink,
  Shield, Pencil
} from 'lucide-react'
import { cn, formatAmount, formatDate } from '@/lib/utils'
import type { SubscriptionStatus } from '@/types/domain'

// ─── Mock 데이터 ──────────────────────────────────────────
const MOCK_TENANT = {
  id: 't1',
  name: '(주)테크솔루션',
  biz_no: '123-45-67890',
  ceo_name: '김대표',
  email: 'admin@techsolution.co.kr',
  phone: '02-1234-5678',
  is_active: true,
  created_at: '2024-01-15T00:00:00Z',
  subscription: {
    plan: 'Pro', plan_code: 'pro',
    status: 'active' as SubscriptionStatus,
    billing_cycle: 'monthly',
    started_at: '2024-01-15T00:00:00Z',
    expires_at: '2025-01-15T00:00:00Z',
    next_billing_at: '2024-07-15T00:00:00Z',
    mrr: 249_000,
    total_paid: 1_494_000,
  },
  usage: {
    users: { current: 12, max: null },
    companies: { current: 340, max: null },
    messages: { current: 8450, max: null },
  },
  users: [
    { id: 'u1', name: '김관리자', email: 'admin@techsolution.co.kr', role: 'admin', last_login_at: '2024-06-15T10:00:00Z', is_active: true },
    { id: 'u2', name: '이팀장', email: 'lee@techsolution.co.kr', role: 'manager', last_login_at: '2024-06-14T09:30:00Z', is_active: true },
    { id: 'u3', name: '박영업', email: 'park@techsolution.co.kr', role: 'sales', last_login_at: '2024-06-13T14:00:00Z', is_active: true },
    { id: 'u4', name: '최영업', email: 'choi@techsolution.co.kr', role: 'sales', last_login_at: null, is_active: false },
  ],
  invoices: [
    { id: 'inv1', invoice_no: 'INV-2024-0012', period: '2024-06', amount: 249_000, status: 'paid', paid_at: '2024-06-15T10:00:00Z' },
    { id: 'inv2', invoice_no: 'INV-2024-0009', period: '2024-05', amount: 249_000, status: 'paid', paid_at: '2024-05-15T09:00:00Z' },
    { id: 'inv3', invoice_no: 'INV-2024-0006', period: '2024-04', amount: 249_000, status: 'paid', paid_at: '2024-04-15T11:00:00Z' },
  ],
}

const ROLE_LABEL: Record<string, string> = { admin: '관리자', manager: '팀장', sales: '영업' }
const ROLE_CLS: Record<string, string> = {
  admin:   'bg-purple-500/20 text-purple-300 border-purple-500/30',
  manager: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  sales:   'bg-gray-600/20 text-gray-400 border-gray-600/30',
}

const INVOICE_STATUS_CLS: Record<string, string> = {
  paid:    'text-green-400',
  pending: 'text-amber-400',
  failed:  'text-red-400',
}

// ─── 탭 ──────────────────────────────────────────────────
const TABS = ['기본정보', '구독', '결제', '사용량', '사용자']

// ─── 섹션 카드 ────────────────────────────────────────────
function Section({ title, children, action }: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700/50">
        <p className="text-sm font-semibold text-gray-200">{title}</p>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={cn('text-sm text-gray-200', mono && 'font-mono')}>{value || '—'}</p>
    </div>
  )
}

// ─── 탭별 컨텐츠 ──────────────────────────────────────────
function TabBasic() {
  return (
    <div className="space-y-4">
      <Section title="기업 정보" action={
        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 px-2.5 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors">
          <Pencil className="w-3 h-3" /> 편집
        </button>
      }>
        <div className="grid grid-cols-2 gap-4">
          <Field label="상호명" value={MOCK_TENANT.name} />
          <Field label="사업자등록번호" value={MOCK_TENANT.biz_no} mono />
          <Field label="대표자" value={MOCK_TENANT.ceo_name} />
          <Field label="가입일" value={formatDate(MOCK_TENANT.created_at)} />
          <Field label="이메일" value={MOCK_TENANT.email} />
          <Field label="전화" value={MOCK_TENANT.phone} />
        </div>
      </Section>
      <Section title="서비스 상태">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-200">서비스 활성화</p>
            <p className="text-xs text-gray-500 mt-0.5">비활성화 시 로그인이 차단됩니다</p>
          </div>
          <button className="text-green-400 hover:text-green-300 transition-colors">
            <ToggleRight className="w-8 h-8" />
          </button>
        </div>
      </Section>
      <div className="flex gap-2">
        <button className="flex items-center gap-1.5 text-xs text-blue-400 border border-blue-500/30 bg-blue-500/10 px-3.5 py-2 rounded-lg hover:bg-blue-500/20 transition-colors">
          <Mail className="w-3.5 h-3.5" /> 초대 메일 재발송
        </button>
        <button className="flex items-center gap-1.5 text-xs text-amber-400 border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 rounded-lg hover:bg-amber-500/20 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> 임시 비밀번호 발급
        </button>
        <button className="flex items-center gap-1.5 text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-3.5 py-2 rounded-lg hover:bg-red-500/20 transition-colors ml-auto">
          <XCircle className="w-3.5 h-3.5" /> 서비스 강제 해지
        </button>
      </div>
    </div>
  )
}

function TabSubscription() {
  const { subscription: s } = MOCK_TENANT
  const daysLeft = Math.ceil((new Date(s.expires_at).getTime() - Date.now()) / 86400000)
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-700/30 rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-blue-300">현재 플랜</p>
            <p className="text-3xl font-bold text-white mt-0.5">{s.plan}</p>
            <p className="text-xs text-blue-300 mt-1">
              {s.billing_cycle === 'monthly' ? '월간' : '연간'} · {formatAmount(s.mrr)}/월
            </p>
          </div>
          <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-full">
            {s.status === 'active' ? '활성' : s.status}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-blue-700/30">
          <div>
            <p className="text-[10px] text-blue-300">시작일</p>
            <p className="text-xs text-white font-medium mt-0.5">{formatDate(s.started_at)}</p>
          </div>
          <div>
            <p className="text-[10px] text-blue-300">만료일</p>
            <p className="text-xs text-white font-medium mt-0.5">{formatDate(s.expires_at)}</p>
          </div>
          <div>
            <p className="text-[10px] text-blue-300">남은 일수</p>
            <p className={cn('text-xs font-bold mt-0.5', daysLeft <= 14 ? 'text-amber-400' : 'text-white')}>
              {daysLeft > 0 ? `D-${daysLeft}` : `D+${Math.abs(daysLeft)}`}
            </p>
          </div>
        </div>
      </div>
      <Section title="플랜 변경">
        <div className="grid grid-cols-3 gap-2">
          {['Free', 'Standard', 'Pro'].map(plan => (
            <button
              key={plan}
              className={cn(
                'p-3 rounded-xl border text-xs font-medium transition-colors',
                plan === s.plan
                  ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300'
              )}
            >
              {plan}
              {plan === s.plan && <span className="block text-[10px] text-blue-400 mt-0.5">현재 플랜</span>}
            </button>
          ))}
        </div>
        <button className="mt-3 w-full py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium transition-colors">
          플랜 변경 적용
        </button>
      </Section>
      <Section title="구독 종료">
        <p className="text-xs text-gray-400 mb-3">구독 기간 종료 후 데이터를 보존하면서 서비스를 비활성화합니다.</p>
        <button className="text-xs text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
          구독 해지 처리
        </button>
      </Section>
    </div>
  )
}

function TabInvoices() {
  return (
    <div className="space-y-4">
      <Section title="결제 이력" action={
        <button className="text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 px-2.5 py-1.5 rounded-lg hover:bg-blue-500/10 transition-colors">
          수동 결제 처리
        </button>
      }>
        <div className="space-y-2">
          {MOCK_TENANT.invoices.map(inv => (
            <div key={inv.id} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-200">{inv.invoice_no}</p>
                <p className="text-[10px] text-gray-500">{inv.period} 구독료</p>
              </div>
              <p className="text-sm font-bold text-white font-mono">{formatAmount(inv.amount)}</p>
              <span className={cn('text-[10px] font-semibold', INVOICE_STATUS_CLS[inv.status])}>
                {inv.status === 'paid' ? '결제완료' : inv.status === 'pending' ? '대기중' : '실패'}
              </span>
              <p className="text-[10px] text-gray-500 text-right w-20">
                {inv.paid_at ? formatDate(inv.paid_at) : '—'}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700/50">
          <p className="text-xs text-gray-400">총 결제 금액</p>
          <p className="text-sm font-bold text-white">{formatAmount(MOCK_TENANT.subscription.total_paid)}</p>
        </div>
      </Section>
    </div>
  )
}

function UsageBar({ label, current, max }: { label: string; current: number; max: number | null }) {
  const pct = max ? Math.min((current / max) * 100, 100) : 0
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs text-gray-300">{label}</span>
        <span className="text-xs text-gray-400">
          {current.toLocaleString()} / {max ? max.toLocaleString() : '무제한'}
        </span>
      </div>
      {max ? (
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div className={cn(
            'h-1.5 rounded-full',
            pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-blue-500'
          )} style={{ width: `${pct}%` }} />
        </div>
      ) : (
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div className="h-1.5 w-8 rounded-full bg-green-400/50" />
        </div>
      )}
    </div>
  )
}

function TabUsage() {
  return (
    <Section title="리소스 사용량">
      <div className="space-y-4">
        <UsageBar label="사용자" current={MOCK_TENANT.usage.users.current} max={MOCK_TENANT.usage.users.max} />
        <UsageBar label="고객사" current={MOCK_TENANT.usage.companies.current} max={MOCK_TENANT.usage.companies.max} />
        <UsageBar label="메시지 (이번달)" current={MOCK_TENANT.usage.messages.current} max={MOCK_TENANT.usage.messages.max} />
      </div>
      <p className="text-xs text-gray-500 mt-4">Pro 플랜 — 전 기능 무제한</p>
    </Section>
  )
}

function TabUsers() {
  return (
    <Section title="사용자 목록" action={
      <span className="text-xs text-gray-500">{MOCK_TENANT.users.length}명</span>
    }>
      <div className="divide-y divide-gray-700/50">
        {MOCK_TENANT.users.map(u => (
          <div key={u.id} className="flex items-center gap-3 py-3.5">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
              u.is_active ? 'bg-blue-600/30 text-blue-300' : 'bg-gray-700 text-gray-500'
            )}>
              {u.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={cn('text-sm font-medium', u.is_active ? 'text-gray-200' : 'text-gray-500')}>
                  {u.name}
                </p>
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full border font-medium',
                  ROLE_CLS[u.role]
                )}>
                  {ROLE_LABEL[u.role]}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5 truncate">{u.email}</p>
            </div>
            <p className="text-[10px] text-gray-500 text-right shrink-0">
              {u.last_login_at ? formatDate(u.last_login_at) : '미접속'}
            </p>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ─── 메인 ────────────────────────────────────────────────
export default function TenantDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('기본정보')

  const tabContent: Record<string, React.ReactNode> = {
    '기본정보': <TabBasic />,
    '구독':     <TabSubscription />,
    '결제':     <TabInvoices />,
    '사용량':   <TabUsage />,
    '사용자':   <TabUsers />,
  }

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link
          href="/super-admin/tenants"
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-sm">
              {MOCK_TENANT.name[0]}
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{MOCK_TENANT.name}</h1>
              <p className="text-xs text-gray-400">{MOCK_TENANT.biz_no} · {formatDate(MOCK_TENANT.created_at)} 가입</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded-full font-medium">
            Pro
          </span>
          <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-full font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 활성
          </span>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-700/50 gap-0.5">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors -mb-px border-b-2',
              activeTab === tab
                ? 'text-blue-400 border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      {tabContent[activeTab]}
    </div>
  )
}
