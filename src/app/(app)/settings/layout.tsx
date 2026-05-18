import Link from 'next/link'
import { ReactNode } from 'react'
import {
  Building, Users, UsersRound, Package, MessageSquare,
  Plug, CreditCard, Receipt,
} from 'lucide-react'

const SETTINGS_NAV = [
  { href: '/settings/tenant', label: '테넌트 정보', icon: Building },
  { href: '/settings/users', label: '사용자 관리', icon: Users },
  { href: '/settings/teams', label: '팀 관리', icon: UsersRound },
  { href: '/settings/products', label: '제품 관리', icon: Package },
  { href: '/settings/templates', label: '메시지 템플릿', icon: MessageSquare },
  { href: '/settings/integrations', label: 'API 연동', icon: Plug },
  { hr: true },
  { href: '/settings/subscription', label: '구독 현황', icon: CreditCard },
  { href: '/settings/invoices', label: '결제 이력', icon: Receipt },
] as const

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-6 min-h-screen">
      {/* 사이드 네비 */}
      <aside className="w-52 flex-shrink-0">
        <div className="sticky top-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">설정</p>
          <nav className="space-y-0.5">
            {SETTINGS_NAV.map((item, i) => {
              if ('hr' in item) return <div key={i} className="my-2 border-t border-slate-100 dark:border-slate-800" />

              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* 콘텐츠 영역 */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}
