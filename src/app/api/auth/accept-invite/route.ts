// POST /api/auth/accept-invite
// 초대 토큰 검증 후 사용자 계정 생성

import { NextRequest } from 'next/server'
import { ok, err } from '@/lib/utils'
import type { UserRole } from '@/types/domain'

interface InviteTokenPayload {
  email: string
  tenantId: string
  role: UserRole
  invitedBy: string
  expiresAt: string
}

// ─── 토큰 검증 ────────────────────────────────────────────
function verifyInviteToken(token: string): InviteTokenPayload | null {
  try {
    // 실제 구현: JWT 검증 또는 DB 조회
    const payload = JSON.parse(
      Buffer.from(token, 'base64url').toString()
    ) as InviteTokenPayload

    if (new Date(payload.expiresAt) < new Date()) return null
    return payload
  } catch {
    return null
  }
}

// ─── GET — 토큰 유효성 확인 (초대 페이지 진입 시 호출) ──
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) return err('MISSING_TOKEN', '토큰이 없습니다', 400)

  const payload = verifyInviteToken(token)
  if (!payload) return err('INVALID_TOKEN', '유효하지 않거나 만료된 초대 링크입니다', 400)

  // 이미 사용됐는지 확인
  // const { rowCount } = await db.query(
  //   'SELECT 1 FROM users WHERE email = $1 AND tenant_id = $2',
  //   [payload.email, payload.tenantId]
  // )
  // if (rowCount > 0) return err('ALREADY_USED', '이미 사용된 초대 링크입니다', 409)

  // 테넌트 이름 조회
  // const { rows: [tenant] } = await db.query(
  //   'SELECT name FROM tenants WHERE id = $1',
  //   [payload.tenantId]
  // )

  return ok({
    email: payload.email,
    role: payload.role,
    tenant_name: '(주)테크솔루션', // 실제는 tenant 조회
    expires_at: payload.expiresAt,
  })
}

// ─── POST — 계정 생성 ────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return err('INVALID_BODY', '요청 본문이 올바르지 않습니다')

  const { token, name, password } = body

  if (!token)    return err('VALIDATION', 'token은 필수입니다')
  if (!name?.trim())     return err('VALIDATION', 'name은 필수입니다')
  if (!password) return err('VALIDATION', 'password는 필수입니다')
  if (password.length < 8) return err('VALIDATION', '비밀번호는 8자 이상이어야 합니다')

  // 토큰 검증
  const payload = verifyInviteToken(token)
  if (!payload) return err('INVALID_TOKEN', '유효하지 않거나 만료된 초대 링크입니다', 400)

  // 중복 가입 방지
  // const { rowCount } = await db.query(
  //   'SELECT 1 FROM users WHERE email = $1',
  //   [payload.email]
  // )
  // if (rowCount > 0) return err('DUPLICATE', '이미 가입된 이메일입니다', 409)

  // 비밀번호 해시
  // const hashedPw = await bcrypt.hash(password, 12)

  // Supabase Auth 사용 시:
  // const { createServiceClient } = await import('@/lib/supabase/client')
  // const supabaseAdmin = createServiceClient()
  //
  // // 1. Auth 유저 생성
  // const { data, error } = await supabaseAdmin.auth.admin.createUser({
  //   email: payload.email,
  //   password,
  //   email_confirm: true,
  //   user_metadata: { name },
  //   app_metadata:  { tenant_id: payload.tenantId, role: payload.role },
  // })
  // if (error) throw error
  //
  // // 2. users 테이블 레코드 생성 (트리거로 자동화도 가능)
  // const { error: dbErr } = await supabaseAdmin
  //   .from('users')
  //   .insert({
  //     id:        data.user.id,
  //     tenant_id: payload.tenantId,
  //     email:     payload.email,
  //     name,
  //     role:      payload.role,
  //     is_active: true,
  //   })
  // if (dbErr) {
  //   // 롤백: Auth 유저 삭제
  //   await supabaseAdmin.auth.admin.deleteUser(data.user.id)
  //   throw dbErr
  // }
  //
  // // 3. 토큰 무효화
  // await supabaseAdmin
  //   .from('invite_tokens')
  //   .delete()
  //   .eq('token', token)

  const mockUser = {
    id: crypto.randomUUID(),
    tenant_id: payload.tenantId,
    email: payload.email,
    name,
    role: payload.role,
    is_active: true,
    created_at: new Date().toISOString(),
  }

  return ok({
    message: '계정이 생성되었습니다. 로그인하세요.',
    user: { id: mockUser.id, email: mockUser.email, name: mockUser.name },
  })
}
