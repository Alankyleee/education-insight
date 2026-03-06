import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '分类管理 - 后台' }

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  const categories = categoriesData as Array<{
    id: number; name: string; slug: string; icon: string | null
    parent_id: number | null; is_active: boolean
  }> | null

  const parents = categories?.filter(c => !c.parent_id) ?? []
  const getChildren = (id: number) => categories?.filter(c => c.parent_id === id) ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">分类管理</h1>
      </div>

      <div className="space-y-3">
        {parents.map((parent) => (
          <div key={parent.id} className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              {parent.icon && <span className="text-xl">{parent.icon}</span>}
              <span className="font-medium text-gray-900">{parent.name}</span>
              <span className="text-sm text-gray-400">/{parent.slug}</span>
              <Badge variant={parent.is_active ? 'default' : 'secondary'}>
                {parent.is_active ? '启用' : '禁用'}
              </Badge>
            </div>
            {getChildren(parent.id).length > 0 && (
              <div className="flex flex-wrap gap-2 ml-8">
                {getChildren(parent.id).map((child) => (
                  <div key={child.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm text-gray-600">
                    {child.icon && <span>{child.icon}</span>}
                    {child.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-400 mt-4">
        分类结构通过 SQL 迁移管理（supabase/migrations/003_seed_categories.sql）
      </p>
    </div>
  )
}
