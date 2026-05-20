'use client'

import { useState } from 'react'
import {
  Search,
  CheckCircle2,
  Plus, Bell, Megaphone, Wrench, X
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

// ─── Mock 데이터 — 접속 로그 ──────────────────────────────
const MOCK_LOGS = [
  { id: 'l1', tenant_name: '(주)테크솔루션', user_name: '김관리자', email: 'admin@techsolution.co.kr', action: 'login', ip: '121.133.24.85', ua: 'Chrome / macOS', at: '2024-06-15T10:23:00Z', result: 'success' },
  { id: 'l2', tenant_name: '코리아크레딧(주)', user_name: '박이사', email: 'park@koriacredit.co.kr', action: 'login', ip: '222.107.45.12', ua: 'Safari / iPhone', at: '2024-06-15T10:01:00Z', result: 'success' },
  { id: 'l3', tenant_name: '한국신용정보(주)', user_name: '이팀장', email: 'lee@kcinfo.co.kr', action: 'login', ip: '175.200.12.34', ua: 'Chrome / Windows', at: '2024-06-15T09:45:00Z', result: 'fail' },
  { id: 'l4', tenant_name: '(주)비즈데이터', user_name: '최담당', email: 'choi@bizdata.co.kr', action: 'login', ip: '14.52.89.200', ua: 'Edge / Windows', at: '2024-06-15T09:30:00Z', result: 'success' },
  { id: 'l5', tenant_name: '(주)테크솔루션', user_name: '김관리자', email: 'admin@techsolution.co.kr', action: 'settings_change', ip: '121.133.24.85', ua: 'Chrome / macOS', at: '2024-06-15T10:25:00Z', result: 'success' },
  { id: 'l6', tenant_name: '(주)알파리서치', user_name: '정영업', email: 'jung@alpharesearch.co.kr', action: 'login', ip: '118.45.78.90', ua: 'Chrome / macOS', at: '2024-06-14T17:00:00Z', result: 'success' },
  { id: 'l7', tenant_name: '대한데이터서비스', user_name: '신대표', email: 'shin@dkdata.co.kr', action: 'login', ip: '58.227.44.11', ua: 'Firefox / Windows', at: '2024-06-14T16:30:00Z', result: 'success' },
]

// ─── Mock 데이터 — 공지사항 ───────────────────────────────
type AnnouncementType = 'notice' | 'maintenance' | 'update'
type Announcement = {
  id: string
  type: AnnouncementType
  title: string
  content: string
  is_active: boolean
  starts_at: string
  ends_at: string | null
  created_at: string
}

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1', type: 'maintenance',
    title: '서버 정기 점검 안내 (6/20 02:00~04:00)',
    content: '서비스 안정화를 위한 정기 점검이 예정되어 있습니다. 해당 시간 동안 서비스 이용이 일시 중단됩니다.',
    is_active: true, starts_at: '2024-06-19T17:00:00Z', ends_at: '2024-06-20T19:00:00Z', created_at: '2024-06-15T09:00:00Z',
  },
  {
    id: 'a2', type: 'update',
    title: '갱신 파이프라인 UI 개선 안내',
    content: '갱신 관리 화면이 업데이트되었습니다. 칸반 보드 성능이 개선되었으며 새로운 필터 기능이 추가되었습니다.',
    is_active: false, starts_at: '2024-06-10T00:00:00Z', ends_at: '2024-06-17T00:00:00Z', created_at: '2024-06-10T09:00:00Z',
  },
]

// ─── 탭 ──────────────────────────────────────────────────
const TABS = ['접속 로그', '공지/점검']

// ─── 로그 액션 레이블 ─────────────────────────────────────
const ACTION_LABEL: Record<string, string> = {
  login: '로그인',
  logout: '로그아웃',
  settings_change: '설정 변경',
  data_export: '데이터 내보내기',
}

// ─── 공지 타입 ────────────────────────────────────────────
const ANN_CFG: Record<AnnouncementType, { label: string; cls: string; icon: React.ElementType }> = {
  notice:      { label: '공지',     cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30',    icon: Bell },
  maintenance: { label: '점검',     cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: Wrench },
  update:      { label: '업데이트', cls: 'bg-green-500/15 text-green-400 border-green-500/30', icon: CheckCircle2 },
}

// ─── 공지 작성 모달 ───────────────────────────────────────
function AnnouncementModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    type: 'notice' as AnnouncementType,
    title: '', content: '', starts_at: '', ends_at: '',
  })
  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">공지 작성</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-700 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3.5">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">유형</label>
            <select
              value={form.type}
              onChange={e => set('type', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="notice">공지</option>
              <option value="maintenance">점검</option>
              <option value="update">업데이트</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">제목 *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="공지 제목"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">내용 *</label>
            <textarea value={form.content} onChange={e => set('content', e.target.value)}
              rows={4} placeholder="공지 내용"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">게시 시작</label>
              <input type="datetime-local" value={form.starts_at} onChange={e => set('starts_at', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">게시 종료 (선택)</label>
              <input type="datetime-local" value={form.ends_at} onChange={e => set('ends_at', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2 text-sm text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700">
            취소
          </button>
          <button onClick={onClose}
            className="flex-1 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium">
            게시
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 메인 ────────────────────────────────────────────────
export default function SystemLogsPage() {
  const [activeTab, setActiveTab] = useState('접속 로그')
  const [q, setQ] = useState('')
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)

  const filteredLogs = MOCK_LOGS.filter(l =>
    !q || l.tenant_name.includes(q) || l.user_name.includes(q) || l.email.includes(q)
  )

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">시스템 관리</h1>
          <p className="text-sm text-gray-400 mt-0.5">접속 로그 및 공지 관리</p>
        </div>
        {activeTab === '공지/점검' && (
          <button
            onClick={() => setShowAnnouncementModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> 공지 작성
          </button>
        )}
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-700/50 gap-0.5">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors -mb-px border-b-2',
              activeTab === tab
                ? 'text-blue-400 border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── 접속 로그 탭 ── */}
      {activeTab === '접속 로그' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-500" />
            <input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="테넌트명, 이메일 검색"
              className="bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none flex-1"
            />
          </div>

          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  {['일시', '테넌트', '사용자', '액션', 'IP', '환경', '결과'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {filteredLogs.map(log => (
                  <tr key={log.id} className={cn(
                    'hover:bg-white/3 transition-colors',
                    log.result === 'fail' && 'bg-red-950/10'
                  )}>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-300 font-mono">{formatDate(log.at)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-200">{log.tenant_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-200">{log.user_name}</p>
                      <p className="text-[10px] text-gray-500">{log.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-300">{ACTION_LABEL[log.action] ?? log.action}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400 font-mono">{log.ip}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400">{log.ua}</span>
                    </td>
                    <td className="px-4 py-3">
                      {log.result === 'success'
                        ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                        : <X className="w-4 h-4 text-red-400" />
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 공지/점검 탭 ── */}
      {activeTab === '공지/점검' && (
        <div className="space-y-3">
          {MOCK_ANNOUNCEMENTS.map(ann => {
            const cfg = ANN_CFG[ann.type]
            const Icon = cfg.icon
            return (
              <div key={ann.id} className={cn(
                'bg-gray-800/60 border rounded-xl p-5',
                ann.is_active ? 'border-gray-700/50' : 'border-gray-800/50 opacity-60'
              )}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className={cn('inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-medium mt-0.5 shrink-0', cfg.cls)}>
                      <Icon className="w-2.5 h-2.5" /> {cfg.label}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-200">{ann.title}</p>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{ann.content}</p>
                      <p className="text-[10px] text-gray-500 mt-2">
                        {formatDate(ann.starts_at)}
                        {ann.ends_at && ` ~ ${formatDate(ann.ends_at)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full border font-medium',
                      ann.is_active
                        ? 'bg-green-500/15 text-green-400 border-green-500/30'
                        : 'bg-gray-700/30 text-gray-500 border-gray-700/30'
                    )}>
                      {ann.is_active ? '게시중' : '종료'}
                    </span>
                    <button className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-white/5">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          {MOCK_ANNOUNCEMENTS.length === 0 && (
            <div className="py-16 text-center">
              <Megaphone className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500">등록된 공지가 없습니다</p>
            </div>
          )}
        </div>
      )}

      {showAnnouncementModal && (
        <AnnouncementModal onClose={() => setShowAnnouncementModal(false)} />
      )}
    </div>
  )
}

// Pencil import 누락 방지
function Pencil({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  )
}
