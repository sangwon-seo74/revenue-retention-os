'use client'

import { useState } from 'react'
import {
  Package, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Tag, RefreshCw, Check, X
} from 'lucide-react'
import { cn, formatAmount } from '@/lib/utils'
import type { Product, BillingCycle } from '@/types/domain'

// ─── Mock 데이터 ──────────────────────────────────────────
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1', tenant_id: 'tn1', name: '고객관리 솔루션 Standard',
    category: 'CRM', unit_price: 150000, billing_cycle: 'monthly',
    description: '기본 고객관리 기능 포함. 최대 50개 계정.',
    is_active: true, created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'p2', tenant_id: 'tn1', name: '고객관리 솔루션 Pro',
    category: 'CRM', unit_price: 350000, billing_cycle: 'monthly',
    description: '고급 분석, 자동화 포함. 무제한 계정.',
    is_active: true, created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'p3', tenant_id: 'tn1', name: '연간 유지보수',
    category: '유지보수', unit_price: 1200000, billing_cycle: 'yearly',
    description: '연간 기술지원 및 업데이트 서비스.',
    is_active: true, created_at: '2024-02-01T00:00:00Z'
  },
  {
    id: 'p4', tenant_id: 'tn1', name: '구형 패키지',
    category: 'CRM', unit_price: 80000, billing_cycle: 'monthly',
    description: '단종 예정 레거시 제품.',
    is_active: false, created_at: '2023-01-01T00:00:00Z'
  },
]

const BILLING_LABEL: Record<BillingCycle, string> = {
  monthly: '월간', yearly: '연간'
}
const BILLING_CLASS: Record<BillingCycle, string> = {
  monthly: 'bg-blue-50 text-blue-700 border-blue-200',
  yearly: 'bg-violet-50 text-violet-700 border-violet-200',
}

const CATEGORIES = ['CRM', '유지보수', '교육', '컨설팅', '기타']

// ─── 제품 모달 ─────────────────────────────────────────────
function ProductModal({ product, onClose, onSave }: {
  product?: Product | null
  onClose: () => void
  onSave: (data: Partial<Product>) => void
}) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    category: product?.category ?? '',
    unit_price: product?.unit_price?.toString() ?? '',
    billing_cycle: (product?.billing_cycle ?? 'monthly') as BillingCycle,
    description: product?.description ?? '',
  })

  const handleChange = (k: string, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">
            {product ? '제품 편집' : '새 제품 추가'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">제품명 *</label>
            <input
              autoFocus value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="예: 고객관리 솔루션 Standard"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">카테고리</label>
              <select
                value={form.category}
                onChange={e => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택 안 함</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">결제 주기</label>
              <select
                value={form.billing_cycle}
                onChange={e => handleChange('billing_cycle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">월간</option>
                <option value="yearly">연간</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">단가 (원)</label>
            <input
              type="number" value={form.unit_price}
              onChange={e => handleChange('unit_price', e.target.value)}
              placeholder="150000"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">설명</label>
            <textarea
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={3}
              placeholder="제품에 대한 간략한 설명을 입력하세요"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            취소
          </button>
          <button
            onClick={() => {
              if (!form.name.trim()) return
              onSave({
                name: form.name,
                category: form.category || null,
                unit_price: Number(form.unit_price) || null,
                billing_cycle: form.billing_cycle,
                description: form.description || null,
              })
            }}
            disabled={!form.name.trim()}
            className="flex-1 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {product ? '저장' : '추가'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 제품 행 ──────────────────────────────────────────────
function ProductRow({ product, onEdit, onDelete, onToggle }: {
  product: Product
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  return (
    <div className={cn(
      'flex items-center gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors',
      !product.is_active && 'opacity-60'
    )}>
      {/* 아이콘 */}
      <div className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
        product.is_active ? 'bg-blue-50' : 'bg-gray-100'
      )}>
        <Package className={cn('w-4 h-4', product.is_active ? 'text-blue-500' : 'text-gray-400')} />
      </div>

      {/* 제품 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900">{product.name}</p>
          {product.category && (
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md">
              {product.category}
            </span>
          )}
          {!product.is_active && (
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-md border border-gray-200">
              비활성
            </span>
          )}
        </div>
        {product.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{product.description}</p>
        )}
      </div>

      {/* 금액 */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-gray-900">
          {product.unit_price ? formatAmount(product.unit_price) : '—'}
        </p>
        <span className={cn(
          'text-xs px-1.5 py-0.5 rounded-full border font-medium',
          BILLING_CLASS[product.billing_cycle]
        )}>
          {BILLING_LABEL[product.billing_cycle]}
        </span>
      </div>

      {/* 액션 */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onToggle}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            product.is_active
              ? 'text-green-500 hover:bg-green-50'
              : 'text-gray-300 hover:bg-gray-100'
          )}
          title={product.is_active ? '비활성화' : '활성화'}
        >
          {product.is_active
            ? <ToggleRight className="w-5 h-5" />
            : <ToggleLeft className="w-5 h-5" />
          }
        </button>
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── 메인 ────────────────────────────────────────────────
export default function ProductsSettingsPage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[]))]
  const filtered = filterCategory === 'all'
    ? products
    : products.filter(p => p.category === filterCategory)

  const activeCount = products.filter(p => p.is_active).length

  const handleSave = (data: Partial<Product>) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...data } : p))
    } else {
      const newProduct: Product = {
        id: `p${Date.now()}`, tenant_id: 'tn1',
        name: data.name!, category: data.category ?? null,
        unit_price: data.unit_price ?? null, billing_cycle: data.billing_cycle ?? 'monthly',
        description: data.description ?? null,
        is_active: true, created_at: new Date().toISOString()
      }
      setProducts(prev => [...prev, newProduct])
    }
    setShowModal(false)
    setEditingProduct(null)
  }

  const handleDelete = (id: string) => {
    if (!confirm('제품을 삭제하면 연결된 계약 데이터에 영향을 줄 수 있습니다. 계속할까요?')) return
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const handleToggle = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p))
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">제품 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">계약에 연결할 제품 및 서비스 목록을 관리합니다</p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setShowModal(true) }}
          className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-3.5 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> 제품 추가
        </button>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500">전체 제품</p>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-xs text-green-600">활성</p>
          <p className="text-2xl font-bold text-green-700">{activeCount}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500">비활성</p>
          <p className="text-2xl font-bold text-gray-500">{products.length - activeCount}</p>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border font-medium transition-colors',
              filterCategory === c
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-500 border-gray-200 hover:border-gray-300 bg-white'
            )}
          >
            {c === 'all' ? '전체' : c}
          </button>
        ))}
      </div>

      {/* 제품 목록 */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">등록된 제품이 없습니다</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700"
            >
              + 첫 번째 제품 추가
            </button>
          </div>
        ) : (
          filtered.map(p => (
            <ProductRow
              key={p.id} product={p}
              onEdit={() => { setEditingProduct(p); setShowModal(true) }}
              onDelete={() => handleDelete(p.id)}
              onToggle={() => handleToggle(p.id)}
            />
          ))
        )}
      </div>

      {/* 모달 */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => { setShowModal(false); setEditingProduct(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
