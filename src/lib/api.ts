// ============================================================
// Revenue Retention OS — API 공통 유틸
// DB: PostgreSQL (pg 드라이버 기준 / Supabase 연동 가능)
// ============================================================

import { NextRequest } from 'next/server'
import { ok, err } from '@/lib/utils'

// ─── 테넌트 인증 컨텍스트 ────────────────────────────────
export interface AuthContext {
  userId: string
  tenantId: string
  role: 'admin' | 'manager' | 'sales'
}

/**
 * 요청에서 인증 정보를 추출한다.
 * 미들웨어가 헤더에 주입한 x-tenant-id / x-user-id / x-user-role 을 읽는다.
 * 미들웨어를 통과한 요청만 /app/* 에 도달하므로 여기서는 헤더 존재 여부만 확인.
 */
export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
  const tenantId = req.headers.get('x-tenant-id')
  const userId   = req.headers.get('x-user-id')
  const role     = req.headers.get('x-user-role') as AuthContext['role'] | null

  if (!tenantId || !userId || !role) return null
  return { userId, tenantId, role }
}

/**
 * 인증 필수 Route Handler 래퍼
 * - 인증 실패 시 401
 * - role 제한 시 403
 */
export function withAuth(
  handler: (req: NextRequest, ctx: AuthContext, params?: Record<string, string>) => Promise<Response>,
  options?: { roles?: AuthContext['role'][] }
) {
  return async (req: NextRequest, { params }: { params?: Record<string, string> } = {}) => {
    const ctx = await getAuthContext(req)
    if (!ctx) return err('UNAUTHORIZED', '인증이 필요합니다', 401)

    if (options?.roles && !options.roles.includes(ctx.role)) {
      return err('FORBIDDEN', '권한이 없습니다', 403)
    }

    try {
      return await handler(req, ctx, params)
    } catch (e) {
      console.error('[API Error]', e)
      return err('INTERNAL_ERROR', '서버 오류가 발생했습니다', 500)
    }
  }
}

// ─── 페이지네이션 파싱 ───────────────────────────────────
export function parsePagination(url: string) {
  const { searchParams } = new URL(url)
  const page  = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)))
  const offset = (page - 1) * limit
  return { page, limit, offset }
}

// ─── 공통 필터 파싱 ─────────────────────────────────────
export function parseCommonFilters(url: string) {
  const { searchParams } = new URL(url)
  return {
    q:         searchParams.get('q') ?? undefined,
    team_id:   searchParams.get('team_id') ?? undefined,
    user_id:   searchParams.get('user_id') ?? undefined,
    date_from: searchParams.get('date_from') ?? undefined,
    date_to:   searchParams.get('date_to') ?? undefined,
    sort:      searchParams.get('sort') ?? 'created_at',
    order:     (searchParams.get('order') ?? 'desc') as 'asc' | 'desc',
  }
}

// ─── SQL 빌더 헬퍼 (pg 태그드 쿼리 대체용) ──────────────
export function buildWhereClause(
  conditions: Array<{ sql: string; value?: unknown } | null | undefined>
): { where: string; values: unknown[] } {
  const valid = conditions.filter((c): c is { sql: string; value?: unknown } => !!c)
  if (valid.length === 0) return { where: '', values: [] }

  let idx = 1
  const parts: string[] = []
  const values: unknown[] = []

  for (const cond of valid) {
    if (cond.value !== undefined) {
      parts.push(cond.sql.replace('?', `$${idx++}`))
      values.push(cond.value)
    } else {
      parts.push(cond.sql)
    }
  }

  return { where: `WHERE ${parts.join(' AND ')}`, values }
}

// ─── 타입 가드 ─────────────────────────────────────────
export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

export function requireId(id: string | undefined): Response | null {
  if (!id || !isValidUUID(id)) {
    return err('INVALID_ID', '유효하지 않은 ID입니다', 400)
  }
  return null
}
