// ============================================================
// Revenue Retention OS — Auth 헬퍼
// Supabase Auth 기반 인증 유틸
// ============================================================

import { createServerComponentClient, createBrowserClient } from './client'
import type { UserRole } from '@/types/domain'

// ─── 서버: 현재 세션 조회 ────────────────────────────────
export async function getServerSession() {
  const supabase = await createServerComponentClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) return null
  return session
}

// ─── 서버: 현재 사용자 + 테넌트/역할 조회 ───────────────
export async function getServerUser() {
  const supabase = await createServerComponentClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  // users 테이블에서 tenant_id, role 조회
  const { data: profile } = await supabase
    .from('users')
    .select('id, tenant_id, role, name, team_id, is_active')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active) return null

  return {
    id: profile.id,
    email: user.email!,
    name: profile.name,
    tenantId: profile.tenant_id,
    role: profile.role as UserRole,
    teamId: profile.team_id,
  }
}

// ─── 클라이언트: 로그인 ──────────────────────────────────
export async function signIn(email: string, password: string) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { session: data.session, error }
}

// ─── 클라이언트: 로그아웃 ───────────────────────────────
export async function signOut() {
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

// ─── 클라이언트: 비밀번호 재설정 메일 발송 ──────────────
export async function sendPasswordReset(email: string) {
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })
  return { error }
}

// ─── 클라이언트: 비밀번호 변경 ──────────────────────────
export async function updatePassword(newPassword: string) {
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  return { error }
}
