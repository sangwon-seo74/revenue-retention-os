// POST /api/super-admin/tenants/[id]/reset-password — 임시 비밀번호 발급
// 테넌트의 admin 사용자 중 가장 오래된 1명에게 12자 임시 비밀번호를 강제 설정한다.

import { ok, err } from '@/lib/utils'
import { withSuperAdmin } from '@/lib/super-admin'
import { createServiceClient } from '@/lib/supabase/client'
import { requireId } from '@/lib/api'
import { randomBytes } from 'crypto'

/** 12자 임시 비밀번호 생성: 영문 대소문자 + 숫자 조합.
 *  특수문자는 클립보드/이메일 전달 편의를 위해 제외한다. */
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const bytes = randomBytes(12)
  let pw = ''
  for (let i = 0; i < 12; i++) pw += chars[bytes[i] % chars.length]
  return pw
}

/** 테넌트 관리자 사용자의 비밀번호를 임시값으로 재설정한다.
 *  - 대상: 해당 테넌트의 admin role 사용자 중 가장 먼저 가입한 사람
 *  - Supabase auth.admin.updateUserById로 비밀번호 직접 설정
 *  - 반환되는 임시 비밀번호는 화면에 1회만 노출 (운영자가 직접 전달) */
export const POST = withSuperAdmin(async (_req, params) => {
  const invalid = requireId(params.id)
  if (invalid) return invalid

  const supabase = createServiceClient()

  const { data: target } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('tenant_id', params.id)
    .eq('role', 'admin')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!target) return err('NOT_FOUND', '활성 관리자 사용자가 없습니다', 404)

  const tempPassword = generateTempPassword()
  const { error: authErr } = await supabase.auth.admin.updateUserById(
    (target as { id: string }).id,
    { password: tempPassword }
  )
  if (authErr) return err('AUTH_ERROR', authErr.message, 500)

  return ok({
    user:     { id: (target as { id: string }).id, name: (target as { name: string }).name, email: (target as { email: string }).email },
    temp_password: tempPassword,
    message:  '임시 비밀번호가 발급되었습니다. 사용자에게 안전한 채널로 전달하세요.',
  })
})
