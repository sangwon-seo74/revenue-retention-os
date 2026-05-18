'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, Phone, FileText,
  RefreshCw, CheckSquare, BarChart2, Settings,
  ChevronRight, Bell, Search, LogOut, Menu, X,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── 네비게이션 정의 ─────────────────────────────────────
const NAV_MAIN = [
  { href: '/app/dashboard',         icon: LayoutDashboard, label: '대시보드' },
  { href: '/app/companies',         icon: Building2,       label: '고객사' },
  { href: '/app/activities/calls',  icon: Phone,           label: '영업 활동' },
  { href: '/app/contracts',         icon: FileText,        label: '계약' },
  {
    href: '/app/renewals',
    icon: RefreshCw,
    label: '갱신 관리',
    highlight: true,
    badge: 5,         // 실제: urgentRenewalsCount
  },
  {
    href: '/app/tasks/my',
    icon: CheckSquare,
    label: '업무',
    badge: 3,         // 실제: overdueTasksCount
  },
]

const NAV_BOTTOM = [
  { href: '/app/reports/renewal-rate', icon: BarChart2, label: '리포트', roles: ['admin', 'manager'] },
  { href: '/app/settings/tenant',      icon: Settings,  label: '설정',   roles: ['admin'] },
]

// ─── 사이드바 네비 아이템 ─────────────────────────────────
function NavItem({
  href, icon: Icon, label, badge, highlight, collapsed
}: {
  href: string
  icon: React.ElementType
  label: string
  badge?: number
  highlight?: boolean
  collapsed: boolean
}) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors relative',
        collapsed ? 'justify-center' : '',
        active
          ? highlight
            ? 'bg-blue-600 text-white'
            : 'bg-blue-50 text-blue-700 font-medium'
          : highlight
            ? 'text-blue-600 hover:bg-blue-50 font-medium'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && badge && badge > 0 ? (
        <span className={cn(
          'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
          active && highlight ? 'bg-white/30 text-white' : 'bg-red-500 text-white'
        )}>
          {badge}
        </span>
      ) : null}
      {collapsed && badge && badge > 0 ? (
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      ) : null}
    </Link>
  )
}

// ─── 메인 레이아웃 ────────────────────────────────────────
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // 현재 페이지 타이틀 추출
  const allNav = [...NAV_MAIN, ...NAV_BOTTOM]
  const currentNav = allNav.find(n =>
    pathname === n.href || pathname.startsWith(n.href + '/')
  )

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* 로고 */}
      <div className={cn(
        'flex items-center border-b border-gray-100 shrink-0',
        collapsed ? 'px-3 py-4 justify-center' : 'px-4 py-4 gap-2.5'
      )}>
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-none truncate">Revenue OS</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Retention Platform</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 shrink-0 hidden lg:flex"
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <ChevronRight className="w-3.5 h-3.5 rotate-180" />
          }
        </button>
      </div>

      {/* 메인 네비 */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_MAIN.map(item => (
          <NavItem key={item.href} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* 하단 네비 */}
      <div className="px-2 pb-3 space-y-0.5 border-t border-gray-100 pt-3 shrink-0">
        {NAV_BOTTOM.map(item => (
          <NavItem key={item.href} {...item} collapsed={collapsed} />
        ))}

        {/* 유저 프로필 */}
        <div className={cn(
          'flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors mt-1',
          collapsed ? 'justify-center' : ''
        )}>
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
            K
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">김관리자</p>
                <p className="text-[10px] text-gray-400 truncate">admin</p>
              </div>
              <LogOut className="w-3.5 h-3.5 text-gray-400 hover:text-red-400 shrink-0" />
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* 데스크탑 사이드바 */}
      <aside className={cn(
        'hidden lg:flex flex-col shrink-0 bg-white border-r border-gray-100 transition-all duration-200',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}>
        {sidebarContent}
      </aside>

      {/* 모바일 드로어 오버레이 */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[220px] bg-white border-r border-gray-100 z-50 flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="h-13 shrink-0 bg-white border-b border-gray-100 flex items-center px-4 gap-3">
          {/* 모바일 햄버거 */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* 페이지 타이틀 */}
          <div className="flex-1">
            {currentNav && (
              <p className="text-sm font-semibold text-gray-800">{currentNav.label}</p>
            )}
          </div>

          {/* 우측 액션 */}
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button className="relative p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* 페이지 컨텐츠 */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
