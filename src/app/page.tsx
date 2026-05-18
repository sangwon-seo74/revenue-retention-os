import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/supabase/auth'

export default async function RootPage() {
  const session = await getServerSession()
  // 세션 있으면 대시보드, 없으면 로그인
  redirect(session ? '/app/dashboard' : '/login')
}
