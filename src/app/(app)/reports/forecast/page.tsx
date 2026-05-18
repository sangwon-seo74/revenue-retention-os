'use client'

import { TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { formatAmount, calcDday, formatDday, getDdayClass } from '@/lib/utils'

const FORECAST_DATA = [
  {
    bucket: 'D-7 이내', days: '~7일', count: 3, amount: 72000000,
    riskRate: 85, color: 'bg-red-500', textColor: 'text-red-600',
    items: [
      { company: 'SK C&C', amount: 32400000, risk: 'high', assigned: '김영수' },
      { company: '현대오토에버', amount: 24000000, risk: 'high', assigned: '홍길동' },
      { company: '롯데정보통신', amount: 15600000, risk: 'medium', assigned: '이지원' },
    ]
  },
  {
    bucket: 'D-14 이내', days: '8~14일', count: 5, amount: 126000000,
    riskRate: 65, color: 'bg-amber-500', textColor: 'text-amber-600',
    items: [
      { company: 'LG CNS', amount: 17100000, risk: 'high', assigned: '홍길동' },
      { company: 'KT DS', amount: 48000000, risk: 'medium', assigned: '이지원' },
      { company: '신한DS', amount: 24000000, risk: 'low', assigned: '홍길동' },
      { company: '우리은행', amount: 21000000, risk: 'medium', assigned: '박소연' },
      { company: '하나금융TI', amount: 15900000, risk: 'low', assigned: '김영수' },
    ]
  },
  {
    bucket: 'D-30 이내', days: '15~30일', count: 8, amount: 213600000,
    riskRate: 40, color: 'bg-amber-400', textColor: 'text-amber-600',
    items: []
  },
  {
    bucket: 'D-60 이내', days: '31~60일', count: 12, amount: 318000000,
    riskRate: 20, color: 'bg-blue-400', textColor: 'text-blue-600',
    items: []
  },
]

const RISK_CLASS: Record<string, string> = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-amber-600 bg-amber-50',
  low: 'text-green-600 bg-green-50',
}
const RISK_LABEL: Record<string, string> = { high: '위험', medium: '주의', low: '안전' }

export default function ForecastPage() {
  const totalExpected = FORECAST_DATA.reduce((sum, d) => sum + d.amount, 0)
  const totalAtRisk = FORECAST_DATA.slice(0, 2).reduce((sum, d) => sum + d.amount, 0)
  const highProbAmount = FORECAST_DATA.reduce((sum, d) => sum + d.amount * ((100 - d.riskRate) / 100), 0)

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">매출 예측</h1>
        <p className="text-sm text-slate-500 mt-0.5">갱신 예정 계약 기반 ARR 분석</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">90일 내 갱신 예정</p>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {(totalExpected / 100_000_000).toFixed(1)}억
          </div>
          <p className="text-xs text-slate-500 mt-1">{FORECAST_DATA.reduce((s, d) => s + d.count, 0)}건</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">고위험 갱신 금액</p>
          <div className="text-2xl font-bold font-mono text-red-600">
            {(totalAtRisk / 100_000_000).toFixed(1)}억
          </div>
          <p className="text-xs text-red-500 mt-1">즉시 관리 필요</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">예상 갱신 확정액</p>
          <div className="text-2xl font-bold font-mono text-green-600">
            {(highProbAmount / 100_000_000).toFixed(1)}억
          </div>
          <p className="text-xs text-slate-500 mt-1">위험도 제외 추정</p>
        </div>
      </div>

      {/* 파이프라인 시각화 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">만료 구간별 갱신 파이프라인</h3>
        <div className="space-y-3">
          {FORECAST_DATA.map(d => (
            <div key={d.bucket} className="flex items-center gap-3">
              <div className="w-20 flex-shrink-0">
                <div className={`text-xs font-semibold ${d.textColor}`}>{d.bucket}</div>
                <div className="text-[10px] text-slate-400">{d.days}</div>
              </div>
              <div className="flex-1 relative">
                <div className="h-7 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <div
                    className={`h-full ${d.color} rounded-lg opacity-80 transition-all`}
                    style={{ width: `${(d.amount / totalExpected) * 100}%` }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-xs font-mono font-semibold text-white drop-shadow">
                    {(d.amount / 100_000_000).toFixed(1)}억
                  </span>
                </div>
              </div>
              <div className="w-12 text-xs text-slate-500 text-right">{d.count}건</div>
              <div className={`w-16 text-xs font-medium text-right ${d.riskRate >= 70 ? 'text-red-600' : d.riskRate >= 40 ? 'text-amber-600' : 'text-green-600'}`}>
                위험 {d.riskRate}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 긴급 갱신 목록 (D-14 이내) */}
      <div className="space-y-3">
        {FORECAST_DATA.slice(0, 2).map(d => d.items.length > 0 && (
          <div key={d.bucket} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className={`w-4 h-4 ${d.textColor}`} />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{d.bucket} 갱신 대상</h3>
              <span className="text-xs text-slate-500">({d.items.length}건)</span>
            </div>
            <div className="space-y-2">
              {d.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-100">{item.company}</span>
                  <span className="text-sm font-mono text-slate-700 dark:text-slate-300">{formatAmount(item.amount)}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${RISK_CLASS[item.risk]}`}>
                    {RISK_LABEL[item.risk]}
                  </span>
                  <span className="text-xs text-slate-500 w-14 text-right">{item.assigned}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
