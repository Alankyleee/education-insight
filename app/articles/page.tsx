import { ArticleCard } from '@/components/articles/ArticleCard'
import { CategoryNav } from '@/components/categories/CategoryNav'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '数据分析方法教程' }

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { category } = await searchParams
  const supabase = await createClient()

  const [{ data: categories }, articlesResult] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
    (async () => {
      let query = supabase
        .from('articles')
        .select('*, categories(name, slug)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (category) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', category)
          .single()
        if (cat) query = query.eq('category_id', cat.id)
      }

      return query.limit(20)
    })(),
  ])

  const articles = articlesResult.data ?? []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">数据分析方法教程</h1>
        <p className="text-gray-500 text-sm mt-1">涵盖统计分析、质性研究、SEM等教育研究方法介绍与指南</p>
      </div>

      <div className="mb-6 overflow-x-auto">
        <CategoryNav categories={categories ?? []} activeSlug={category} />
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">暂无文章</p>
          <p className="text-sm">敬请期待</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article as any} />
          ))}
        </div>
      )}
    </div>
  )
}
