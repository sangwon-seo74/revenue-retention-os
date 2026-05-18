'use client'

import { useState } from 'react'
import {
  FileText, Plus, Search, ChevronRight, Calendar,
  TrendingUp, DollarSign, AlertCircle, CheckCircle,
} from 'lucide-react'
import {
  CONTRACT_STATUS_LABEL, CONTRACT_STATUS_CLASS,
} from '@/constants/domain'
import { formatAmount, calcDday, formatDday, getDdayClass } from '@/lib/utils'
import type { Contract } from '@/types/domain'

// ─── Mock 데이터 ──────────────────────────────────────────
const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'co1', tenant_id: 't1', company_id: 'c1', product_id: 'p1',
    assigned_user_id: 'u1', contract_no: 'C-2025-001',
    started_at: '2025-06-01', expires_at: '2026-06-01',
    amount: 24000000, discount_rate: 0, final_amount: 24000000,
    is_paid: true, paid_at: '2025-06-03', payment_method: '계좌이체',
    account_count: 5, status: 'active', cancel_reason: null,
    parent_contract_id: null, renewal_count: 2,
    memo: null, created_at: '2025-06-01T00:00:00Z', updated_at: '2025-06-01T00:00:00Z',
    company: { id: 'c1', name: '삼성SDS', biz_no: '123-45-67890' },
    assigned_user: { id: 'u1', name: '홍길동' },
    product: { id: 'p1', name: '기업신용조회 Pro' },
  },
  {
    id: 'co2', tenant_id: 't1', company_id: 'c2', product_id: 'p1',
    assigned_user_id: 'u1', contract_no: 'C-2025-002',
    started_at: '2025-07-01', expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 18000000, discount_rate: 5, final_amount: 17100000,
    is_paid: true, paid_at: '2025-07-05', payment_method: '카드',
    account_count: 3, status: 'active', cancel_reason: null,
    parent_contract_id: null, renewal_count: 1,
    memo: null, created_at: '2025-07-01T00:00:00Z', updated_at: '2025-07-01T00:00:00Z',
    company: { id: 'c2', name: 'LG CNS', biz_no: '234-56-78901' },
    assigned_user: { id: 'u1', name: '홍길동' },
    product: { id: 'p1', name: '기업신용조회 Standard' },
  },
  {
    id: 'co3', tenant_id: 't1', company_id: 'c3', product_id: 'p2',
    assigned_user_id: 'u2', contract_no: 'C-2025-003',
    started_at: '2025-08-01', expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 36000000, discount_rate: 10, final_amount: 32400000,
    is_paid: false, paid_at: null, payment_method: null,
    account_count: 8, status: 'active', cancel_reason: null,
    parent_contract_id: null, renewal_count: 0,
    memo: '결제 확인 필요', created_at: '2025-08-01T00:00:00Z', updated_at: '2025-08-01T00:00:00Z',
    company: { id: 'c3', name: 'SK C&C', biz_no: '345-67-89012' },
    assigned_user: { id: 'u2', name: '김영수' },
    product: { id: 'p2', name: '재무정보 Pro' },
  },
  {
    id: 'co4', tenant_id: 't1', company_id: 'c4', product_id: 'p1',
    assigned_user_id: 'u1', contract_no: 'C-2024-020',
    started_at: '2024-05-01', expires_at: '2025-05-01',
    amount: 12000000, discount_rate: 0, final_amount: 12000000,
    is_paid: true, paid_at: '2024-05-10', payment_method: '계좌이체',
    account_count: 2, status: 'expired', cancel_reason: null,
    parent_contract_id: null, renewal_count: 0,
    memo: null, created_at: '2024-05-01T00:00:00Z', updated_at: '2024-05-01T00:00:00Z',
    company: { id: 'c4', name: '현대오토에버', biz_no: '456-78-90123' },
    assigned_user: { id: 'u1', name: '홍길동' },
    product: { id: 'p1', name: '기업신용조회 Standard' },
  },
  {
    id: 'co5', tenant_id: 't1', company_id: 'c5', product_id: 'p3',
    assigned_user_id: 'u3', contract_no: 'C-2025-005',
    started_at: '2025-09-01', expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 48000000, discount_rate: 0, final_amount: 48000000,
    is_paid: true, paid_at: '2025-09-02', payment_method: '계좌이체',
    account_count: 10, status: 'active', cancel_reason: null,
    parent_contract_id: null, renewal_count: 3,
    memo: null, created_at: '2025-09-01T00:00:00Z', updated_at: '2025-09-01T00:00:00Z',
    company: { id: 'c5', name: 'KT DS', biz_no: '567-89-01234' },
    assigned_user: { id: 'u3', name: '이지원' },
    product: { id: 'p3', name: '등기정보 Pro' },
  },
]

// ─── 계약 등록 모달 ──────────────────────────────────────
function NewContractModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">계약 등록</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">고객사 *</label>
            <input placeholder="고객사 검색..." className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">제품 *</label>
            <select className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">제품 선택</option>
              <option>기업신용조회 Standard</option>
              <option>기업신용조회 Pro</option>
              <option>재무정보 Pro</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">계약 시작일 *</label>
              <input type="date" className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">계약 만료일 *</label>
              <input type="date" className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">계약 금액 *</label>
              <input type="number" placeholder="0" className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">할인율 (%)</label>
              <input type="number" defaultValue="0" min="0" max="100" className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">계정 수 *</label>
              <input type="number" defaultValue="1" min="1" className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">결제 여부</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="false">미납</option>
                <option value="true">납부완료</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">메모</label>
            <textarea rows={2} placeholder="메모..." className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">취소</button>
          <button className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">저장</button>
        </div>
      </div>
    </div>
  )
}

// ─── 계약 행 ──────────────────────────────────────────────
function ContractRow({ contract }: { contract: Contract }) {
  const days = calcDday(contract.expires_at)
  const isExpiring = days <= 30 && days >= 0 && contract.status === 'active'

  return (
    <tr className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer
      ${isExpiring && days <= 7 ? 'bg-red-50/30 dark:bg-red-950/20' : ''}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{contract.company?.name}</span>
          {!contract.is_paid && (
            <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded">미납</span>
          )}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">{contract.product?.name}</div>
      </td>
      <td className="px-4 py-3 text-xs text-slate-500">{contract.contract_no}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CONTRACT_STATUS_CLASS[contract.status] ?? ''}`}>
          {CONTRACT_STATUS_LABEL[contract.status]}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-mono text-right text-slate-900 dark:text-slate-100">
        {formatAmount(contract.final_amount ?? contract.amount)}
        {contract.discount_rate > 0 && (
          <div className="text-xs text-green-600 font-sans">-{contract.discount_rate}%</div>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${getDdayClass(days)}`}>
          {formatDday(days)}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-slate-500">{contract.assigned_user?.name}</td>
      <td className="px-4 py-3 text-center">
        {contract.is_paid
          ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
          : <AlertCircle className="w-4 h-4 text-amber-500 mx-auto" />
        }
      </td>
      <td className="px-4 py-3 text-right">
        <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
      </td>
    </tr>
  )
}

// ─── 메인 페이지 ──────────────────────────────────────────
export default function ContractsPage() {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filtered = MOCK_CONTRACTS.filter(c => {
    if (search && !c.company?.name.includes(search)) return false
    if (filterStatus && c.status !== filterStatus) return false
    return true
  })

  const totalAmount = MOCK_CONTRACTS
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + (c.final_amount ?? c.amount), 0)

  const expiringCount = MOCK_CONTRACTS.filter(c => {
    const days = calcDday(c.expires_at)
    return c.status === 'active' && days >= 0 && days <= 30
  }).length

  const unpaidCount = MOCK_CONTRACTS.filter(c => !c.is_paid && c.status === 'active').length

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">계약 현황</h1>
          <p className="text-sm text-slate-500 mt-0.5">활성 계약 {MOCK_CONTRACTS.filter(c => c.status === 'active').length}건</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          계약 등록
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-slate-500">활성 계약 총액</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {formatAmount(totalAmount)}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-slate-500">30일 내 만료</span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-600">{expiringCount}건</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-slate-500">미납 계약</span>
          </div>
          <div className="text-xl font-bold font-mono text-red-600">{unpaidCount}건</div>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="고객사 검색..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체 상태</option>
          <option value="active">계약중</option>
          <option value="expired">만료</option>
          <option value="cancelled">해지</option>
          <option value="renewed">갱신완료</option>
        </select>
      </div>

      {/* 테이블 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              {['고객사 / 제품', '계약번호', '상태', '금액', '만료', '담당자', '결제', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-xs font-medium text-slate-500 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">계약 없음</p>
                </td>
              </tr>
            ) : (
              filtered.map(c => <ContractRow key={c.id} contract={c} />)
            )}
          </tbody>
        </table>
      </div>

      {showModal && <NewContractModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
