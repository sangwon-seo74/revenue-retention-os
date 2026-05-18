'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, BarChart3, Calendar, Download } from 'lucide-react'
import { formatAmount } from '@/lib/utils'

// ─── Mock 차트 데이터 ─────────────────────────────────────
const MONTHLY_DATA = [
  { month: '24.12', total: 18, renewed: 14, churned: 4, rate: 77.8, amount: 168000000 },
  { month: '25.01', total: 22, renewed: 17, churned: 5, rate: 77.3, amount: 204000000 },
  { month: '25.02', total: 19, renewed: 16, churned: 3, rate: 84.2, amount: 192000000 },
  { month: '25.03', total: 25, renewed: 21, churned: 4, rate: 84.0, amount: 252000000 },
  { month: '25.04', total: 21, renewed: 18, churned: 3, rate: 85.7, amount: 216000000 },
  { month: '25.05', total: 24, renewed: 20, churned: 4, rate: 83.3, amount: 240000000 },
]

const CHURN_REASONS = [
  { reason: '가격 문제', count: 8, pct: 34 },
  { reason: '경쟁사 전환', count: 6, pct: 26 },
  { reason: '예산 삭감', count: 5, pct: 22 },
  { reason: '서비스 불만', count: 3, pct: 13 },
  { reason: '기타', count: 1, pct: 4 },
]

// ─── 미니 바 차트 ─────────────────────────────────────────
function MiniBarChart({ data }: { data: typeof MONTHLY_DATA }) {
  const max = Math.max(...data.map(d => d.total))
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map(d => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: `${(d.total / max) * 80}px` }}>
            <div
              className="w-full bg-red-300 dark:bg-red-700 rounded-sm"
              style={{ height: `${(d.churned / d.total) * 100}%` }}
            />
            <div
              className="w-full bg-blue-500 dark:bg-blue-400 rounded-sm"
              style={{ height: `${(d.renewed / d.total) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{d.month}</span>
        </div>
      ))}
    </div>
  )
}

// ─── 갱신율 라인 지표 ─────────────────────────────────────
function RateBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600 dark:text-slate-400 w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 w-12 text-right">
        {value}%
      </span>
    </div>
  )
}

// ─── 메인 페이지 ──────────────────────────────────────────
export default function RenewalRatePage() {
  const [period, setPeriod] = useState('6m')

  const latest = MONTHLY_DATA[MONTHLY_DATA.length - 1]
  const prev = MONTHLY_DATA[MONTHLY_DATA.length - 2]
  const rateDelta = (latest.rate - prev.rate).toFixed(1)
  const isUp = latest.rate >= prev.rate

  const avgRate = Math.round(MONTHLY_DATA.reduce((sum, d) => sum + d.rate, 0) / MONTHLY_DATA.length * 10) / 10
  const totalRenewed = MONTHLY_DATA.reduce((sum, d) => sum + d.renewed, 0)
  const totalChurned = MONTHLY_DATA.reduce((sum, d) => sum + d.churned, 0)
  const totalAmount = MONTHLY_DATA.reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">갱신율 분석</h1>
          <p className="text-sm text-slate-500 mt-0.5">최근 6개월 갱신 현황</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            {['3m', '6m', '12m'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all
                  ${period === p ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
            <Download className="w-3.5 h-3.5" />
            내보내기
          </button>
        </div>
      </div>

      {/* 요약 KPI */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">이번 달 갱신율</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{latest.rate}%</span>
            <span className={`text-sm font-mono mb-0.5 flex items-center gap-0.5 ${isUp ? 'text-green-600' : 'text-red-600'}`}>
              {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isUp ? '+' : ''}{rateDelta}%
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">6개월 평균</p>
          <span className="text-2xl font-bold font-mono text-blue-600">{avgRate}%</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">갱신 / 이탈</p>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-bold font-mono text-green-600">{totalRenewed}</span>
            <span className="text-slate-400">/</span>
            <span className="text-2xl font-bold font-mono text-red-600">{totalChurned}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">갱신 매출 합계</p>
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {(totalAmount / 100_000_000).toFixed(1)}억
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 월별 갱신 현황 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            월별 갱신 현황
          </h3>
          <MiniBarChart data={MONTHLY_DATA} />

          {/* 범례 */}
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
              <span className="text-xs text-slate-500">갱신</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-red-300" />
              <span className="text-xs text-slate-500">이탈</span>
            </div>
          </div>

          {/* 월별 테이블 */}
          <div className="mt-4 space-y-2">
            {MONTHLY_DATA.slice().reverse().map(d => (
              <div key={d.month} className="flex items-center gap-3 text-sm">
                <span className="font-mono text-xs text-slate-500 w-10">{d.month}</span>
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${d.rate}%` }} />
                </div>
                <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 w-12 text-right">
                  {d.rate}%
                </span>
                <span className="text-xs text-green-600 w-10 text-right">+{d.renewed}</span>
                <span className="text-xs text-red-600 w-8 text-right">-{d.churned}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 이탈 사유 분석 */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">이탈 사유 분석</h3>
            <div className="space-y-3">
              {CHURN_REASONS.map(r => (
                <div key={r.reason}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{r.reason}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{r.count}건</span>
                      <span className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100">{r.pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full"
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 목표 대비 현황 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">목표 대비 현황</h3>
            <div className="space-y-3">
              <RateBar label="갱신율" value={latest.rate} color="bg-blue-500" />
              <RateBar label="신규 계약" value={62} color="bg-green-500" />
              <RateBar label="업셀" value={28} color="bg-purple-500" />
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 갱신율 목표 85%까지 <strong>1.7%</strong> 부족. D-30 이내 {
                  MONTHLY_DATA[MONTHLY_DATA.length - 1].churned
                }건 중점 관리 필요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
