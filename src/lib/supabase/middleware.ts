// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import type { SetAllCookies } from '@supabase/ssr/dist/main/types'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll: ((cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        }) as SetAllCookies,
      },
    }
  )

  // 세션 갱신 (중요: 이 호출이 토큰 refresh 처리함)
  const { data: { user } } = await supabase.auth.getUser()

  // 인증 필요 경로 보호
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isAppPage = request.nextUrl.pathname.startsWith('/app')
  const isSuperAdmin = request.nextUrl.pathname.startsWith('/super-admin')

  if (!user && (isAppPage || isSuperAdmin)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // super_admin 경로 화이트리스트 검증 (환경변수로 이메일 관리)
  if (isSuperAdmin) {
    const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(',') ?? []
    if (!user || !superAdminEmails.includes(user.email ?? '')) {
      return NextResponse.redirect(new URL('/app/dashboard', request.url))
    }
  }

  return supabaseResponse
}