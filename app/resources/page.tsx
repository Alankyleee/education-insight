import { Suspense } from 'react'
import { ResourceCard } from '@/components/resources/ResourceCard'
import { ResourceFilter } from '@/components/resources/ResourceFilter'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '资源导航' }

interface PageProps {
  searchParams: Promise<{ category?: string; sort?: string; page?: string; q?: string }>
}

export default async function ResourcesPage({ searchParams }: PageProps) {
  const { category, sort = 'newest', q } = await searchParams
  const supabase = await createClient()

  const [{ data: categories }, resourcesResult] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
    (async () => {
      let query = supabase
        .from('resources')
        .select('*, categories(name, slug)')
        .eq('is_approved', true)

      if (category) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', category)
          .single()
        if (cat) query = query.eq('category_id', cat.id)
      }

      if (q) {
        query = query.textSearch('search_vector', q, { type: 'websearch' })
      }

      if (sort === 'popular') query = query.order('view_count', { ascending: false })
      else if (sort === 'top-rated') query = query.order('avg_rating', { ascending: false })
      else query = query.order('created_at', { ascending: false })

      return query.limit(24)
    })(),
  ])

  const resources = resourcesResult.data ?? []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">资源导航</h1>
        <p className="text-gray-500 text-sm mt-1">
          共 {resources.length} 个资源{q ? `，搜索"${q}"` : ''}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filter */}
        <div className="hidden lg:block w-52 shrink-0">
          <Suspense>
            <ResourceFilter
              categories={categories ?? []}
              activeCategorySlug={category}
              activeSort={sort}
            />
          </Suspense>
        </div>

        {/* Resource grid */}
        <div className="flex-1">
          {resources.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg mb-2">暂无资源</p>
              <p className="text-sm">试试其他分类或搜索词</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource as any} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
