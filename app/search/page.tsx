import { ResourceCard } from '@/components/resources/ResourceCard'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { createClient } from '@/lib/supabase/server'
import { SearchBarStatic } from '@/components/search/SearchBarStatic'
import type { Metadata } from 'next'

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string }>
}

export function generateMetadata({ }: PageProps): Metadata {
  return { title: '搜索' }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, type } = await searchParams
  const query = q?.trim()

  let resources: any[] = []
  let articles: any[] = []

  if (query) {
    const supabase = await createClient()
    const [resResult, artResult] = await Promise.all([
      type === 'articles'
        ? { data: [] }
        : supabase
            .from('resources')
            .select('*, categories(name, slug)')
            .eq('is_approved', true)
            .textSearch('search_vector', query, { type: 'websearch' })
            .limit(12),
      type === 'resources'
        ? { data: [] }
        : supabase
            .from('articles')
            .select('*, categories(name, slug)')
            .eq('is_published', true)
            .textSearch('search_vector', query, { type: 'websearch' })
            .limit(8),
    ])
    resources = resResult.data ?? []
    articles = artResult.data ?? []
  }

  const total = resources.length + articles.length

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">搜索</h1>

      <div className="mb-8">
        <SearchBarStatic defaultValue={query} />
      </div>

      {query && (
        <div className="mb-4 text-sm text-gray-500">
          找到 <span className="font-medium text-gray-900">{total}</span> 个结果，搜索 "{query}"
        </div>
      )}

      {query && total === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">未找到相关结果</p>
          <p className="text-sm">尝试不同的关键词或缩短搜索词</p>
        </div>
      )}

      {resources.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">资源 ({resources.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resources.map((r) => <ResourceCard key={r.id} resource={r} />)}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">文章 ({articles.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        </section>
      )}

      {!query && (
        <div className="text-center py-16 text-gray-400">
          <p>输入关键词搜索资源和文章</p>
        </div>
      )}
    </div>
  )
}
