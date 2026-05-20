'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, CreditCard, Receipt,
  Layers, ChevronRight, Shield, LogOut,
  Bell, Search, Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/super-admin/dashboard',      icon: LayoutDashboard, label: '운영 대시보드' },
  { href: '/super-admin/tenants',        icon: Building2,       label: '테넌트 관리' },
  { href: '/super-admin/subscriptions',  icon: CreditCard,      label: '구독 관리' },
  { href: '/super-admin/invoices',       icon: Receipt,         label: '결제 관리' },
  { href: '/super-admin/plans',          icon: Layers,          label: '플랜 관리' },
  { href: '/super-admin/system/logs',    icon: Activity,        label: '시스템 관리' },
]

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* 사이드바 */}
      <aside className="w-[220px] shrink-0 flex flex-col border-r border-white/10 bg-gray-950">
        {/* 로고 */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none">Revenue OS</p>
              <p className="text-[10px] text-blue-400 mt-0.5 font-medium">Super Admin</p>
            </div>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                  active
                    ? 'bg-blue-600/20 text-blue-400 font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* 하단 유저 영역 */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
            <div className="w-7 h-7 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-300 text-xs font-bold">
              S
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">Super Admin</p>
              <p className="text-[10px] text-gray-500 truncate">admin@revenue-os.com</p>
            </div>
            <LogOut className="w-3.5 h-3.5 text-gray-500 hover:text-red-400 transition-colors" />
          </div>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 헤더 */}
        <header className="h-13 shrink-0 flex items-center justify-between px-6 border-b border-white/10 bg-gray-950">
          <div className="flex items-center gap-3 flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-500 shrink-0" />
            <input
              placeholder="테넌트명, 이메일 검색..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* 페이지 */}
        <main className="flex-1 overflow-y-auto bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  )
}
