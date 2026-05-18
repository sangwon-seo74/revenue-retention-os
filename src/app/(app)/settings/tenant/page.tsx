'use client'

import { useState } from 'react'
import {
  Building2, Upload, Globe, Phone, Mail, MapPin,
  Shield, AlertTriangle, CheckCircle2, Pencil, Save, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Mock 데이터 ──────────────────────────────────────────
const MOCK_TENANT = {
  id: 't1',
  name: '(주)테크솔루션',
  biz_no: '123-45-67890',
  ceo_name: '김대표',
  industry: 'IT 서비스',
  website: 'https://techsolution.co.kr',
  phone: '02-1234-5678',
  email: 'contact@techsolution.co.kr',
  address: '서울시 강남구 테헤란로 123, 5층',
  logo_url: null as string | null,
  timezone: 'Asia/Seoul',
  locale: 'ko-KR',
  is_active: true,
  created_at: '2024-01-15T00:00:00Z',
}

const MOCK_STATS = {
  total_companies: 142,
  active_contracts: 98,
  total_users: 7,
  messages_this_month: 1284,
}

// ─── 섹션 컴포넌트 ────────────────────────────────────────
function SectionCard({
  title, icon: Icon, children,
  action
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function Field({ label, value, editing, name, onChange, type = 'text', placeholder }: {
  label: string
  value: string
  editing: boolean
  name: string
  onChange: (name: string, val: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={e => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      ) : (
        <p className="text-sm text-gray-800">{value || <span className="text-gray-400">미입력</span>}</p>
      )}
    </div>
  )
}

// ─── 메인 ────────────────────────────────────────────────
export default function TenantSettingsPage() {
  const [tenant, setTenant] = useState(MOCK_TENANT)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(MOCK_TENANT)
  const [saved, setSaved] = useState(false)

  const handleChange = (name: string, val: string) => {
    setDraft(prev => ({ ...prev, [name]: val }))
  }

  const handleSave = () => {
    setTenant(draft)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleCancel = () => {
    setDraft(tenant)
    setEditing(false)
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">조직 정보</h1>
          <p className="text-sm text-gray-500 mt-0.5">서비스에 표시되는 사업자 기본 정보를 관리합니다</p>
        </div>
        {saved && (
          <div className="flex items-center gap-1.5 text-green-600 text-sm bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
            <CheckCircle2 className="w-4 h-4" />
            저장되었습니다
          </div>
        )}
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '고객사', value: MOCK_STATS.total_companies },
          { label: '활성 계약', value: MOCK_STATS.active_contracts },
          { label: '사용자', value: MOCK_STATS.total_users },
          { label: '이번 달 발송', value: MOCK_STATS.messages_this_month.toLocaleString() },
        ].map(s => (
          <div key={s.label} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* 로고 */}
      <SectionCard title="로고" icon={Building2}>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
            {tenant.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tenant.logo_url} alt="logo" className="w-16 h-16 object-contain" />
            ) : (
              <Building2 className="w-8 h-8 text-gray-300" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">회사 로고</p>
            <p className="text-xs text-gray-400 mt-0.5">PNG, SVG 권장 · 최대 2MB · 정사각형 권장</p>
            <button className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
              <Upload className="w-3.5 h-3.5" />
              로고 업로드
            </button>
          </div>
        </div>
      </SectionCard>

      {/* 기본 정보 */}
      <SectionCard
        title="기본 정보"
        icon={Building2}
        action={
          editing ? (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <X className="w-3.5 h-3.5" /> 취소
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 text-xs text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1.5 rounded-lg"
              >
                <Save className="w-3.5 h-3.5" /> 저장
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <Pencil className="w-3.5 h-3.5" /> 편집
            </button>
          )
        }
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="상호명" value={editing ? draft.name : tenant.name}
            editing={editing} name="name" onChange={handleChange} placeholder="(주)회사명" />
          <Field label="사업자등록번호" value={editing ? draft.biz_no : tenant.biz_no}
            editing={editing} name="biz_no" onChange={handleChange} placeholder="000-00-00000" />
          <Field label="대표자명" value={editing ? draft.ceo_name : tenant.ceo_name}
            editing={editing} name="ceo_name" onChange={handleChange} />
          <Field label="업종" value={editing ? draft.industry : tenant.industry}
            editing={editing} name="industry" onChange={handleChange} />
        </div>
      </SectionCard>

      {/* 연락처 */}
      <SectionCard title="연락처" icon={Phone}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">대표 전화</label>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-sm text-gray-800">{tenant.phone}</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">이메일</label>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-sm text-gray-800">{tenant.email}</p>
            </div>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-500 mb-1 block">웹사이트</label>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-gray-400" />
              <a href={tenant.website} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline">{tenant.website}</a>
            </div>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-500 mb-1 block">주소</label>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-sm text-gray-800">{tenant.address}</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 지역/언어 */}
      <SectionCard title="지역 및 언어 설정" icon={Globe}>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">타임존</label>
            <select
              value={tenant.timezone}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Asia/Seoul">Asia/Seoul (KST, UTC+9)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST, UTC+9)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">언어</label>
            <select
              value={tenant.locale}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ko-KR">한국어 (KR)</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>
        </div>
      </SectionCard>

      {/* 위험 구역 */}
      <SectionCard title="위험 구역" icon={Shield}>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">데이터 초기화</p>
              <p className="text-xs text-amber-700 mt-0.5">모든 고객사, 계약, 활동 데이터가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.</p>
            </div>
            <button className="shrink-0 text-xs font-medium text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
              초기화 요청
            </button>
          </div>
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">서비스 해지</p>
              <p className="text-xs text-red-700 mt-0.5">계정과 모든 데이터가 영구적으로 삭제됩니다. 해지 후 30일간 데이터 복구 신청이 가능합니다.</p>
            </div>
            <button className="shrink-0 text-xs font-medium text-red-700 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
              해지 신청
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
