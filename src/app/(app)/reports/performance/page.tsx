'use client'

import { useState } from 'react'
import { Users, TrendingUp, Phone, MapPin, FileText, Download } from 'lucide-react'
import { formatAmount } from '@/lib/utils'

const MOCK_PERFORMANCE = [
  {
    id: 'u1', name: '홍길동', team: '서울팀',
    renewalCount: 12, renewalAmount: 144000000, renewalRate: 85.7,
    newContracts: 3, newAmount: 36000000,
    calls: 68, visits: 8,
    targetRate: 85, achievementRate: 100.8,
  },
  {
    id: 'u2', name: '김영수', team: '서울팀',
    renewalCount: 9, renewalAmount: 108000000, renewalRate: 75.0,
    newContracts: 2, newAmount: 24000000,
    calls: 52, visits: 6,
    targetRate: 85, achievementRate: 88.2,
  },
  {
    id: 'u3', name: '이지원', team: '부산팀',
    renewalCount: 15, renewalAmount: 180000000, renewalRate: 88.2,
    newContracts: 4, newAmount: 48000000,
    calls: 81, visits: 11,
    targetRate: 85, achievementRate: 103.8,
  },
  {
    id: 'u4', name: '박소연', team: '부산팀',
    renewalCount: 7, renewalAmount: 84000000, renewalRate: 70.0,
    newContracts: 1, newAmount: 12000000,
    calls: 44, visits: 4,
    targetRate: 85, achievementRate: 82.4,
  },
]

function MiniProgress({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-full">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(100, value / max * 100)}%` }} />
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const cls = rank === 1 ? 'bg-amber-400 text-white' :
              rank === 2 ? 'bg-slate-300 text-slate-700' :
              rank === 3 ? 'bg-amber-700 text-white' :
              'bg-slate-100 text-slate-500'
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${cls}`}>
      {rank}
    </span>
  )
}

export default function PerformancePage() {
  const [sort, setSort] = useState<'renewalRate' | 'renewalAmount' | 'calls'>('renewalRate')

  const sorted = [...MOCK_PERFORMANCE].sort((a, b) => b[sort] - a[sort])
  const maxCalls = Math.max(...MOCK_PERFORMANCE.map(p => p.calls))
  const maxAmount = Math.max(...MOCK_PERFORMANCE.map(p => p.renewalAmount + p.newAmount))

  const teamTotal = {
    renewals: MOCK_PERFORMANCE.reduce((s, p) => s + p.renewalCount, 0),
    amount: MOCK_PERFORMANCE.reduce((s, p) => s + p.renewalAmount + p.newAmount, 0),
    calls: MOCK_PERFORMANCE.reduce((s, p) => s + p.calls, 0),
    avgRate: Math.round(MOCK_PERFORMANCE.reduce((s, p) => s + p.renewalRate, 0) / MOCK_PERFORMANCE.length * 10) / 10,
  }

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">담당자별 실적</h1>
          <p className="text-sm text-slate-500 mt-0.5">이번 달 팀 전체 현황</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
          <Download className="w-3.5 h-3.5" />
          내보내기
        </button>
      </div>

      {/* 팀 합계 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '팀 갱신율', value: `${teamTotal.avgRate}%`, icon: TrendingUp, cls: 'text-blue-600' },
          { label: '갱신 건수', value: `${teamTotal.renewals}건`, icon: FileText, cls: 'text-green-600' },
          { label: '팀 매출', value: `${(teamTotal.amount / 100_000_000).toFixed(1)}억`, icon: Users, cls: 'text-slate-900 dark:text-slate-100' },
          { label: '통화 합계', value: `${teamTotal.calls}건`, icon: Phone, cls: 'text-slate-900 dark:text-slate-100' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <s.icon className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">{s.label}</span>
            </div>
            <span className={`text-2xl font-bold font-mono ${s.cls}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* 정렬 탭 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">정렬:</span>
        {[
          { key: 'renewalRate', label: '갱신율' },
          { key: 'renewalAmount', label: '갱신 매출' },
          { key: 'calls', label: '통화량' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setSort(s.key as typeof sort)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all
              ${sort === s.key ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-500 border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 실적 카드 */}
      <div className="space-y-3">
        {sorted.map((person, idx) => (
          <div key={person.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              {/* 순위 + 이름 */}
              <div className="flex-shrink-0 flex items-center gap-2 w-28">
                <RankBadge rank={idx + 1} />
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{person.name}</div>
                  <div className="text-xs text-slate-500">{person.team}</div>
                </div>
              </div>

              {/* 지표들 */}
              <div className="flex-1 grid grid-cols-3 gap-4">
                {/* 갱신율 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">갱신율</span>
                    <span className={`text-sm font-mono font-bold ${person.renewalRate >= person.targetRate ? 'text-green-600' : 'text-amber-600'}`}>
                      {person.renewalRate}%
                    </span>
                  </div>
                  <MiniProgress value={person.renewalRate} max={100} color={person.renewalRate >= person.targetRate ? 'bg-green-500' : 'bg-amber-500'} />
                  <div className="text-[10px] text-slate-400 mt-0.5">목표 {person.targetRate}%</div>
                </div>

                {/* 매출 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">매출</span>
                    <span className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
                      {((person.renewalAmount + person.newAmount) / 100_000_000).toFixed(1)}억
                    </span>
                  </div>
                  <MiniProgress value={person.renewalAmount + person.newAmount} max={maxAmount} color="bg-blue-500" />
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    갱신 {(person.renewalAmount / 100_000_000).toFixed(1)}억 + 신규 {(person.newAmount / 10_000_000).toFixed(0)}천만
                  </div>
                </div>

                {/* 활동량 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">통화 / 방문</span>
                    <div className="flex items-center gap-2 text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
                      <span>{person.calls}</span>
                      <span className="text-slate-300">/</span>
                      <span>{person.visits}</span>
                    </div>
                  </div>
                  <MiniProgress value={person.calls} max={maxCalls} color="bg-purple-500" />
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-400">
                    <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" /> {person.calls}건</span>
                    <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {person.visits}건</span>
                  </div>
                </div>
              </div>

              {/* 목표 달성률 */}
              <div className="flex-shrink-0 w-16 text-center">
                <div className={`text-lg font-bold font-mono ${person.achievementRate >= 100 ? 'text-green-600' : person.achievementRate >= 90 ? 'text-amber-600' : 'text-red-600'}`}>
                  {person.achievementRate}%
                </div>
                <div className="text-[10px] text-slate-500">목표달성</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
