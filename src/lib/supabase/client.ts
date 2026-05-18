// ============================================================
// Revenue Retention OS — Supabase 클라이언트
//
// 설치:
//   npm install @supabase/supabase-js @supabase/ssr
//
// 환경변수 (.env.local):
//   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
//   SUPABASE_SERVICE_ROLE_KEY=eyJ...   (서버 전용, 절대 클라이언트 노출 금지)
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// ─── 타입 (Supabase CLI로 자동 생성 권장) ──────────────
// supabase gen types typescript --project-id <id> > src/types/supabase.ts
// import type { Database } from '@/types/supabase'

// ─── 브라우저 클라이언트 (클라이언트 컴포넌트용) ────────
export function createBrowserClient() {
  return createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  )
}

// ─── 서버 컴포넌트용 클라이언트 ─────────────────────────
// Next.js App Router Server Component에서 사용
export async function createServerComponentClient() {
  const cookieStore = cookies()

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서는 set 불가 - 미들웨어에서 처리
          }
        },
      },
    }
  )
}

// ─── Route Handler용 클라이언트 ─────────────────────────
// API Route Handler에서 사용 (req/res 기반)
export function createRouteHandlerClient(request: NextRequest) {
  const response = { headers: new Headers() }

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.headers.append(
              'Set-Cookie',
              `${name}=${value}; Path=/; ${options?.httpOnly ? 'HttpOnly;' : ''}`
            )
          })
        },
      },
    }
  )

  return { supabase, response }
}

// ─── 미들웨어용 클라이언트 ──────────────────────────────
export function createMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
}

// ─── 서비스 롤 클라이언트 (서버 전용) ────────────────────
// RLS 우회가 필요한 관리 작업에만 사용 (super_admin API 등)
export function createServiceClient() {
  if (!SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다')
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
