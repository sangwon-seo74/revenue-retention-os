// POST /api/auth/invite
// 사용자를 테넌트에 초대하는 이메일 발송
// admin 이상만 호출 가능

import { ok, err } from '@/lib/utils'
import { withAuth } from '@/lib/api'
import { createRouteHandlerClient } from '@/lib/supabase/client'
import { sendInvite } from '@/lib/invite'
import type { UserRole } from '@/types/domain'

export const POST = withAuth(async (req, ctx) => {
  const body = await req.json().catch(() => null)
  if (!body) return err('INVALID_BODY', '요청 본문이 올바르지 않습니다')

  const { email, name, role } = body

  if (!email?.trim()) return err('VALIDATION', '이메일은 필수입니다')
  if (!name?.trim())  return err('VALIDATION', '이름은 필수입니다')

  const VALID_ROLES: UserRole[] = ['admin', 'manager', 'sales']
  if (!role || !VALID_ROLES.includes(role)) {
    return err('VALIDATION', `role은 ${VALID_ROLES.join(', ')} 중 하나여야 합니다`)
  }

  if (role === 'admin' && ctx.role !== 'admin') {
    return err('FORBIDDEN', '관리자 계정은 관리자만 초대할 수 있습니다', 403)
  }

  const { supabase } = createRouteHandlerClient(req)

  // 이미 가입된 이메일 확인
  const { count: existing } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .eq('tenant_id', ctx.tenantId)
  if ((existing ?? 0) > 0) return err('DUPLICATE', '이미 등록된 이메일입니다', 409)

  // 테넌트명 및 초대자명 조회
  const [{ data: tenant }, { data: inviter }] = await Promise.all([
    supabase.from('tenants').select('name').eq('id', ctx.tenantId).single(),
    supabase.from('users').select('name').eq('id', ctx.userId).single(),
  ])
  const tenantName  = (tenant  as { name: string } | null)?.name ?? ''
  const inviterName = (inviter as { name: string } | null)?.name ?? ''

  const { inviteUrl, expiresAt } = await sendInvite(supabase, {
    email,
    name,
    role,
    tenantId:    ctx.tenantId,
    userId:      ctx.userId,
    tenantName,
    inviterName,
  })

  return ok({
    message: '초대 이메일을 발송했습니다',
    email,
    role,
    expires_at: expiresAt,
    ...(process.env.NODE_ENV === 'development' && { invite_url: inviteUrl }),
  })
}, { roles: ['admin', 'manager'] })
