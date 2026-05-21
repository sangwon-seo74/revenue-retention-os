// POST /api/auth/accept-invite
// 초대 토큰 검증 후 사용자 계정 생성

import { NextRequest } from 'next/server'
import { ok, err } from '@/lib/utils'
import { verifyInviteToken } from '@/lib/invite-token'
import { createServiceClient } from '@/lib/supabase/client'

// ─── GET — 토큰 유효성 확인 (초대 페이지 진입 시 호출) ──
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) return err('MISSING_TOKEN', '토큰이 없습니다', 400)

  const payload = verifyInviteToken(token)
  if (!payload) return err('INVALID_TOKEN', '유효하지 않거나 만료된 초대 링크입니다', 400)

  // 테넌트 이름 조회
  const supabase = createServiceClient()
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name')
    .eq('id', payload.tenantId)
    .single()

  return ok({
    email:       payload.email,
    role:        payload.role,
    tenant_name: (tenant as { name: string } | null)?.name ?? '',
    expires_at:  payload.expiresAt,
  })
}

// ─── POST — 계정 생성 ────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return err('INVALID_BODY', '요청 본문이 올바르지 않습니다')

  const { token, name, password } = body

  if (!token)           return err('VALIDATION', 'token은 필수입니다')
  if (!name?.trim())    return err('VALIDATION', 'name은 필수입니다')
  if (!password)        return err('VALIDATION', 'password는 필수입니다')
  if (password.length < 8) return err('VALIDATION', '비밀번호는 8자 이상이어야 합니다')

  // 토큰 서명 + 만료일 검증
  const payload = verifyInviteToken(token)
  if (!payload) return err('INVALID_TOKEN', '유효하지 않거나 만료된 초대 링크입니다', 400)

  const supabase = createServiceClient()

  // 중복 가입 방지
  const { count: existing } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('email', payload.email)
  if ((existing ?? 0) > 0) return err('DUPLICATE', '이미 가입된 이메일입니다', 409)

  // Supabase Auth 계정 생성
  // DB 트리거(fn_handle_new_auth_user)가 app_metadata를 읽어 users 테이블 레코드를 자동 생성
  const { data, error } = await supabase.auth.admin.createUser({
    email:         payload.email,
    password,
    email_confirm: true,
    user_metadata: { name },
    app_metadata:  { tenant_id: payload.tenantId, role: payload.role },
  })
  if (error) return err('AUTH_ERROR', error.message, 500)

  // 사용된 토큰 무효화 (초대 토큰 DB 저장이 활성화된 경우에만 실행)
  await supabase.from('invite_tokens').delete().eq('token', token)

  return ok({
    message: '계정이 생성되었습니다. 로그인하세요.',
    user: { id: data.user.id, email: data.user.email, name },
  })
}
