// POST /api/super-admin/impersonate — 테넌트 가장(Impersonation)
// 슈퍼어드민이 특정 사용자로 로그인할 수 있는 magic link를 생성한다.

import { ok, err } from '@/lib/utils'
import { withSuperAdmin } from '@/lib/super-admin'
import { createServiceClient } from '@/lib/supabase/client'

/** 대상 사용자(user_id)에 대해 Supabase magic link를 생성해 반환한다.
 *  현재 로그인된 슈퍼어드민 세션과 별개로 새 브라우저/시크릿창에서 사용해야 한다. */
export const POST = withSuperAdmin(async (req) => {
  const supabase = createServiceClient()
  const body = await req.json().catch(() => null)
  if (!body) return err('INVALID_BODY', '요청 본문이 올바르지 않습니다')

  const { user_id, email: bodyEmail } = body as { user_id?: string; email?: string }

  // user_id 또는 email로 대상 식별
  let targetEmail = bodyEmail
  if (!targetEmail && user_id) {
    const { data } = await supabase.from('users').select('email').eq('id', user_id).maybeSingle()
    targetEmail = (data as { email: string } | null)?.email
  }
  if (!targetEmail) return err('VALIDATION', 'user_id 또는 email이 필요합니다')

  const { data, error } = await supabase.auth.admin.generateLink({
    type:  'magiclink',
    email: targetEmail,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/app/dashboard`,
    },
  })
  if (error) return err('AUTH_ERROR', error.message, 500)

  // action_link 또는 properties.action_link 둘 중 하나에 존재
  const link = data.properties?.action_link ?? (data as unknown as { action_link?: string }).action_link
  if (!link) return err('AUTH_ERROR', 'magic link 생성에 실패했습니다', 500)

  return ok({
    email: targetEmail,
    impersonation_link: link,
    expires_in_seconds: 3600,
    warning: '이 링크는 시크릿/별도 브라우저 창에서 사용하세요. 현재 슈퍼어드민 세션과 충돌할 수 있습니다.',
  })
})
