'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Category } from '@/lib/supabase/types'

interface ResourceFilterProps {
  categories: Category[]
  activeCategorySlug?: string
  activeSort?: string
}

const sortOptions = [
  { value: 'newest', label: '最新' },
  { value: 'popular', label: '最多访问' },
  { value: 'top-rated', label: '评分最高' },
]

export function ResourceFilter({ categories, activeCategorySlug, activeSort = 'newest' }: ResourceFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const parents = categories.filter((c) => !c.parent_id)

  return (
    <aside className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">排序</h3>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParam('sort', opt.value)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                activeSort === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">分类</h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => updateParam('category', null)}
            className={`text-left px-3 py-2 text-sm rounded-md transition-colors ${
              !activeCategorySlug ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            全部分类
          </button>
          {parents.map((parent) => {
            const children = categories.filter((c) => c.parent_id === parent.id)
            return (
              <div key={parent.id}>
                <button
                  onClick={() => updateParam('category', parent.slug)}
                  className={`text-left w-full px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-1.5 ${
                    activeCategorySlug === parent.slug ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {parent.icon && <span>{parent.icon}</span>}
                  {parent.name}
                </button>
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => updateParam('category', child.slug)}
                    className={`text-left w-full pl-7 pr-3 py-1.5 text-xs rounded-md transition-colors ${
                      activeCategorySlug === child.slug ? 'text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
