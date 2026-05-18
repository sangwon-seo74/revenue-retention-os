'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Building2, Phone, MapPin, Globe, Mail,
  FileText, RefreshCw, CheckSquare, MessageSquare,
  User, Star, AlertTriangle, AlertCircle, CheckCircle2,
  Plus, ChevronRight, Pencil, MoreHorizontal
} from 'lucide-react'
import { cn, formatAmount, formatDate, calcDday, getDdayClass } from '@/lib/utils'
import type { RiskLevel, ContractStatus, ActivityType } from '@/types/domain'

// ─── Mock 데이터 ──────────────────────────────────────────
const MOCK_COMPANY = {
  id: 'c1', name: '삼성SDS(주)', biz_no: '123-81-12345',
  industry: 'IT서비스', website: 'https://www.samsungsds.com',
  company_size: 'large', address_city: '서울', address_road: '서울시 강남구 테헤란로 521',
  status: 'active', grade: 'A', renewal_risk: 'high' as RiskLevel,
  assigned_user: { id: 'u1', name: '김영업' },
  team: { id: 't1', name: '서울 영업팀' },
  memo: '3년 연속 갱신 우수고객. 담당 임원 변경 예정(6월 말).',
  created_at: '2022-01-15T00:00:00Z', updated_at: '2024-06-15T00:00:00Z',
}

const MOCK_CONTACTS = [
  { id: 'ct1', name: '이구매', title: '구매팀장', department: '구매팀', phone: '02-2145-0001', email: 'buyer@samsungsds.com', is_primary: true, is_decision_maker: true, preferred_channel: 'call' },
  { id: 'ct2', name: '박IT',   title: '과장',     department: 'IT팀',    phone: '02-2145-0002', email: 'it@samsungsds.com',    is_primary: false, is_decision_maker: false, preferred_channel: 'email' },
]

const MOCK_CONTRACTS = [
  { id: 'co1', contract_no: 'CT-2024-0001', product_name: '고객관리 Pro', started_at: '2024-01-01T00:00:00Z', expires_at: '2024-06-17T00:00:00Z', final_amount: 12_000_000, status: 'active' as ContractStatus, is_paid: true },
  { id: 'co2', contract_no: 'CT-2023-0001', product_name: '고객관리 Pro', started_at: '2023-01-01T00:00:00Z', expires_at: '2023-12-31T00:00:00Z', final_amount: 10_800_000, status: 'renewed' as ContractStatus, is_paid: true },
]

const MOCK_ACTIVITIES = [
  { id: 'a1', type: 'call'  as ActivityType, activity_at: '2024-06-15T10:23:00Z', call_result: 'connected', summary: '갱신 의향 확인, 긍정적. 다음 주 미팅 요청', user_name: '김영업' },
  { id: 'a2', type: 'visit' as ActivityType, activity_at: '2024-06-10T14:00:00Z', call_result: null,        summary: '계약 조건 협의 미팅. 단가 5% 인상 동의', user_name: '김영업' },
  { id: 'a3', type: 'call'  as ActivityType, activity_at: '2024-05-28T11:00:00Z', call_result: 'no_answer', summary: '부재중',                                  user_name: '김영업' },
  { id: 'a4', type: 'email' as ActivityType, activity_at: '2024-05-20T09:00:00Z', call_result: null,        summary: '갱신 안내 이메일 발송',                   user_name: '김영업' },
]

const MOCK_TASKS = [
  { id: 't1', title: '[갱신 D-7] 삼성SDS(주)', priority: 'high', status: 'todo', due_at: '2024-06-16T00:00:00Z', is_auto: true },
  { id: 't2', title: '최종 계약서 초안 전달',  priority: 'high', status: 'in_progress', due_at: '2024-06-17T00:00:00Z', is_auto: false },
]

const MOCK_MESSAGES = [
  { id: 'm1', channel: 'email', content: '갱신 안내 드립니다. 만료일이 D-30 도래했습니다.', status: 'delivered', sent_at: '2024-05-20T09:00:00Z' },
  { id: 'm2', channel: 'kakao', content: '[갱신 안내] 계약 만료 D-14입니다.', status: 'read',      sent_at: '2024-06-03T10:00:00Z' },
]

// ─── 탭 ──────────────────────────────────────────────────
const TABS = ['개요', '담당자', '계약', '활동', '발송이력', '업무']

const ACTIVITY_ICON: Record<string, string> = { call: '📞', visit: '🤝', email: '📧', sms: '💬', kakao: '💛' }
const CALL_RESULT_CLS: Record<string, string> = {
  connected: 'text-green-600', no_answer: 'text-gray-400', rejected: 'text-red-400', scheduled: 'text-blue-500'
}
const CALL_RESULT_LABEL: Record<string, string> = {
  connected: '연결', no_answer: '부재중', rejected: '거절', scheduled: '예약'
}

const RISK_CFG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  high:   { label: '위험', cls: 'bg-red-50 text-red-600 border-red-200',     icon: AlertCircle },
  medium: { label: '주의', cls: 'bg-amber-50 text-amber-600 border-amber-200', icon: AlertTriangle },
  low:    { label: '안전', cls: 'bg-green-50 text-green-600 border-green-200', icon: CheckCircle2 },
}

const CONTRACT_STATUS_CLS: Record<ContractStatus, string> = {
  active:    'bg-green-50 text-green-700 border-green-200',
  expired:   'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
  renewed:   'bg-blue-50 text-blue-700 border-blue-200',
}
const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
  active: '활성', expired: '만료', cancelled: '해지', renewed: '갱신됨'
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

// ─── 탭 컨텐츠 ───────────────────────────────────────────
function TabOverview() {
  const c = MOCK_COMPANY
  const risk = c.renewal_risk ? RISK_CFG[c.renewal_risk] : null
  const RiskIcon = risk?.icon
  const activeContract = MOCK_CONTRACTS.find(co => co.status === 'active')
  const dday = activeContract ? calcDday(activeContract.expires_at) : null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Section title="기업 정보">
          <div className="space-y-3">
            {[
              { label: '사업자번호', value: c.biz_no },
              { label: '업종', value: c.industry },
              { label: '규모', value: c.company_size === 'large' ? '대기업' : '중소기업' },
              { label: '담당자', value: `${c.assigned_user.name} · ${c.team.name}` },
            ].map(f => (
              <div key={f.label} className="flex justify-between">
                <span className="text-xs text-gray-400">{f.label}</span>
                <span className="text-xs text-gray-700 font-medium">{f.value}</span>
              </div>
            ))}
            {c.website && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">웹사이트</span>
                <a href={c.website} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline truncate max-w-[150px]">
                  {c.website.replace('https://', '')}
                </a>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">주소</span>
              <span className="text-xs text-gray-700 text-right max-w-[150px]">{c.address_road}</span>
            </div>
          </div>
        </Section>

        <div className="space-y-3">
          {activeContract && dday !== null && (
            <div className={cn(
              'border rounded-xl p-4',
              dday <= 14 ? 'bg-red-50 border-red-200' : dday <= 30 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
            )}>
              <p className="text-xs text-gray-500 mb-1">현재 계약</p>
              <p className="text-xl font-bold text-gray-900 font-mono">{formatAmount(activeContract.final_amount)}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">{activeContract.product_name}</p>
                <span className={cn('text-sm font-bold font-mono', getDdayClass(dday))}>
                  {dday >= 0 ? `D-${dday}` : `만료`}
                </span>
              </div>
              <Link href={`/app/contracts/${activeContract.id}`}
                className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                계약 상세 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {risk && RiskIcon && (
            <div className={cn('border rounded-xl p-4', risk.cls)}>
              <div className="flex items-center gap-2">
                <RiskIcon className="w-4 h-4" />
                <span className="text-sm font-semibold">{risk.label} 위험도</span>
              </div>
              <p className="text-xs mt-1 opacity-70">마지막 활동: 3일 전</p>
            </div>
          )}
        </div>
      </div>

      {c.memo && (
        <Section title="메모">
          <p className="text-sm text-gray-600 leading-relaxed">{c.memo}</p>
        </Section>
      )}
    </div>
  )
}

function TabContacts() {
  return (
    <div className="space-y-3">
      {MOCK_CONTACTS.map(ct => (
        <div key={ct.id} className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                {ct.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900">{ct.name}</p>
                  {ct.is_primary && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">대표담당</span>}
                  {ct.is_decision_maker && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">결정권자</span>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{ct.title} · {ct.department}</p>
              </div>
            </div>
            <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50">
            {ct.phone  && <a href={`tel:${ct.phone}`}  className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"><Phone className="w-3 h-3" />{ct.phone}</a>}
            {ct.email  && <a href={`mailto:${ct.email}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"><Mail className="w-3 h-3" />{ct.email}</a>}
          </div>
        </div>
      ))}
      <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-1.5">
        <Plus className="w-4 h-4" /> 담당자 추가
      </button>
    </div>
  )
}

function TabContracts() {
  return (
    <div className="space-y-3">
      {MOCK_CONTRACTS.map(co => {
        const dday = calcDday(co.expires_at)
        return (
          <Link key={co.id} href={`/app/contracts/${co.id}`}
            className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{co.product_name}</p>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border font-medium', CONTRACT_STATUS_CLS[co.status])}>
                    {CONTRACT_STATUS_LABEL[co.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{co.contract_no}</p>
                <p className="text-xs text-gray-400">{formatDate(co.started_at)} ~ {formatDate(co.expires_at)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-900 font-mono">{formatAmount(co.final_amount)}</p>
                {co.status === 'active' && (
                  <span className={cn('text-xs font-mono', getDdayClass(dday))}>D-{dday}</span>
                )}
              </div>
            </div>
          </Link>
        )
      })}
      <Link href="/app/contracts/new"
        className="flex items-center justify-center gap-1.5 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
        <Plus className="w-4 h-4" /> 계약 등록
      </Link>
    </div>
  )
}

function TabActivities() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Link href="/app/activities/calls"
          className="flex items-center gap-1.5 text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">
          <Plus className="w-3.5 h-3.5" /> 활동 기록
        </Link>
      </div>
      <div className="space-y-2">
        {MOCK_ACTIVITIES.map(a => (
          <div key={a.id} className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
            <span className="text-base shrink-0 mt-0.5">{ACTIVITY_ICON[a.type]}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700 capitalize">{a.type}</span>
                {a.call_result && (
                  <span className={cn('text-xs', CALL_RESULT_CLS[a.call_result])}>
                    {CALL_RESULT_LABEL[a.call_result]}
                  </span>
                )}
                <span className="text-[10px] text-gray-400 ml-auto">{a.user_name}</span>
              </div>
              {a.summary && <p className="text-xs text-gray-600 mt-0.5">{a.summary}</p>}
            </div>
            <p className="text-[10px] text-gray-400 shrink-0">{formatDate(a.activity_at)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function TabMessages() {
  const CH_ICON: Record<string, string> = { email: '📧', sms: '💬', kakao: '💛' }
  const STATUS_CLS: Record<string, string> = {
    sent: 'text-gray-400', delivered: 'text-blue-500', failed: 'text-red-500', read: 'text-green-500'
  }
  return (
    <div className="space-y-2">
      {MOCK_MESSAGES.map(m => (
        <div key={m.id} className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
          <span className="text-base shrink-0 mt-0.5">{CH_ICON[m.channel]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600 leading-relaxed">{m.content}</p>
          </div>
          <div className="text-right shrink-0">
            <p className={cn('text-[10px] font-medium capitalize', STATUS_CLS[m.status])}>{m.status}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(m.sent_at)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function TabTasks() {
  const P_CLS: Record<string, string> = { high: 'bg-red-500', medium: 'bg-amber-400', low: 'bg-gray-400' }
  return (
    <div className="space-y-2">
      {MOCK_TASKS.map(t => (
        <div key={t.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', P_CLS[t.priority])} />
          <p className="flex-1 text-sm text-gray-700">{t.title}</p>
          {t.is_auto && <span className="text-[9px] border border-blue-200 text-blue-500 px-1 py-0.5 rounded">자동</span>}
          {t.due_at && <p className="text-xs text-gray-400">{formatDate(t.due_at)}</p>}
        </div>
      ))}
    </div>
  )
}

// ─── 메인 ────────────────────────────────────────────────
export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  const [tab, setTab] = useState('개요')
  const c = MOCK_COMPANY
  const risk = c.renewal_risk ? RISK_CFG[c.renewal_risk] : null

  const tabContent: Record<string, React.ReactNode> = {
    '개요': <TabOverview />, '담당자': <TabContacts />, '계약': <TabContracts />,
    '활동': <TabActivities />, '발송이력': <TabMessages />, '업무': <TabTasks />,
  }

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link href="/app/companies" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-base shrink-0">
          {c.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-gray-900">{c.name}</h1>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">{c.grade}등급</span>
            {risk && (
              <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', risk.cls)}>
                {risk.label}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{c.biz_no} · {c.address_city} · {c.industry}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/app/activities/calls"
            className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50">
            <Phone className="w-3 h-3" /> 통화기록
          </Link>
          <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200 gap-0.5">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-4 py-2.5 text-sm font-medium transition-colors -mb-px border-b-2',
              tab === t ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700')}>
            {t}
          </button>
        ))}
      </div>

      {tabContent[tab]}
    </div>
  )
}
