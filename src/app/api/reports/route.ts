// GET /api/reports/renewal-rate   — 갱신율 분석
// GET /api/reports/performance    — 담당자별 실적
// GET /api/reports/forecast       — 매출 예측 파이프라인

import { NextRequest } from 'next/server'
import { ok } from '@/lib/utils'
import { withAuth } from '@/lib/api'

// ─── 갱신율 분석 ─────────────────────────────────────────
// GET /api/reports/renewal-rate?year=2024&team_id=...
export const GET_renewal_rate = withAuth(async (req, ctx) => {
  const { searchParams } = new URL(req.url)
  const year    = Number(searchParams.get('year') ?? new Date().getFullYear())
  const team_id = searchParams.get('team_id')

  // SELECT
  //   DATE_TRUNC('month', co.expires_at) AS month,
  //   COUNT(*) FILTER (WHERE r.status = 'won')  AS won,
  //   COUNT(*) FILTER (WHERE r.status = 'lost') AS lost,
  //   COUNT(*) AS total,
  //   SUM(co.final_amount) FILTER (WHERE r.status = 'won') AS won_amount
  // FROM renewals r
  // JOIN contracts co ON co.id = r.contract_id
  // WHERE r.tenant_id = $1
  //   AND EXTRACT(year FROM co.expires_at) = $2
  //   AND (co.team_id = $? OR $? IS NULL)
  // GROUP BY month
  // ORDER BY month

  const mockMonthly = Array.from({ length: 6 }, (_, i) => ({
    month: `2024-0${i + 1}`,
    won: Math.floor(Math.random() * 20 + 10),
    lost: Math.floor(Math.random() * 5 + 1),
    total: 0,
    won_amount: Math.floor(Math.random() * 50000000 + 10000000),
  })).map(m => ({ ...m, total: m.won + m.lost, rate: m.won / (m.won + m.lost) * 100 }))

  const churn_reasons = [
    { reason: '가격', count: 12, pct: 40 },
    { reason: '경쟁사 전환', count: 8, pct: 27 },
    { reason: '서비스 불만', count: 5, pct: 17 },
    { reason: '예산 삭감', count: 3, pct: 10 },
    { reason: '기타', count: 2, pct: 6 },
  ]

  return ok({ monthly: mockMonthly, churn_reasons, year, team_id })
})

// ─── 담당자별 실적 ────────────────────────────────────────
// GET /api/reports/performance?month=2024-06&team_id=...
export const GET_performance = withAuth(async (req, ctx) => {
  const { searchParams } = new URL(req.url)
  const month   = searchParams.get('month') ?? new Date().toISOString().slice(0, 7)
  const team_id = searchParams.get('team_id')

  // SELECT
  //   u.id, u.name,
  //   COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'won') AS won_count,
  //   SUM(co.final_amount) FILTER (WHERE r.status = 'won') AS won_amount,
  //   COUNT(a.id) FILTER (WHERE a.type = 'call') AS call_count,
  //   COUNT(a.id) FILTER (WHERE a.type = 'visit') AS visit_count,
  //   COUNT(*) FILTER (WHERE r.status != 'lost') AS active_pipeline
  // FROM users u
  // LEFT JOIN renewals r ON r.assigned_user_id = u.id
  // LEFT JOIN contracts co ON co.id = r.contract_id
  // LEFT JOIN activities a ON a.user_id = u.id
  //   AND DATE_TRUNC('month', a.activity_at) = DATE_TRUNC('month', $month::date)
  // WHERE u.tenant_id = $1 AND u.is_active = true
  // GROUP BY u.id, u.name
  // ORDER BY won_amount DESC NULLS LAST

  const mock = [
    { id: 'u1', name: '김영업', won_count: 8, won_amount: 24000000, call_count: 42, visit_count: 12, active_pipeline: 15 },
    { id: 'u2', name: '이담당', won_count: 6, won_amount: 18000000, call_count: 35, visit_count: 8,  active_pipeline: 12 },
    { id: 'u3', name: '박상담', won_count: 5, won_amount: 15000000, call_count: 28, visit_count: 6,  active_pipeline: 10 },
  ]

  return ok({ data: mock, month, team_id })
})

// ─── 매출 예측 ────────────────────────────────────────────
// GET /api/reports/forecast?user_id=...&team_id=...
export const GET_forecast = withAuth(async (req, ctx) => {
  const { searchParams } = new URL(req.url)
  const team_id = searchParams.get('team_id')
  const user_id = searchParams.get('user_id')

  // SELECT
  //   CASE
  //     WHEN expires_at <= NOW() + INTERVAL '7 days'  THEN 'D7'
  //     WHEN expires_at <= NOW() + INTERVAL '14 days' THEN 'D14'
  //     WHEN expires_at <= NOW() + INTERVAL '30 days' THEN 'D30'
  //     WHEN expires_at <= NOW() + INTERVAL '60 days' THEN 'D60'
  //   END AS bucket,
  //   COUNT(*) AS count,
  //   SUM(co.final_amount) AS total_amount,
  //   COUNT(*) FILTER (WHERE r.status = 'won') AS won
  // FROM renewals r
  // JOIN contracts co ON co.id = r.contract_id
  // WHERE r.tenant_id = $1 AND r.status NOT IN ('won', 'lost')
  //   AND co.expires_at <= NOW() + INTERVAL '60 days'
  // GROUP BY bucket

  const pipeline = [
    { bucket: 'D7',  count: 5,  total_amount: 12500000, won: 2 },
    { bucket: 'D14', count: 8,  total_amount: 22000000, won: 3 },
    { bucket: 'D30', count: 18, total_amount: 48000000, won: 7 },
    { bucket: 'D60', count: 32, total_amount: 89000000, won: 14 },
  ]

  return ok({ pipeline, team_id, user_id })
})
