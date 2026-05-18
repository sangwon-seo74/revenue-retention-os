'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NewCompanyPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', biz_no: '', phone: '',
    industry: '', website: '', address_city: '', memo: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const canSubmit = form.name.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)

    // TODO: await fetch('/api/companies', { method: 'POST', body: JSON.stringify(form) })
    await new Promise(r => setTimeout(r, 600))

    setDone(true)
    setTimeout(() => router.push('/app/companies'), 800)
  }

  if (done) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-3">
      <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
        <CheckCircle2 className="w-6 h-6 text-green-600" />
      </div>
      <p className="text-sm font-semibold text-gray-800">고객사가 등록되었습니다</p>
      <p className="text-xs text-gray-400">고객사 목록으로 이동합니다...</p>
    </div>
  )

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app/companies"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900">고객사 등록</h1>
          <p className="text-xs text-gray-400 mt-0.5">* 필수 항목만 입력해도 등록됩니다</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 필수 3필드 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">필수 정보</h3>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              회사명 <span className="text-red-500">*</span>
            </label>
            <input autoFocus value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="(주)회사명"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">사업자등록번호</label>
            <input value={form.biz_no} onChange={e => set('biz_no', e.target.value)}
              placeholder="000-00-00000"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">대표 전화</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="02-0000-0000"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* 선택 정보 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">추가 정보 (선택)</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">업종</label>
              <input value={form.industry} onChange={e => set('industry', e.target.value)}
                placeholder="IT서비스, 제조업..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">지역</label>
              <input value={form.address_city} onChange={e => set('address_city', e.target.value)}
                placeholder="서울, 경기..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">웹사이트</label>
            <input value={form.website} onChange={e => set('website', e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">메모</label>
            <textarea value={form.memo} onChange={e => set('memo', e.target.value)}
              rows={3} placeholder="특이사항, 영업 배경..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/app/companies"
            className="flex-1 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 text-center">
            취소
          </Link>
          <button type="submit" disabled={!canSubmit || submitting}
            className="flex-1 py-2.5 text-sm text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />등록 중...</> : '고객사 등록'}
          </button>
        </div>
      </form>
    </div>
  )
}
