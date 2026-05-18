'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Building2, Plus, Search, Filter, ChevronRight,
  RefreshCw, Phone, AlertCircle, AlertTriangle,
  CheckCircle2, MoreHorizontal, MapPin, Users
} from 'lucide-react'
import { cn, formatAmount, formatDate, calcDday, getDdayClass } from '@/lib/utils'
import type { CompanyStatus, RiskLevel } from '@/types/domain'

// ─── Mock 데이터 ──────────────────────────────────────────
type CompanyRow = {
  id: string
  name: string
  biz_no: string | null
  industry: string | null
  status: CompanyStatus
  grade: string | null
  renewal_risk: RiskLevel | null
  address_city: string | null
  assigned_user: { id: string; name: string } | null
  active_contract: { expires_at: string; final_amount: number } | null
}

const MOCK_COMPANIES: CompanyRow[] = [
  { id: 'c1', name: '삼성SDS(주)',    biz_no: '123-81-12345', industry: 'IT서비스',  status: 'active',  grade: 'A', renewal_risk: 'high',   address_city: '서울', assigned_user: { id: 'u1', name: '김영업' }, active_contract: { expires_at: '2024-06-17T00:00:00Z', final_amount: 12_000_000 } },
  { id: 'c2', name: 'KT(주)',          biz_no: '234-81-23456', industry: '통신',      status: 'active',  grade: 'A', renewal_risk: 'high',   address_city: '서울', assigned_user: { id: 'u3', name: '박상담' }, active_contract: { expires_at: '2024-06-18T00:00:00Z', final_amount: 8_400_000 } },
  { id: 'c3', name: '현대글로비스',   biz_no: '345-81-34567', industry: '물류',      status: 'active',  grade: 'A', renewal_risk: 'medium', address_city: '서울', assigned_user: { id: 'u1', name: '김영업' }, active_contract: { expires_at: '2024-06-20T00:00:00Z', final_amount: 6_000_000 } },
  { id: 'c4', name: 'LG전자(주)',      biz_no: '456-81-45678', industry: '전자',      status: 'active',  grade: 'A', renewal_risk: 'medium', address_city: '서울', assigned_user: { id: 'u2', name: '이담당' }, active_contract: { expires_at: '2024-06-22T00:00:00Z', final_amount: 9_600_000 } },
  { id: 'c5', name: 'GS칼텍스',       biz_no: '567-81-56789', industry: '에너지',    status: 'active',  grade: 'B', renewal_risk: 'low',    address_city: '서울', assigned_user: { id: 'u1', name: '김영업' }, active_contract: { expires_at: '2024-09-30T00:00:00Z', final_amount: 4_800_000 } },
  { id: 'c6', name: 'SK하이닉스',     biz_no: '678-81-67890', industry: '반도체',    status: 'active',  grade: 'A', renewal_risk: 'low',    address_city: '경기', assigned_user: { id: 'u2', name: '이담당' }, active_contract: { expires_at: '2024-11-30T00:00:00Z', final_amount: 14_400_000 } },
  { id: 'c7', name: '포스코',          biz_no: '789-81-78901', industry: '철강',      status: 'active',  grade: 'B', renewal_risk: 'low',    address_city: '경북', assigned_user: { id: 'u3', name: '박상담' }, active_contract: { expires_at: '2024-10-31T00:00:00Z', final_amount: 7_200_000 } },
  { id: 'c8', name: '롯데케미칼',     biz_no: '890-81-89012', industry: '화학',      status: 'active',  grade: 'B', renewal_risk: 'medium', address_city: '경기', assigned_user: { id: 'u4', name: '최영업' }, active_contract: { expires_at: '2024-07-05T00:00:00Z', final_amount: 3_600_000 } },
  { id: 'c9', name: '한화시스템',     biz_no: '901-81-90123', industry: 'IT서비스',  status: 'dormant', grade: 'C', renewal_risk: null,     address_city: '서울', assigned_user: { id: 'u2', name: '이담당' }, active_contract: null },
  { id: 'c10', name: '두산인프라코어', biz_no: '012-81-01234', industry: '기계',     status: 'churned', grade: 'B', renewal_risk: null,     address_city: '인천', assigned_user: { id: 'u1', name: '김영업' }, active_contract: null },
]

// ─── 상수 ────────────────────────────────────────────────
const STATUS_CFG: Record<CompanyStatus, { label: string; cls: string }> = {
  prospect: { label: '발굴',   cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  active:   { label: '계약',   cls: 'bg-green-50 text-green-700 border-green-200' },
  dormant:  { label: '미접촉', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  churned:  { label: '해지',   cls: 'bg-red-50 text-red-600 border-red-200' },
}
const RISK_CFG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  high:   { label: '위험', cls: 'bg-red-50 text-red-600 border-red-200',     icon: AlertCircle },
  medium: { label: '주의', cls: 'bg-amber-50 text-amber-600 border-amber-200', icon: AlertTriangle },
  low:    { label: '안전', cls: 'bg-green-50 text-green-600 border-green-200', icon: CheckCircle2 },
}

// ─── 고객사 행 ────────────────────────────────────────────
function CompanyRow({ company }: { company: CompanyRow }) {
  const dday = company.active_contract ? calcDday(company.active_contract.expires_at) : null
  const risk = company.renewal_risk ? RISK_CFG[company.renewal_risk] : null
  const RiskIcon = risk?.icon

  return (
    <tr className="hover:bg-gray-50/60 transition-colors group">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
            {company.name[0]}
          </div>
          <div>
            <Link href={`/app/companies/${company.id}`}
              className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {company.name}
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5">
              {company.address_city && (
                <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />{company.address_city}
                </span>
              )}
              {company.industry && (
                <span className="text-[10px] text-gray-400">{company.industry}</span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className={cn('text-xs px-1.5 py-0.5 rounded-full border font-medium', STATUS_CFG[company.status].cls)}>
          {STATUS_CFG[company.status].label}
        </span>
      </td>
      <td className="px-4 py-3.5">
        {company.grade && (
          <span className="text-xs font-bold text-gray-700 bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center">
            {company.grade}
          </span>
        )}
      </td>
      <td className="px-4 py-3.5">
        {company.assigned_user && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[9px] text-blue-700 font-bold">
              {company.assigned_user.name[0]}
            </div>
            <span className="text-xs text-gray-600">{company.assigned_user.name}</span>
          </div>
        )}
      </td>
      <td className="px-4 py-3.5 text-right">
        {company.active_contract ? (
          <span className="text-sm font-bold text-gray-800 font-mono">
            {formatAmount(company.active_contract.final_amount)}
          </span>
        ) : <span className="text-xs text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3.5">
        {dday !== null ? (
          <span className={cn('text-xs font-bold font-mono', getDdayClass(dday))}>
            {dday >= 0 ? `D-${dday}` : `만료`}
          </span>
        ) : <span className="text-xs text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3.5">
        {risk && RiskIcon && (
          <span className={cn('inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full border font-medium', risk.cls)}>
            <RiskIcon className="w-2.5 h-2.5" />{risk.label}
          </span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <Link href={`/app/companies/${company.id}`}
          className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          보기 <ChevronRight className="w-3 h-3" />
        </Link>
      </td>
    </tr>
  )
}

// ─── 메인 ────────────────────────────────────────────────
export default function CompaniesPage() {
  const [q,          setQ]          = useState('')
  const [status,     setStatus]     = useState<CompanyStatus | 'all'>('all')
  const [risk,       setRisk]       = useState<RiskLevel | 'all'>('all')

  const filtered = MOCK_COMPANIES.filter(c => {
    const matchQ = !q || c.name.includes(q) || (c.biz_no ?? '').includes(q)
    const matchS = status === 'all' || c.status === status
    const matchR = risk === 'all' || c.renewal_risk === risk
    return matchQ && matchS && matchR
  })

  return (
    <div className="p-6 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">고객사 관리</h1>
          <p className="text-sm text-gray-400 mt-0.5">전체 {MOCK_COMPANIES.length}개 · 활성 {MOCK_COMPANIES.filter(c => c.status === 'active').length}개</p>
        </div>
        <Link href="/app/companies/new"
          className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-3.5 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> 고객사 등록
        </Link>
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="회사명, 사업자번호"
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none flex-1" />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'active', 'prospect', 'dormant', 'churned'] as const).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={cn('text-xs px-3 py-1.5 rounded-full border font-medium transition-colors',
                status === s ? 'bg-gray-900 text-white border-gray-900' : 'text-gray-500 border-gray-200 bg-white hover:border-gray-300')}>
              {s === 'all' ? '전체' : STATUS_CFG[s].label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(['all', 'high', 'medium', 'low'] as const).map(r => (
            <button key={r} onClick={() => setRisk(r)}
              className={cn('text-xs px-3 py-1.5 rounded-full border font-medium transition-colors',
                risk === r ? 'bg-gray-900 text-white border-gray-900' : 'text-gray-500 border-gray-200 bg-white hover:border-gray-300')}>
              {r === 'all' ? '위험도 전체' : RISK_CFG[r].label}
            </button>
          ))}
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['고객사', '상태', '등급', '담당자', '계약금액', '만료일', '위험도', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(c => <CompanyRow key={c.id} company={c} />)}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
