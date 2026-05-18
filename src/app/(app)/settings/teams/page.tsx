'use client'

import { useState } from 'react'
import {
  Users, Plus, Pencil, Trash2, ChevronRight,
  UserCircle2, Check, X, MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Team, User } from '@/types/domain'

// ─── Mock 데이터 ──────────────────────────────────────────
const MOCK_TEAMS: (Team & { member_count: number; manager_name: string | null })[] = [
  { id: 't1', tenant_id: 'tn1', name: '서울 영업팀', member_count: 4, manager_name: '김팀장', created_at: '2024-01-15T00:00:00Z' },
  { id: 't2', tenant_id: 'tn1', name: '경기 영업팀', member_count: 3, manager_name: '이팀장', created_at: '2024-02-01T00:00:00Z' },
  { id: 't3', tenant_id: 'tn1', name: '고객성공팀', member_count: 2, manager_name: null, created_at: '2024-03-10T00:00:00Z' },
]

const MOCK_MEMBERS: Record<string, Array<{ id: string; name: string; role: string; email: string }>> = {
  't1': [
    { id: 'u1', name: '김영업', role: 'manager', email: 'kim@example.com' },
    { id: 'u2', name: '이담당', role: 'sales', email: 'lee@example.com' },
    { id: 'u3', name: '박상담', role: 'sales', email: 'park@example.com' },
    { id: 'u4', name: '최영업', role: 'sales', email: 'choi@example.com' },
  ],
  't2': [
    { id: 'u5', name: '이팀장', role: 'manager', email: 'lee2@example.com' },
    { id: 'u6', name: '정영업', role: 'sales', email: 'jung@example.com' },
    { id: 'u7', name: '한담당', role: 'sales', email: 'han@example.com' },
  ],
  't3': [
    { id: 'u8', name: '신CS', role: 'sales', email: 'shin@example.com' },
    { id: 'u9', name: '오CS', role: 'sales', email: 'oh@example.com' },
  ],
}

const ROLE_LABEL: Record<string, string> = {
  admin: '관리자', manager: '팀장', sales: '영업'
}
const ROLE_CLASS: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
  manager: 'bg-blue-50 text-blue-700 border-blue-200',
  sales: 'bg-gray-50 text-gray-600 border-gray-200',
}

// ─── 팀 생성/편집 모달 ────────────────────────────────────
function TeamModal({ team, onClose, onSave }: {
  team?: typeof MOCK_TEAMS[0] | null
  onClose: () => void
  onSave: (name: string) => void
}) {
  const [name, setName] = useState(team?.name ?? '')
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">
          {team ? '팀 편집' : '새 팀 추가'}
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">팀 이름</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="예: 서울 영업팀"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            취소
          </button>
          <button
            onClick={() => { if (name.trim()) onSave(name.trim()) }}
            disabled={!name.trim()}
            className="flex-1 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {team ? '저장' : '추가'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 팀 카드 ──────────────────────────────────────────────
function TeamCard({
  team, selected, onSelect, onEdit, onDelete
}: {
  team: typeof MOCK_TEAMS[0]
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div
      onClick={onSelect}
      className={cn(
        'relative p-4 rounded-xl border cursor-pointer transition-all',
        selected
          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center',
            selected ? 'bg-blue-100' : 'bg-gray-100'
          )}>
            <Users className={cn('w-4 h-4', selected ? 'text-blue-600' : 'text-gray-500')} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{team.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {team.member_count}명 {team.manager_name ? `· ${team.manager_name}` : ''}
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
            className="p-1 rounded-lg hover:bg-gray-200 text-gray-400"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-10 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-28">
              <button
                onClick={e => { e.stopPropagation(); setMenuOpen(false); onEdit() }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="w-3.5 h-3.5" /> 편집
              </button>
              <button
                onClick={e => { e.stopPropagation(); setMenuOpen(false); onDelete() }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> 삭제
              </button>
            </div>
          )}
        </div>
      </div>
      {selected && (
        <div className="absolute top-3 right-9 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  )
}

// ─── 메인 ────────────────────────────────────────────────
export default function TeamsSettingsPage() {
  const [teams, setTeams] = useState(MOCK_TEAMS)
  const [selectedTeam, setSelectedTeam] = useState<string>(MOCK_TEAMS[0].id)
  const [showModal, setShowModal] = useState(false)
  const [editingTeam, setEditingTeam] = useState<typeof MOCK_TEAMS[0] | null>(null)

  const members = MOCK_MEMBERS[selectedTeam] ?? []
  const team = teams.find(t => t.id === selectedTeam)

  const handleAddTeam = (name: string) => {
    const newTeam = {
      id: `t${Date.now()}`, tenant_id: 'tn1', name,
      member_count: 0, manager_name: null, created_at: new Date().toISOString()
    }
    setTeams(prev => [...prev, newTeam])
    setShowModal(false)
  }

  const handleEditTeam = (name: string) => {
    setTeams(prev => prev.map(t => t.id === editingTeam?.id ? { ...t, name } : t))
    setEditingTeam(null)
  }

  const handleDeleteTeam = (id: string) => {
    if (!confirm('팀을 삭제하면 소속 멤버의 팀 정보가 해제됩니다. 계속할까요?')) return
    setTeams(prev => prev.filter(t => t.id !== id))
    if (selectedTeam === id) setSelectedTeam(teams[0]?.id ?? '')
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">팀 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">영업 조직 단위로 팀을 구성하고 멤버를 배정합니다</p>
        </div>
        <button
          onClick={() => { setEditingTeam(null); setShowModal(true) }}
          className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-3.5 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> 팀 추가
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* 팀 목록 */}
        <div className="col-span-2 space-y-2">
          {teams.map(t => (
            <TeamCard
              key={t.id}
              team={t}
              selected={selectedTeam === t.id}
              onSelect={() => setSelectedTeam(t.id)}
              onEdit={() => { setEditingTeam(t); setShowModal(true) }}
              onDelete={() => handleDeleteTeam(t.id)}
            />
          ))}
          {teams.length === 0 && (
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">팀이 없습니다</p>
            </div>
          )}
        </div>

        {/* 팀 상세 - 멤버 목록 */}
        <div className="col-span-3">
          {team && (
            <div className="bg-white border border-gray-200 rounded-xl h-full">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{team.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">멤버 {team.member_count}명</p>
                </div>
                <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 px-2.5 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50">
                  <Plus className="w-3.5 h-3.5" /> 멤버 추가
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {members.map(m => (
                  <div key={m.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                      {m.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-400 truncate">{m.email}</p>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full border font-medium',
                      ROLE_CLASS[m.role]
                    )}>
                      {ROLE_LABEL[m.role]}
                    </span>
                    <button className="p-1 text-gray-300 hover:text-red-400 rounded-lg hover:bg-red-50 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {members.length === 0 && (
                  <div className="py-12 text-center">
                    <UserCircle2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">멤버가 없습니다</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 모달 */}
      {showModal && (
        <TeamModal
          team={editingTeam}
          onClose={() => { setShowModal(false); setEditingTeam(null) }}
          onSave={editingTeam ? handleEditTeam : handleAddTeam}
        />
      )}
    </div>
  )
}
