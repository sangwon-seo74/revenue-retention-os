'use client'

import { useState } from 'react'
import { MessageSquare, Plus, Mail, Phone, Star, Edit, Copy, Trash2 } from 'lucide-react'
import type { MessageTemplate } from '@/types/domain'

const MOCK_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tmpl1', tenant_id: 't1', name: '갱신 D-30 안내',
    channel: 'kakao', category: 'renewal',
    subject: null,
    content: '[갱신 안내] 안녕하세요 {company_name} {contact_name}님,\n\n이용 중인 서비스 계약이 {expires_at}에 만료될 예정입니다.\n\n원활한 서비스 이용을 위해 갱신 절차를 안내해 드리고자 연락드립니다.\n\n담당자: {sales_name} ({sales_phone})',
    variables: ['company_name', 'contact_name', 'expires_at', 'sales_name', 'sales_phone'],
    is_active: true, created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tmpl2', tenant_id: 't1', name: '갱신 제안서 발송',
    channel: 'email', category: 'renewal',
    subject: '[{company_name}] 서비스 갱신 제안서 안내',
    content: '안녕하세요 {contact_name}님,\n\n{company_name}과의 서비스 계약 갱신과 관련하여 제안서를 첨부해드립니다.\n\n갱신 기간: {start_at} ~ {expires_at}\n갱신 금액: {amount}원\n\n검토 후 연락 주시면 감사하겠습니다.',
    variables: ['company_name', 'contact_name', 'start_at', 'expires_at', 'amount'],
    is_active: true, created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tmpl3', tenant_id: 't1', name: '갱신 D-7 긴급 안내',
    channel: 'sms', category: 'renewal',
    subject: null,
    content: '[긴급] {company_name} 서비스 {expires_at} 만료 예정. 갱신 미처리 시 서비스 중단. 문의: {sales_phone}',
    variables: ['company_name', 'expires_at', 'sales_phone'],
    is_active: true, created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tmpl4', tenant_id: 't1', name: '신규 고객 인사',
    channel: 'email', category: 'intro',
    subject: '{company_name} 서비스 이용 안내',
    content: '안녕하세요 {contact_name}님,\n\n{company_name}의 서비스 가입을 진심으로 환영합니다!',
    variables: ['company_name', 'contact_name'],
    is_active: false, created_at: '2026-01-01T00:00:00Z',
  },
]

const CHANNEL_ICON: Record<string, React.ElementType> = {
  email: Mail, sms: Phone, kakao: MessageSquare,
}

const CHANNEL_CLASS: Record<string, string> = {
  email: 'bg-blue-50 text-blue-600 border-blue-200',
  sms: 'bg-green-50 text-green-600 border-green-200',
  kakao: 'bg-yellow-50 text-yellow-700 border-yellow-200',
}

const CHANNEL_LABEL: Record<string, string> = { email: '이메일', sms: '문자', kakao: '카카오' }

const CATEGORY_LABEL: Record<string, string> = {
  renewal: '갱신', intro: '인사', followup: '사후관리', custom: '커스텀',
}

function TemplateEditor({
  template, onClose,
}: {
  template?: MessageTemplate | null
  onClose: () => void
}) {
  const [channel, setChannel] = useState(template?.channel ?? 'kakao')
  const [content, setContent] = useState(template?.content ?? '')

  const VARS = ['company_name', 'contact_name', 'expires_at', 'amount', 'sales_name', 'sales_phone', 'start_at']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {template ? '템플릿 편집' : '템플릿 생성'}
          </h3>
          <button onClick={onClose} className="text-slate-400 text-xl">×</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">템플릿명 *</label>
              <input
                defaultValue={template?.name}
                placeholder="예: 갱신 D-30 안내"
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">채널 *</label>
              <select
                value={channel}
                onChange={e => setChannel(e.target.value as MessageTemplate['channel'])}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="kakao">카카오</option>
                <option value="email">이메일</option>
                <option value="sms">문자</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">카테고리</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="renewal">갱신</option>
                <option value="intro">인사</option>
                <option value="followup">사후관리</option>
                <option value="custom">커스텀</option>
              </select>
            </div>
            {channel === 'email' && (
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">이메일 제목</label>
                <input
                  defaultValue={template?.subject ?? ''}
                  placeholder="이메일 제목..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* 변수 삽입 버튼 */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">사용 가능한 변수</label>
            <div className="flex flex-wrap gap-1.5">
              {VARS.map(v => (
                <button
                  key={v}
                  onClick={() => setContent(c => c + `{${v}}`)}
                  className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors font-mono"
                >
                  {`{${v}}`}
                </button>
              ))}
            </div>
          </div>

          {/* 본문 */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">본문 *</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
              placeholder="메시지 내용..."
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">{content.length}자</p>
          </div>

          {/* 미리보기 */}
          {content && (
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">미리보기</label>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {content
                  .replace(/\{company_name\}/g, '삼성SDS')
                  .replace(/\{contact_name\}/g, '김철수')
                  .replace(/\{expires_at\}/g, '2026-06-01')
                  .replace(/\{sales_name\}/g, '홍길동')
                  .replace(/\{sales_phone\}/g, '010-1234-5678')
                  .replace(/\{amount\}/g, '24,000,000')
                }
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">취소</button>
          <button className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">저장</button>
        </div>
      </div>
    </div>
  )
}

export default function TemplatesSettingPage() {
  const [showEditor, setShowEditor] = useState<MessageTemplate | null | 'new'>(null)
  const [filterChannel, setFilterChannel] = useState('')

  const filtered = MOCK_TEMPLATES.filter(t =>
    !filterChannel || t.channel === filterChannel
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">메시지 템플릿</h2>
          <p className="text-sm text-slate-500 mt-0.5">갱신 안내, 인사 등 자주 쓰는 메시지 템플릿</p>
        </div>
        <button
          onClick={() => setShowEditor('new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          템플릿 생성
        </button>
      </div>

      {/* 채널 필터 */}
      <div className="flex gap-2">
        {[{ value: '', label: '전체' }, { value: 'kakao', label: '카카오' }, { value: 'email', label: '이메일' }, { value: 'sms', label: '문자' }].map(f => (
          <button
            key={f.value}
            onClick={() => setFilterChannel(f.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all
              ${filterChannel === f.value ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-500 border border-slate-200 hover:bg-slate-50 dark:border-slate-700'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 템플릿 목록 */}
      <div className="space-y-2">
        {filtered.map(tmpl => {
          const Icon = CHANNEL_ICON[tmpl.channel]
          return (
            <div key={tmpl.id} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 ${!tmpl.is_active ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tmpl.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CHANNEL_CLASS[tmpl.channel]}`}>
                      {CHANNEL_LABEL[tmpl.channel]}
                    </span>
                    {tmpl.category && (
                      <span className="text-xs text-slate-500">{CATEGORY_LABEL[tmpl.category]}</span>
                    )}
                    {!tmpl.is_active && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">비활성</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{tmpl.content}</p>
                  {tmpl.variables && tmpl.variables.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {tmpl.variables.slice(0, 4).map(v => (
                        <span key={v} className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded font-mono">{`{${v}}`}</span>
                      ))}
                      {tmpl.variables.length > 4 && (
                        <span className="text-[10px] text-slate-400">+{tmpl.variables.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 flex items-center gap-1">
                  <button
                    onClick={() => setShowEditor(tmpl)}
                    className="w-7 h-7 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button className="w-7 h-7 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button className="w-7 h-7 rounded-md hover:bg-red-50 dark:hover:bg-red-950 flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showEditor !== null && (
        <TemplateEditor
          template={showEditor === 'new' ? null : showEditor}
          onClose={() => setShowEditor(null)}
        />
      )}
    </div>
  )
}
