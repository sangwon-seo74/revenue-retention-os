// POST /api/auth/log-access — 로그인 성공/실패 시 audit_logs에 기록 + users.last_login_at 업데이트

import { NextRequest } from 'next/server'
import { ok, err } from '@/lib/utils'
import { createServiceClient } from '@/lib/supabase/client'

/** 클라이언트 IP 추출.
 *  Vercel/프록시 환경에서는 x-forwarded-for/x-real-ip 헤더를 우선 사용한다. */
function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? ''
}

/** User-Agent 문자열에서 브라우저와 OS만 간단히 추출.
 *  실패하면 원본을 그대로 반환한다. */
function parseUA(ua: string): string {
  if (!ua) return ''
  const browser = /Edg\/|Edge\//.test(ua) ? 'Edge'
    : /Chrome\//.test(ua) && !/Edg/.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) && !/Chrome/.test(ua) ? 'Safari'
    : /Firefox\//.test(ua) ? 'Firefox'
    : 'Unknown'
  const os = /Windows/.test(ua) ? 'Windows'
    : /Mac OS X/.test(ua) ? 'macOS'
    : /Android/.test(ua) ? 'Android'
    : /iPhone|iPad|iOS/.test(ua) ? 'iOS'
    : /Linux/.test(ua) ? 'Linux'
    : 'Unknown'
  return `${browser} / ${os}`
}

/** 로그인 시도 결과를 audit_logs에 기록한다.
 *  - 성공 시: users 테이블에서 user_id/tenant_id 조회해 함께 저장, last_login_at 업데이트
 *  - 실패 시: email만 저장 (user_id/tenant_id는 null) */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return err('INVALID_BODY', '요청 본문이 올바르지 않습니다')

  const { email, action = 'login', result = 'success' } = body as { email?: string; action?: string; result?: string }
  if (!email?.trim()) return err('VALIDATION', 'email은 필수입니다')

  const supabase = createServiceClient()
  const ip = getClientIp(req)
  const ua = parseUA(req.headers.get('user-agent') ?? '')

  let userId: string | null    = null
  let tenantId: string | null  = null

  if (result === 'success') {
    const { data: user } = await supabase
      .from('users')
      .select('id, tenant_id')
      .eq('email', email)
      .maybeSingle()
    if (user) {
      userId   = (user as { id: string }).id
      tenantId = (user as { tenant_id: string }).tenant_id
      // 마지막 로그인 시각 갱신 (best-effort)
      await supabase.from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId)
    }
  }

  await supabase.from('audit_logs').insert({
    tenant_id:  tenantId,
    user_id:    userId,
    email:      email.trim(),
    action,
    ip,
    user_agent: ua,
    result,
  })

  return ok({ logged: true })
}
