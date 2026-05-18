// ============================================================
// Revenue Retention OS — 미들웨어 (Supabase Auth 연동)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/client'

const SUPER_ADMIN_EMAILS = (
  process.env.SUPER_ADMIN_EMAILS ?? ''
).split(',').map(e => e.trim()).filter(Boolean)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const res = NextResponse.next()

  // ── Supabase 세션 갱신 ──────────────────────────────────
  const supabase = createMiddlewareClient(req, res)
  const { data: { session } } = await supabase.auth.getSession()

  // ── /super-admin/* ─────────────────────────────────────
  if (pathname.startsWith('/super-admin')) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}&type=super_admin`, req.url)
      )
    }
    const email = session.user.email ?? ''
    if (!SUPER_ADMIN_EMAILS.includes(email)) {
      return NextResponse.redirect(new URL('/app/dashboard', req.url))
    }
    return res
  }

  // ── /app/* ──────────────────────────────────────────────
  if (pathname.startsWith('/app')) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url)
      )
    }

    // users 테이블에서 role 조회
    // 운영 최적화: JWT custom claim에 role/tenant_id 넣어 DB 조회 제거 가능
    //   supabase.auth.admin.updateUserById(id, { app_metadata: { role, tenant_id } })
    //   → session.user.app_metadata.role 로 읽기
    const { data: profile } = await supabase
      .from('users')
      .select('role, tenant_id, is_active')
      .eq('id', session.user.id)
      .single()

    if (!profile || !profile.is_active) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const role = profile.role as string

    if (pathname.startsWith('/app/reports') && !['admin', 'manager'].includes(role)) {
      return NextResponse.redirect(new URL('/app/dashboard', req.url))
    }
    if (pathname.startsWith('/app/settings') && role !== 'admin') {
      return NextResponse.redirect(new URL('/app/dashboard', req.url))
    }
    if (pathname.startsWith('/app/tasks/team') && !['admin', 'manager'].includes(role)) {
      return NextResponse.redirect(new URL('/app/tasks/my', req.url))
    }

    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-tenant-id', profile.tenant_id)
    requestHeaders.set('x-user-id',   session.user.id)
    requestHeaders.set('x-user-role', role)

    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/app/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/app/:path*', '/super-admin/:path*', '/login'],
}
