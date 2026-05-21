// POST /api/super-admin/tenants/[id]/resend-invite — 초대 메일 재발송
// 아직 가입하지 않은 admin role 사용자에게만 의미가 있으나,
// 운영 편의를 위해 미가입자가 없으면 가장 오래된 admin에게도 재발송한다.

import { ok, err } from '@/lib/utils'
import { withSuperAdmin } from '@/lib/super-admin'
import { createServiceClient } from '@/lib/supabase/client'
import { requireId } from '@/lib/api'
import { sendInvite } from '@/lib/invite'

/** 초대 메일 재발송.
 *  body로 email/name을 직접 전달하면 그 주소로 발송, 없으면 테넌트의 최초 admin 이메일을 사용한다.
 *  성공 시 inviteUrl을 반환(개발/디버깅용). */
export const POST = withSuperAdmin(async (req, params) => {
  const invalid = requireId(params.id)
  if (invalid) return invalid

  const supabase = createServiceClient()
  const body = await req.json().catch(() => ({} as Record<string, unknown>))

  let email = (body as { email?: string }).email?.trim()
  let name  = (body as { name?: string }).name?.trim()

  if (!email) {
    const { data: target } = await supabase
      .from('users')
      .select('email, name')
      .eq('tenant_id', params.id)
      .eq('role', 'admin')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (!target) return err('NOT_FOUND', '재발송할 관리자 정보가 없습니다', 404)
    email = (target as { email: string }).email
    name  = (target as { name: string }).name
  }

  const { data: tenant } = await supabase.from('tenants').select('name').eq('id', params.id).single()
  const tenantName = (tenant as { name: string } | null)?.name ?? ''

  const { inviteUrl, expiresAt } = await sendInvite(supabase, {
    email:       email!,
    name:        name ?? email!,
    role:        'admin',
    tenantId:    params.id,
    userId:      null,
    tenantName,
    inviterName: 'Super Admin',
  })

  return ok({ email, inviteUrl, expiresAt, message: `${email}로 초대 메일을 재발송했습니다` })
})
