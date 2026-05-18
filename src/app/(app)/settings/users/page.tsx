'use client'

import { useState } from 'react'
import { Users, Plus, Mail, Shield, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react'

const MOCK_USERS = [
  { id: 'u1', name: '홍길동', email: 'hong@company.com', role: 'manager', team: '서울팀', is_active: true, last_login_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'u2', name: '김영수', email: 'kim@company.com', role: 'sales', team: '서울팀', is_active: true, last_login_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: 'u3', name: '이지원', email: 'lee@company.com', role: 'sales', team: '부산팀', is_active: true, last_login_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'u4', name: '박소연', email: 'park@company.com', role: 'sales', team: '부산팀', is_active: true, last_login_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'u5', name: '최관리', email: 'choi@company.com', role: 'admin', team: null, is_active: true, last_login_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
]

const ROLE_LABEL: Record<string, string> = { admin: '관리자', manager: '팀장', sales: '영업사원' }
const ROLE_CLASS: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
  manager: 'bg-blue-50 text-blue-700 border-blue-200',
  sales: 'bg-slate-100 text-slate-600 border-slate-200',
}

function InviteModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">사용자 초대</h3>
          <button onClick={onClose} className="text-slate-400 text-xl">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">이메일 *</label>
            <input type="email" placeholder="user@company.com" className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">이름 *</label>
            <input placeholder="홍길동" className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">역할 *</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="sales">영업사원</option>
                <option value="manager">팀장</option>
                <option value="admin">관리자</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">팀</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">팀 없음</option>
                <option>서울팀</option>
                <option>부산팀</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">취소</button>
          <button className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            초대 메일 발송
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UsersSettingPage() {
  const [showInvite, setShowInvite] = useState(false)

  const formatLastLogin = (at: string) => {
    const diff = Date.now() - new Date(at).getTime()
    const h = Math.floor(diff / (1000 * 60 * 60))
    const d = Math.floor(h / 24)
    if (h < 1) return '방금 전'
    if (h < 24) return `${h}시간 전`
    return `${d}일 전`
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">사용자 관리</h2>
          <p className="text-sm text-slate-500 mt-0.5">총 {MOCK_USERS.length}명 (플랜 한도: 10명)</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          사용자 초대
        </button>
      </div>

      {/* 플랜 한도 바 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">사용자 슬롯</span>
          <span className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">{MOCK_USERS.length} / 10</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(MOCK_USERS.length / 10) * 100}%` }} />
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              {['이름', '이메일', '역할', '팀', '최근 접속', '상태', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-xs font-medium text-slate-500 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS.map(user => (
              <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.name[0]}
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${ROLE_CLASS[user.role]}`}>
                    {ROLE_LABEL[user.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{user.team ?? '—'}</td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {user.last_login_at ? formatLastLogin(user.last_login_at) : '—'}
                </td>
                <td className="px-4 py-3">
                  {user.is_active
                    ? <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="w-3.5 h-3.5" />활성</span>
                    : <span className="flex items-center gap-1 text-xs text-slate-400"><XCircle className="w-3.5 h-3.5" />비활성</span>
                  }
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center ml-auto">
                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  )
}
