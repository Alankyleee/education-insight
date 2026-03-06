import Link from 'next/link'
import { ArrowRight, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResourceCard } from '@/components/resources/ResourceCard'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: featuredResources }, { data: recentArticles }] =
    await Promise.all([
      supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .is('parent_id', null)
        .order('sort_order'),
      supabase
        .from('resources')
        .select('*, categories(name, slug)')
        .eq('is_approved', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('articles')
        .select('*, categories(name, slug)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(4),
    ])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            教育学资源导航
          </h1>
          <p className="text-lg text-blue-100 mb-8">
            整合期刊数据库、数据分析方法、学习平台等优质教育资源，助力教育研究与实践
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/resources">
                <Search className="h-4 w-4 mr-2" />
                浏览全部资源
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/submit">
                <Plus className="h-4 w-4 mr-2" />
                提交资源
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      {categories && categories.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">资源分类</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border bg-white hover:border-blue-300 hover:shadow-sm hover:bg-blue-50 transition-all text-center group"
              >
                <span className="text-2xl">{cat.icon ?? '📁'}</span>
                <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Resources */}
      {featuredResources && featuredResources.length > 0 && (
        <section className="container mx-auto px-4 py-8 border-t">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">精选资源</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/resources">
                查看全部 <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {featuredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource as any} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Articles */}
      {recentArticles && recentArticles.length > 0 && (
        <section className="container mx-auto px-4 py-8 border-t">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">数据分析方法</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/articles">
                查看全部 <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {recentArticles.map((article) => (
              <ArticleCard key={article.id} article={article as any} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state CTA */}
      {(!featuredResources?.length && !recentArticles?.length) && (
        <section className="container mx-auto px-4 py-16 text-center">
          <p className="text-gray-500 mb-4">暂无资源，欢迎第一个贡献！</p>
          <Button asChild>
            <Link href="/submit">提交第一个资源</Link>
          </Button>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gray-50 border-t py-12 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">发现了好资源？</h2>
          <p className="text-gray-500 mb-6">
            欢迎提交教育学相关优质资源，经审核后将展示在平台上，帮助更多研究者。
          </p>
          <Button asChild size="lg">
            <Link href="/submit">
              <Plus className="h-4 w-4 mr-2" />
              提交资源
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
