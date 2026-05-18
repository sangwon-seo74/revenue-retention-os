'use client'

import { useState } from 'react'
import {
  CheckSquare, Plus, Clock, AlertCircle, Building2,
  RefreshCw, Phone, Mail, MapPin, Star, Check,
} from 'lucide-react'
import {
  TASK_STATUS_LABEL, TASK_STATUS_CLASS, TASK_STATUS,
  TASK_PRIORITY_CLASS, TASK_TYPE_LABEL,
} from '@/constants/domain'
import { formatDate } from '@/lib/utils'
import type { Task } from '@/types/domain'

// ─── Mock 데이터 ──────────────────────────────────────────
const MOCK_TASKS: Task[] = [
  // 오늘 기한
  {
    id: 't1', tenant_id: 't1', assigned_user_id: 'u1',
    company_id: 'c3', contract_id: 'co3', renewal_id: 'r3', activity_id: null,
    title: '[갱신 D-7] SK C&C',
    description: '계약 만료 7일 전 갱신 확인 연락',
    type: 'renewal', priority: 'high', status: 'todo',
    due_at: new Date().toISOString(),
    done_at: null, is_auto: true, created_at: new Date().toISOString(),
    company: { id: 'c3', name: 'SK C&C' },
  },
  {
    id: 't2', tenant_id: 't1', assigned_user_id: 'u1',
    company_id: 'c2', contract_id: 'co2', renewal_id: null, activity_id: 'a1',
    title: '담당자 변경 후 재통화 - LG CNS',
    description: '이영희 팀장 → 새 담당자 확인 후 갱신 협의',
    type: 'call', priority: 'high', status: 'todo',
    due_at: new Date().toISOString(),
    done_at: null, is_auto: false, created_at: new Date().toISOString(),
    company: { id: 'c2', name: 'LG CNS' },
  },
  {
    id: 't3', tenant_id: 't1', assigned_user_id: 'u1',
    company_id: 'c1', contract_id: null, renewal_id: null, activity_id: null,
    title: '제안서 발송 - 삼성SDS',
    description: '업그레이드 제안서 (Standard→Pro) 이메일 발송',
    type: 'email', priority: 'medium', status: 'in_progress',
    due_at: new Date().toISOString(),
    done_at: null, is_auto: false, created_at: new Date().toISOString(),
    company: { id: 'c1', name: '삼성SDS' },
  },
  // 이번 주
  {
    id: 't4', tenant_id: 't1', assigned_user_id: 'u1',
    company_id: 'c5', contract_id: 'co5', renewal_id: 'r5', activity_id: null,
    title: '[갱신 D-14] KT DS',
    description: '계약 만료 14일 전 갱신 확인',
    type: 'renewal', priority: 'high', status: 'todo',
    due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    done_at: null, is_auto: true, created_at: new Date().toISOString(),
    company: { id: 'c5', name: 'KT DS' },
  },
  {
    id: 't5', tenant_id: 't1', assigned_user_id: 'u1',
    company_id: 'c5', contract_id: 'co5', renewal_id: null, activity_id: null,
    title: '방문 미팅 - KT DS',
    description: '이탈 방지 미팅 준비 (경쟁사 비교 자료 지참)',
    type: 'visit', priority: 'high', status: 'todo',
    due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    done_at: null, is_auto: false, created_at: new Date().toISOString(),
    company: { id: 'c5', name: 'KT DS' },
  },
  // 기한 초과
  {
    id: 't6', tenant_id: 't1', assigned_user_id: 'u1',
    company_id: 'c4', contract_id: 'co4', renewal_id: null, activity_id: null,
    title: '현대오토에버 갱신 계획 수립',
    description: '만료된 계약 갱신 여부 확인 및 재계약 계획 수립',
    type: 'manual', priority: 'medium', status: 'todo',
    due_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    done_at: null, is_auto: false, created_at: new Date().toISOString(),
    company: { id: 'c4', name: '현대오토에버' },
  },
  // 완료
  {
    id: 't7', tenant_id: 't1', assigned_user_id: 'u1',
    company_id: 'c1', contract_id: null, renewal_id: null, activity_id: null,
    title: '삼성SDS 담당자 연락처 업데이트',
    description: null,
    type: 'manual', priority: 'low', status: 'done',
    due_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    done_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    is_auto: false, created_at: new Date().toISOString(),
    company: { id: 'c1', name: '삼성SDS' },
  },
]

// ─── 업무 유형 아이콘 ────────────────────────────────────
function TaskTypeIcon({ type }: { type: string | null }) {
  switch (type) {
    case 'renewal': return <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
    case 'call': return <Phone className="w-3.5 h-3.5 text-green-500" />
    case 'email': return <Mail className="w-3.5 h-3.5 text-purple-500" />
    case 'visit': return <MapPin className="w-3.5 h-3.5 text-indigo-500" />
    default: return <Star className="w-3.5 h-3.5 text-slate-400" />
  }
}

// ─── 업무 카드 ────────────────────────────────────────────
function TaskCard({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const isOverdue = task.due_at && new Date(task.due_at) < new Date() && task.status !== 'done'
  const isDone = task.status === 'done'

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all
      ${isDone
        ? 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-60'
        : isOverdue
          ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
      }`}>

      {/* 완료 체크박스 */}
      <button
        onClick={() => onToggle(task.id)}
        className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-all
          ${isDone
            ? 'border-green-500 bg-green-500'
            : 'border-slate-300 hover:border-blue-500'
          }`}
      >
        {isDone && <Check className="w-3 h-3 text-white" />}
      </button>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex items-center gap-1.5">
            <TaskTypeIcon type={task.type} />
            <span className={`text-sm font-medium ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {task.title}
            </span>
          </div>
          {task.is_auto && (
            <span className="flex-shrink-0 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded text-[10px]">
              자동
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {task.company && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Building2 className="w-3 h-3" />
              {task.company.name}
            </span>
          )}
          {task.description && (
            <span className="text-xs text-slate-500 truncate max-w-xs">{task.description}</span>
          )}
        </div>
      </div>

      {/* 우측 정보 */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TASK_PRIORITY_CLASS[task.priority]}`}>
          {task.priority === 'high' ? '높음' : task.priority === 'medium' ? '보통' : '낮음'}
        </span>
        {task.due_at && (
          <span className={`text-xs font-mono ${isOverdue && !isDone ? 'text-red-600 font-semibold' : 'text-slate-400'}`}>
            {isOverdue && !isDone ? '⚠ ' : ''}{formatDate(task.due_at)}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── 업무 그룹 ────────────────────────────────────────────
function TaskGroup({
  title, tasks, icon, onToggle, defaultOpen = true,
}: {
  title: string
  tasks: Task[]
  icon: React.ReactNode
  onToggle: (id: string) => void
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  if (tasks.length === 0) return null

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 mb-2 w-full text-left"
      >
        {icon}
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{title}</span>
        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full">{tasks.length}</span>
        <span className="ml-auto text-xs text-slate-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="space-y-2">
          {tasks.map(t => <TaskCard key={t.id} task={t} onToggle={onToggle} />)}
        </div>
      )}
    </div>
  )
}

// ─── 업무 추가 모달 ──────────────────────────────────────
function AddTaskModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">업무 추가</h3>
          <button onClick={onClose} className="text-slate-400 text-xl">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">제목 *</label>
            <input placeholder="업무 내용..." className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">유형</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="manual">일반</option>
                <option value="call">통화</option>
                <option value="visit">방문</option>
                <option value="email">이메일</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">우선순위</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="high">높음</option>
                <option value="medium">보통</option>
                <option value="low">낮음</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">고객사</label>
            <input placeholder="고객사 검색..." className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">마감일</label>
            <input type="date" className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">메모</label>
            <textarea rows={2} placeholder="상세 내용..." className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">취소</button>
          <button className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">저장</button>
        </div>
      </div>
    </div>
  )
}

// ─── 메인 페이지 ──────────────────────────────────────────
export default function MyTasksPage() {
  const [tasks, setTasks] = useState(MOCK_TASKS)
  const [showModal, setShowModal] = useState(false)
  const [showDone, setShowDone] = useState(false)

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, status: t.status === 'done' ? 'todo' : 'done', done_at: t.status === 'done' ? null : new Date().toISOString() }
        : t
    ))
  }

  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const overdue = tasks.filter(t =>
    t.status !== 'done' && t.due_at && new Date(t.due_at) < startOfToday
  )
  const todayTasks = tasks.filter(t => {
    if (t.status === 'done') return false
    if (!t.due_at) return false
    const due = new Date(t.due_at)
    return due >= startOfToday && due <= today
  })
  const upcoming = tasks.filter(t => {
    if (t.status === 'done') return false
    if (!t.due_at) return false
    return new Date(t.due_at) > today
  })
  const done = tasks.filter(t => t.status === 'done')

  const completedToday = tasks.filter(t =>
    t.done_at && new Date(t.done_at) >= startOfToday
  ).length

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">내 할일</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            오늘 {todayTasks.length}개 남음 · {completedToday}개 완료
            {overdue.length > 0 && <span className="ml-2 text-red-600 font-medium">⚠ 기한초과 {overdue.length}개</span>}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          업무 추가
        </button>
      </div>

      {/* 진행 바 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">오늘 진행률</span>
          <span className="text-xs font-mono font-semibold text-blue-600">
            {completedToday} / {todayTasks.length + completedToday}
          </span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${todayTasks.length + completedToday > 0 ? Math.round(completedToday / (todayTasks.length + completedToday) * 100) : 0}%` }}
          />
        </div>
      </div>

      {/* 기한 초과 */}
      <TaskGroup
        title="기한 초과"
        tasks={overdue}
        icon={<AlertCircle className="w-4 h-4 text-red-500" />}
        onToggle={toggleTask}
      />

      {/* 오늘 */}
      <TaskGroup
        title="오늘"
        tasks={todayTasks}
        icon={<Clock className="w-4 h-4 text-blue-500" />}
        onToggle={toggleTask}
      />

      {/* 이번 주 */}
      <TaskGroup
        title="이번 주"
        tasks={upcoming}
        icon={<CheckSquare className="w-4 h-4 text-slate-500" />}
        onToggle={toggleTask}
      />

      {/* 완료 */}
      {done.length > 0 && (
        <div>
          <button
            onClick={() => setShowDone(!showDone)}
            className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide hover:text-slate-600"
          >
            <Check className="w-4 h-4" />
            완료됨 ({done.length})
            <span>{showDone ? '▲' : '▼'}</span>
          </button>
          {showDone && (
            <div className="space-y-2">
              {done.map(t => <TaskCard key={t.id} task={t} onToggle={toggleTask} />)}
            </div>
          )}
        </div>
      )}

      {showModal && <AddTaskModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
