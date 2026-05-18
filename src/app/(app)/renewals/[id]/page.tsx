'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, RefreshCw, AlertCircle, AlertTriangle,
  CheckCircle2, Phone, MessageSquare, FileText,
  ChevronRight, Check, X, TrendingUp, TrendingDown,
  Minus, Loader2, User
} from 'lucide-react'
import { cn, formatAmount, formatDate, calcDday, getDdayClass } from '@/lib/utils'
import type { RenewalStatus, RiskLevel, ActivityType } from '@/types/domain'

// ─── Mock 데이터 ──────────────────────────────────────────
const MOCK_RENEWAL = {
  id: 'r1',
  company_id: 'c1', company_name: '삼성SDS(주)',
  contract_id: 'co1', contract_no: 'CT-2024-0001',
  product_name: '고객관리 Pro',
  expires_at: '2024-06-17T00:00:00Z',
  final_amount: 12_000_000,
  amount: 13_333_333,
  discount_rate: 10,
  status: 'negotiating' as RenewalStatus,
  risk: 'high' as RiskLevel,
  risk_score: 78,
  assigned_user: { id: 'u1', name: '김영업' },
  target_renewal_at: '2024-06-15T00:00:00Z',
  memo: '담당 임원 변경 예정. 6월 말 이전 처리 필요.',
}

const MOCK_ACTIVITIES = [
  { id: 'a1', type: 'call' as ActivityType, at: '2024-06-15T10:23:00Z', user: '김영업', result: 'connected', note: '갱신 의향 긍정적. 계약 금액 협의 필요. 다음 주 최종 결정 예정.' },
  { id: 'a2', type: 'visit' as ActivityType, at: '2024-06-10T14:00:00Z', user: '김영업', result: null, note: '계약 조건 협의 미팅. 단가 5% 인상 수용.' },
  { id: 'a3', type: 'kakao' as ActivityType, at: '2024-06-03T10:00:00Z', user: '시스템',  result: null, note: '갱신 안내 메시지 발송 (D-14 알림)' },
  { id: 'a4', type: 'call' as ActivityType, at: '2024-05-28T11:00:00Z', user: '김영업', result: 'no_answer', note: '부재중' },
  { id: 'a5', type: 'email' as ActivityType, at: '2024-05-20T09:00:00Z', user: '시스템', result: null, note: '갱신 안내 이메일 발송 (D-30 알림)' },
]

const RISK_CFG: Record<RiskLevel, { label: string; cls: string; icon: React.ElementType }> = {
  high:   { label: '위험', cls: 'bg-red-50 text-red-600 border-red-200',     icon: AlertCircle },
  medium: { label: '주의', cls: 'bg-amber-50 text-amber-600 border-amber-200', icon: AlertTriangle },
  low:    { label: '안전', cls: 'bg-green-50 text-green-600 border-green-200', icon: CheckCircle2 },
}
const STATUS_STEPS: { key: RenewalStatus; label: string }[] = [
  { key: 'pending', label: '대기' },
  { key: 'contacted', label: '접촉' },
  { key: 'negotiating', label: '협의중' },
  { key: 'won', label: '완료' },
]
const ACTIVITY_ICON: Record<string, string> = {
  call: '📞', visit: '🤝', email: '📧', sms: '💬', kakao: '💛'
}

// ─── 메인 ────────────────────────────────────────────────
export default function RenewalDetailPage({ params }: { params: { id: string } }) {
  const [renewal, setRenewal] = useState(MOCK_RENEWAL)
  const [showResult, setShowResult] = useState(false)
  const [resultType, setResultType] = useState<'won' | 'lost' | null>(null)
  const [lostReason, setLostReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)

  const dday = calcDday(renewal.expires_at)
  const risk = RISK_CFG[renewal.risk]
  const RiskIcon = risk.icon
  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === renewal.status)

  const handleStatusChange = async (status: RenewalStatus) => {
    // TODO: await fetch(`/api/renewals/${renewal.id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
    setRenewal(p => ({ ...p, status }))
  }

  const handleResult = async () => {
    if (!resultType) return
    setProcessing(true)
    await new Promise(r => setTimeout(r, 800))
    setRenewal(p => ({ ...p, status: resultType === 'won' ? 'won' : 'lost' }))
    setProcessing(false)
    setDone(true)
    setShowResult(false)
  }

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link href="/app/renewals"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-gray-900">{renewal.company_name}</h1>
            <span className={cn('inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full border font-medium', risk.cls)}>
              <RiskIcon className="w-3 h-3" /> {risk.label}
            </span>
            {done && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                처리 완료
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{renewal.product_name} · {renewal.contract_no}</p>
        </div>
      </div>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-3 gap-3">
        <div className={cn('border rounded-xl px-4 py-3', dday <= 7 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200')}>
          <p className="text-xs text-gray-500">만료까지</p>
          <p className={cn('text-2xl font-bold font-mono', getDdayClass(dday))}>D-{dday}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(renewal.expires_at)}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500">계약금액</p>
          <p className="text-xl font-bold text-gray-900 font-mono">{formatAmount(renewal.final_amount)}</p>
          {renewal.discount_rate > 0 && (
            <p className="text-[10px] text-gray-400 mt-0.5">할인 {renewal.discount_rate}%</p>
          )}
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500">위험도 점수</p>
          <p className={cn(
            'text-2xl font-bold',
            renewal.risk_score >= 70 ? 'text-red-600' : renewal.risk_score >= 40 ? 'text-amber-600' : 'text-green-600'
          )}>
            {renewal.risk_score}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">/ 100점</p>
        </div>
      </div>

      {/* 진행 상태 스텝 */}
      {renewal.status !== 'won' && renewal.status !== 'lost' && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 mb-3">진행 상태</p>
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, idx) => {
              const isPast    = idx < currentStepIdx
              const isCurrent = idx === currentStepIdx
              const isFuture  = idx > currentStepIdx
              return (
                <div key={step.key} className="flex items-center flex-1">
                  <button
                    onClick={() => handleStatusChange(step.key)}
                    className={cn(
                      'flex-1 py-2 text-xs font-medium text-center rounded-lg transition-all',
                      isCurrent ? 'bg-blue-600 text-white shadow' :
                      isPast    ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    )}
                  >
                    {isPast && <span className="mr-1">✓</span>}
                    {step.label}
                  </button>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={cn('w-3 h-0.5 mx-0.5', isPast ? 'bg-green-300' : 'bg-gray-200')} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 결과 처리 버튼 */}
      {renewal.status !== 'won' && renewal.status !== 'lost' && !showResult && (
        <div className="flex gap-2">
          <button onClick={() => { setResultType('won'); setShowResult(true) }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors">
            <TrendingUp className="w-4 h-4" /> 갱신 완료
          </button>
          <button onClick={() => { setResultType('lost'); setShowResult(true) }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition-colors">
            <TrendingDown className="w-4 h-4" /> 이탈 처리
          </button>
        </div>
      )}

      {/* 결과 입력 패널 */}
      {showResult && (
        <div className={cn(
          'border rounded-xl p-4 space-y-3',
          resultType === 'won' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        )}>
          <p className="text-sm font-semibold text-gray-800">
            {resultType === 'won' ? '✅ 갱신 완료 처리' : '❌ 이탈 처리'}
          </p>
          {resultType === 'lost' && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">이탈 사유</label>
              <select value={lostReason} onChange={e => setLostReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400">
                <option value="">선택하세요</option>
                {['가격', '경쟁사 전환', '서비스 불만', '예산 삭감', '사업 축소', '기타'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => setShowResult(false)}
              className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-lg hover:bg-gray-50">
              취소
            </button>
            <button onClick={handleResult} disabled={processing}
              className={cn(
                'flex-1 py-2 text-sm text-white rounded-lg flex items-center justify-center gap-1.5 font-medium',
                resultType === 'won' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700',
                'disabled:opacity-50'
              )}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              확인
            </button>
          </div>
        </div>
      )}

      {/* 완료 상태 */}
      {(renewal.status === 'won' || renewal.status === 'lost') && (
        <div className={cn(
          'border rounded-xl p-4 flex items-center gap-3',
          renewal.status === 'won' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        )}>
          {renewal.status === 'won'
            ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            : <X className="w-5 h-5 text-red-500 shrink-0" />
          }
          <p className="text-sm font-semibold text-gray-800">
            {renewal.status === 'won' ? '갱신 완료' : '이탈 처리됨'}
          </p>
        </div>
      )}

      {/* 빠른 액션 */}
      {renewal.status !== 'won' && renewal.status !== 'lost' && (
        <div className="grid grid-cols-3 gap-2">
          <Link href="/app/activities/calls"
            className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all text-center">
            <Phone className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-600">통화 기록</span>
          </Link>
          <button className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all">
            <MessageSquare className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-600">메시지 발송</span>
          </button>
          <Link href={`/app/contracts/${renewal.contract_id}`}
            className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all">
            <FileText className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-600">계약 보기</span>
          </Link>
        </div>
      )}

      {/* 활동 이력 */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">활동 이력</p>
        </div>
        <div className="divide-y divide-gray-50">
          {MOCK_ACTIVITIES.map(a => (
            <div key={a.id} className="flex items-start gap-3 px-5 py-3.5">
              <span className="text-base shrink-0 mt-0.5">{ACTIVITY_ICON[a.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600">{a.user}</span>
                  {a.result === 'connected'  && <span className="text-[10px] text-green-600">연결됨</span>}
                  {a.result === 'no_answer'  && <span className="text-[10px] text-gray-400">부재중</span>}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{a.note}</p>
              </div>
              <p className="text-[10px] text-gray-400 shrink-0">{formatDate(a.at)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 메모 */}
      {renewal.memo && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-amber-700 mb-1">메모</p>
          <p className="text-sm text-amber-800">{renewal.memo}</p>
        </div>
      )}
    </div>
  )
}
