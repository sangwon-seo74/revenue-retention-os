// POST /api/contacts — 담당자 등록

import { ok, err } from '@/lib/utils'
import { withAuth } from '@/lib/api'
import { createRouteHandlerClient } from '@/lib/supabase/client'

export const POST = withAuth(async (req, ctx) => {
  const body = await req.json().catch(() => null)
  if (!body) return err('INVALID_BODY', '요청 본문이 올바르지 않습니다')
  const { supabase } = createRouteHandlerClient(req)

  const { company_id, name, title, department, mobile, email, is_primary, is_decision_maker } = body

  if (!name?.trim()) return err('VALIDATION', '이름은 필수입니다')
  if (!company_id)   return err('VALIDATION', '고객사 ID가 필요합니다')

  const { data, error } = await supabase
    .from('contacts')
    .insert({
      tenant_id:         ctx.tenantId,
      company_id,
      name:              name.trim(),
      title:             title?.trim()      || null,
      department:        department?.trim() || null,
      mobile:            mobile?.trim()     || null,
      email:             email?.trim()      || null,
      is_primary:        is_primary        ?? false,
      is_decision_maker: is_decision_maker ?? false,
    })
    .select()
    .single()

  if (error) return err('DB_ERROR', error.message, 500)
  return ok(data)
})
