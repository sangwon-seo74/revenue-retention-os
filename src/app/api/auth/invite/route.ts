// POST /api/auth/invite
// 사용자를 테넌트에 초대하는 이메일 발송
// admin 이상만 호출 가능

import { ok, err } from '@/lib/utils'
import { withAuth } from '@/lib/api'
import { createInviteToken } from '@/lib/invite-token'
import type { UserRole } from '@/types/domain'

// ─── 초대 이메일 발송 ────────────────────────────────────
async function sendInviteEmail(params: {
  to: string
  name: string
  tenantName: string
  inviterName: string
  role: UserRole
  inviteUrl: string
}): Promise<void> {
  // TODO: 실제 이메일 발송 (Nodemailer / Resend / SendGrid 등)
  // await resend.emails.send({
  //   from: 'noreply@revenue-os.com',
  //   to: params.to,
  //   subject: `[Revenue OS] ${params.tenantName} 팀에 초대되었습니다`,
  //   html: renderInviteEmailTemplate(params),
  // })

  console.log('[Invite Email]', params)
}

// ─── POST 핸들러 ─────────────────────────────────────────
export const POST = withAuth(async (req, ctx) => {
  const body = await req.json().catch(() => null)
  if (!body) return err('INVALID_BODY', '요청 본문이 올바르지 않습니다')

  const { email, name, role } = body

  // 유효성 검증
  if (!email?.trim()) return err('VALIDATION', '이메일은 필수입니다')
  if (!name?.trim())  return err('VALIDATION', '이름은 필수입니다')

  const VALID_ROLES: UserRole[] = ['admin', 'manager', 'sales']
  if (!role || !VALID_ROLES.includes(role)) {
    return err('VALIDATION', `role은 ${VALID_ROLES.join(', ')} 중 하나여야 합니다`)
  }

  // admin만 admin 초대 가능
  if (role === 'admin' && ctx.role !== 'admin') {
    return err('FORBIDDEN', '관리자 계정은 관리자만 초대할 수 있습니다', 403)
  }

  // 이미 가입된 이메일 확인
  // const { rowCount } = await db.query(
  //   'SELECT 1 FROM users WHERE email = $1 AND tenant_id = $2',
  //   [email, ctx.tenantId]
  // )
  // if (rowCount > 0) return err('DUPLICATE', '이미 가입된 이메일입니다', 409)

  // 기존 초대 토큰 무효화
  // await db.query(
  //   "DELETE FROM invite_tokens WHERE email = $1 AND tenant_id = $2",
  //   [email, ctx.tenantId]
  // )

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const token = createInviteToken({
    email,
    tenantId: ctx.tenantId,
    role,
    invitedBy: ctx.userId,
    expiresAt,
  })

  // 토큰 저장 (DB 또는 Redis)
  // await db.query(`
  //   INSERT INTO invite_tokens (token, email, tenant_id, role, invited_by, expires_at)
  //   VALUES ($1, $2, $3, $4, $5, $6)
  // `, [token, email, ctx.tenantId, role, ctx.userId, expiresAt])

  // 이메일 발송
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteUrl = `${baseUrl}/invite/${token}`

  await sendInviteEmail({
    to: email,
    name,
    tenantName: '(주)테크솔루션', // 실제는 tenant 조회
    inviterName: '관리자',          // 실제는 user 조회
    role,
    inviteUrl,
  })

  return ok({
    message: '초대 이메일을 발송했습니다',
    email,
    role,
    expires_at: expiresAt,
    // 개발 편의용: 실제 운영 시 제거
    ...(process.env.NODE_ENV === 'development' && { invite_url: inviteUrl }),
  })
}, { roles: ['admin', 'manager'] })
